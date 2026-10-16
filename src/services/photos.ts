import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { StorageKeys, zustandStorage } from './storage';
import { supabase } from './supabase';

// Фото в Supabase Storage. Обидва бакети приватні (міграція 20261021120000_memories.sql),
// тож показуємо їх за підписаними посиланнями. Посилання кешуються в MMKV, а саме фото —
// у дисковому кеші expo-image за ключем шляху, тому відкриваються і без мережі.

export type PhotoBucket = 'memories' | 'avatars';

export type Photo = { uri: string; width: number; height: number };

// Галерея; square обрізає під аватар
export async function pickPhoto({
  square = false,
}: { square?: boolean } = {}): Promise<Photo | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: square,
    aspect: [1, 1],
    quality: 1,
  });
  if (result.canceled || !result.assets[0]) return null;
  const { uri, width, height } = result.assets[0];
  return { uri, width, height };
}

// Стискає в JPEG так, щоб довша сторона була не більше maxSide
export async function compressPhoto(
  photo: Photo,
  maxSide: number,
  compress: number,
): Promise<Photo> {
  const context = ImageManipulator.manipulate(photo.uri);
  // Розмір може бути невідомим (0): тоді просто обмежуємо ширину
  if (!photo.width || !photo.height || Math.max(photo.width, photo.height) > maxSide) {
    context.resize(
      photo.width >= photo.height
        ? { width: maxSide, height: null }
        : { width: null, height: maxSide },
    );
  }
  const image = await context.renderAsync();
  try {
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress });
    return { uri: saved.uri, width: saved.width, height: saved.height };
  } finally {
    image.release();
    context.release();
  }
}

async function readBytes(uri: string): Promise<ArrayBuffer | Uint8Array> {
  // У вебі (лише для розробки) expo-file-system немає, а uri — це blob
  if (Platform.OS === 'web') return (await fetch(uri)).arrayBuffer();
  return new File(uri).bytes();
}

// Мережа, сервер чи прострочений токен: варто повторити пізніше
export type UploadResult = 'ok' | 'retry' | 'failed';

export async function uploadPhoto(
  bucket: PhotoBucket,
  path: string,
  uri: string,
): Promise<UploadResult> {
  let body: ArrayBuffer | Uint8Array;
  try {
    body = await readBytes(uri);
  } catch {
    // Локальний файл зник: повторювати немає сенсу
    return 'failed';
  }
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, body, { contentType: 'image/jpeg', upsert: true });
    if (!error) return 'ok';
    const status = Number((error as { statusCode?: string | number }).statusCode ?? 0);
    return status === 0 || status === 401 || status === 429 || status >= 500 ? 'retry' : 'failed';
  } catch {
    return 'retry';
  }
}

// Прибирання не має зривати основну дію: файли без власника приберуться разом із парою
export async function removePhotos(bucket: PhotoBucket, paths: (string | null)[]): Promise<void> {
  const existing = paths.filter((p): p is string => !!p && !isExternal(p));
  if (existing.length === 0) return;
  try {
    await supabase.storage.from(bucket).remove(existing);
  } catch {
    // ігноруємо
  }
}

// Усі файли в теці: фото пари при роз'єднанні, аватари при видаленні акаунта
export async function removeFolder(bucket: PhotoBucket, folder: string): Promise<void> {
  try {
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
      if (error || !data || data.length === 0) return;
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove(data.map((f) => `${folder}/${f.name}`));
      if (removeError || data.length < 1000) return;
    }
  } catch {
    // ігноруємо
  }
}

// Аватар із Google тощо — уже готове посилання, а не шлях у Storage
const isExternal = (path: string) => /^https?:\/\//.test(path);

// ─── Підписані посилання ─────────────────────────────────────────────────────

const SIGN_SECONDS = 7 * 24 * 60 * 60;
// Оновлюємо заздалегідь, щоб посилання не прострочилось просто на екрані
const REFRESH_BEFORE_MS = 24 * 60 * 60 * 1000;
// Файлу ще немає (партнер досі завантажує): не смикаємо сервер щосекунди
const FAILED_RETRY_MS = 15_000;

type Signed = { url: string; expires: number };

const useSignedUrls = create<{ urls: Record<string, Signed> }>()(
  persist(() => ({ urls: {} }), {
    name: StorageKeys.photoUrls,
    storage: createJSONStorage(() => zustandStorage),
  }),
);

const keyOf = (bucket: PhotoBucket, path: string) => `${bucket}/${path}`;

const queued: Record<PhotoBucket, Set<string>> = { memories: new Set(), avatars: new Set() };
const inFlight = new Set<string>();
const failedAt = new Map<string, number>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function signBucket(bucket: PhotoBucket, paths: string[]): Promise<void> {
  const keys = paths.map((p) => keyOf(bucket, p));
  for (const key of keys) inFlight.add(key);
  try {
    const { data } = await supabase.storage.from(bucket).createSignedUrls(paths, SIGN_SECONDS);
    const expires = Date.now() + SIGN_SECONDS * 1000;
    const next: Record<string, Signed> = {};
    for (const item of data ?? []) {
      if (item.path && item.signedUrl && !item.error)
        next[keyOf(bucket, item.path)] = { url: item.signedUrl, expires };
    }
    for (const key of keys) if (!next[key]) failedAt.set(key, Date.now());
    if (Object.keys(next).length > 0) {
      useSignedUrls.setState((s) => ({ urls: { ...s.urls, ...next } }));
    }
  } catch {
    for (const key of keys) failedAt.set(key, Date.now());
  } finally {
    for (const key of keys) inFlight.delete(key);
  }
}

// Запити з кількох мініатюр на екрані збираємо в один
function requestSign(bucket: PhotoBucket, path: string): void {
  const key = keyOf(bucket, path);
  if (inFlight.has(key) || Date.now() - (failedAt.get(key) ?? 0) < FAILED_RETRY_MS) return;
  queued[bucket].add(path);
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    for (const b of Object.keys(queued) as PhotoBucket[]) {
      const paths = [...queued[b]];
      queued[b].clear();
      if (paths.length > 0) void signBucket(b, paths);
    }
  }, 30);
}

export type PhotoSource = { uri: string; cacheKey?: string } | null;

// Джерело для expo-image. Прострочене посилання все одно повертаємо: без мережі
// фото візьметься з дискового кешу за cacheKey
export function usePhotoSource(bucket: PhotoBucket, path: string | null): PhotoSource {
  const external = path !== null && isExternal(path);
  const key = path && !external ? keyOf(bucket, path) : null;
  const signed = useSignedUrls((s) => (key ? s.urls[key] : undefined));

  useEffect(() => {
    if (!key || !path) return;
    if (!signed || signed.expires - Date.now() < REFRESH_BEFORE_MS) requestSign(bucket, path);
  }, [bucket, path, key, signed]);

  if (!path) return null;
  if (external) return { uri: path };
  return signed ? { uri: signed.url, cacheKey: key ?? undefined } : null;
}

// Інший акаунт чи інша пара на цьому телефоні: старі посилання не потрібні
export function clearPhotoUrls(): void {
  useSignedUrls.setState({ urls: {} });
  failedAt.clear();
}
