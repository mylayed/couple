import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { useMemo } from 'react';
import { AppState, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { compressPhoto, removePhotos, uploadPhoto, type Photo } from './photos';
import { FREE_PHOTOS, usePlus } from './plus';
import { StorageKeys, zustandStorage } from './storage';
import { deleteRow, saveRow, useRows, useSync, type Memory, type MemoryComment } from './sync';

// Стрічка спогадів: фото й підпис до дати.
// Спогад зберігається одразу (як решта даних, через чергу синхронізації), а фото
// завантажується окремо з повторами. Поки воно в дорозі, показуємо локальну копію;
// партнер побачить фото, коли в рядку з'являться шляхи до нього.

export const MAX_CAPTION = 1000;
export const MAX_MEMORY_COMMENT = 500;

// Повне фото для перегляду й мініатюра для стрічки
const FULL_SIDE = 1600;
const FULL_QUALITY = 0.75;
const THUMB_SIDE = 480;
const THUMB_QUALITY = 0.65;

// ─── Стрічка ─────────────────────────────────────────────────────────────────

const byNewest = (a: Memory, b: Memory) =>
  b.happened_on.localeCompare(a.happened_on) || b.created_at.localeCompare(a.created_at);

export function useMemories(): Memory[] {
  const memories = useRows('memories');
  return useMemo(() => [...memories].sort(byNewest), [memories]);
}

export type MemoryMonth = { key: string; year: number; month: number; items: Memory[] };

// Групи за місяцями, від нових до старих
export function groupByMonth(memories: Memory[]): MemoryMonth[] {
  const groups: MemoryMonth[] = [];
  for (const memory of memories) {
    const key = memory.happened_on.slice(0, 7);
    let group = groups.at(-1);
    if (group?.key !== key) {
      group = { key, year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1, items: [] };
      groups.push(group);
    }
    group.items.push(memory);
  }
  return groups;
}

export function useCommentCounts(): Map<string, number> {
  const comments = useRows('memory_comments');
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of comments) counts.set(c.memory_id, (counts.get(c.memory_id) ?? 0) + 1);
    return counts;
  }, [comments]);
}

export function useMemoryComments(memoryId: string): MemoryComment[] {
  const comments = useRows('memory_comments');
  return useMemo(
    () =>
      comments
        .filter((c) => c.memory_id === memoryId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [comments, memoryId],
  );
}

// Безкоштовно FREE_PHOTOS спогадів із фото, з Plus — без меж. Заміна фото в спогаді,
// де воно вже є, ліміт не зачіпає. Після завершення Plus усі фото лишаються.
export function useCanAddPhoto(): boolean {
  const plus = usePlus();
  const memories = useRows('memories');
  const pending = usePendingPhotos((s) => s.items);
  return useMemo(() => {
    if (plus) return true;
    const withPhoto = memories.filter((m) => m.photo_path || pending[m.id]).length;
    return withPhoto < FREE_PHOTOS;
  }, [plus, memories, pending]);
}

// ─── Запис ───────────────────────────────────────────────────────────────────

export async function createMemory(input: {
  happenedOn: string;
  caption: string;
  photo: Photo | null;
}): Promise<string | null> {
  const id = saveRow('memories', {
    happened_on: input.happenedOn,
    caption: input.caption.trim() || null,
    photo_path: null,
    thumb_path: null,
    photo_width: null,
    photo_height: null,
  });
  if (id && input.photo) await attachPhoto(id, input.photo);
  return id;
}

export function updateMemory(id: string, changes: { happenedOn: string; caption: string }): void {
  saveRow('memories', {
    id,
    happened_on: changes.happenedOn,
    caption: changes.caption.trim() || null,
  });
}

export function deleteMemory(memory: Memory): void {
  dropPending(memory.id);
  deleteRow('memories', memory.id);
  void removePhotos('memories', [memory.photo_path, memory.thumb_path]);
}

export function removeMemoryPhoto(memory: Memory): void {
  dropPending(memory.id);
  saveRow('memories', {
    id: memory.id,
    photo_path: null,
    thumb_path: null,
    photo_width: null,
    photo_height: null,
  });
  void removePhotos('memories', [memory.photo_path, memory.thumb_path]);
}

export function addMemoryComment(memoryId: string, body: string): void {
  saveRow('memory_comments', { memory_id: memoryId, body: body.trim() });
}

export function deleteMemoryComment(id: string): void {
  deleteRow('memory_comments', id);
}

// ─── Завантаження фото ───────────────────────────────────────────────────────

type PendingPhoto = {
  memoryId: string;
  coupleId: string;
  full: Photo;
  thumb: Photo;
  // Шляхи фіксуємо одразу, щоб повтори писали в той самий файл
  fullPath: string;
  thumbPath: string;
  attempts: number;
};

const usePendingPhotos = create<{ items: Record<string, PendingPhoto> }>()(
  persist(() => ({ items: {} }), {
    name: StorageKeys.pendingPhotos,
    storage: createJSONStorage(() => zustandStorage),
  }),
);

// Локальна копія фото, поки воно ще не на сервері
export function usePendingPhoto(memoryId: string): PendingPhoto | null {
  return usePendingPhotos((s) => s.items[memoryId] ?? null);
}

// Кеш застосунку система може почистити, тож до відправки тримаємо файли в документах
async function keepLocally(photo: Photo): Promise<Photo> {
  if (Platform.OS === 'web') return photo;
  const dir = new Directory(Paths.document, 'pending-photos');
  dir.create({ intermediates: true, idempotent: true });
  const file = new File(photo.uri);
  await file.move(dir);
  return { ...photo, uri: file.uri };
}

function deleteLocal(photo: Photo): void {
  if (Platform.OS === 'web') return;
  try {
    const file = new File(photo.uri);
    if (file.exists) file.delete();
  } catch {
    // ігноруємо
  }
}

function dropPending(memoryId: string): void {
  const pending = usePendingPhotos.getState().items[memoryId];
  if (!pending) return;
  deleteLocal(pending.full);
  deleteLocal(pending.thumb);
  usePendingPhotos.setState((s) => {
    const items = { ...s.items };
    delete items[memoryId];
    return { items };
  });
}

// Нове фото до спогаду: стискаємо, ставимо в чергу й одразу пробуємо відправити
export async function attachPhoto(memoryId: string, photo: Photo): Promise<void> {
  const coupleId = useSync.getState().coupleId;
  if (!coupleId) return;
  const [full, thumb] = await Promise.all([
    compressPhoto(photo, FULL_SIDE, FULL_QUALITY).then(keepLocally),
    compressPhoto(photo, THUMB_SIDE, THUMB_QUALITY).then(keepLocally),
  ]);
  // Нова версія в назві: старе фото не залишиться в кеші під тим самим ключем
  const base = `${coupleId}/${memoryId}-${randomUUID().slice(0, 8)}`;
  dropPending(memoryId);
  usePendingPhotos.setState((s) => ({
    items: {
      ...s.items,
      [memoryId]: {
        memoryId,
        coupleId,
        full,
        thumb,
        fullPath: `${base}.jpg`,
        thumbPath: `${base}_thumb.jpg`,
        attempts: 0,
      },
    },
  }));
  void processPhotos();
}

const MAX_ATTEMPTS = 5;
let processing = false;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRetry(): void {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void processPhotos();
  }, 30_000);
}

async function sendOne(pending: PendingPhoto): Promise<'ok' | 'retry' | 'failed'> {
  const thumb = await uploadPhoto('memories', pending.thumbPath, pending.thumb.uri);
  if (thumb !== 'ok') return thumb;
  return uploadPhoto('memories', pending.fullPath, pending.full.uri);
}

export async function processPhotos(): Promise<void> {
  if (processing) return;
  processing = true;
  let needsRetry = false;
  try {
    for (const pending of Object.values(usePendingPhotos.getState().items)) {
      const { coupleId, rows } = useSync.getState();
      const memory = rows.memories[pending.memoryId];
      // Спогад видалили або це дані іншої пари
      if (pending.coupleId !== coupleId || !memory || memory.deleted_at) {
        dropPending(pending.memoryId);
        continue;
      }

      const result = await sendOne(pending);
      // Поки йшло завантаження, фото могли замінити ще раз
      const current = usePendingPhotos.getState().items[pending.memoryId];
      if (current?.fullPath !== pending.fullPath) {
        void removePhotos('memories', [pending.fullPath, pending.thumbPath]);
        continue;
      }

      if (result === 'ok') {
        const latest = useSync.getState().rows.memories[pending.memoryId];
        saveRow('memories', {
          id: pending.memoryId,
          photo_path: pending.fullPath,
          thumb_path: pending.thumbPath,
          photo_width: pending.full.width,
          photo_height: pending.full.height,
        });
        dropPending(pending.memoryId);
        // Попереднє фото цього спогаду більше не потрібне
        if (latest) void removePhotos('memories', [latest.photo_path, latest.thumb_path]);
      } else if (result === 'retry' || pending.attempts + 1 < MAX_ATTEMPTS) {
        needsRetry = true;
        if (result === 'failed') {
          usePendingPhotos.setState((s) => ({
            items: {
              ...s.items,
              [pending.memoryId]: { ...pending, attempts: pending.attempts + 1 },
            },
          }));
        }
      } else {
        console.warn(`memories: фото ${pending.memoryId} не вдалося завантажити`);
        dropPending(pending.memoryId);
      }
    }
  } finally {
    processing = false;
  }
  if (needsRetry) scheduleRetry();
}

let started = false;

// Викликається один раз у кореневому layout: дочищає чергу після перезапуску чи без мережі
export function startPhotoUploads(): void {
  if (started) return;
  started = true;
  useSync.subscribe((s, prev) => {
    if (s.coupleId && s.coupleId !== prev.coupleId) void processPhotos();
  });
  AppState.addEventListener('change', (state) => {
    if (state === 'active') void processPhotos();
  });
  void processPhotos();
}
