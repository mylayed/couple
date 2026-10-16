import { useMemo } from 'react';

import {
  deleteRow,
  saveRow,
  useRows,
  type BucketItem,
  type ListItem,
  type ListKind,
  type SharedList,
} from './sync';

// Спільні плани: бакет-ліст пари та списки (фільми, ресторани, подарунки, покупки)

export const MAX_ITEM_TITLE = 120;
export const MAX_LIST_TITLE = 60;
export const MAX_BUCKET_NOTE = 500;

// Незроблене спершу (нове вгорі), зроблене внизу (останнє зроблене вгорі)
function byDone<T extends { done_at: string | null; created_at: string }>(
  items: T[],
  openOrder: 'newest' | 'oldest',
): { open: T[]; done: T[] } {
  const open = items
    .filter((i) => !i.done_at)
    .sort((a, b) =>
      openOrder === 'newest'
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );
  const done = items
    .filter((i) => i.done_at)
    .sort((a, b) => (b.done_at as string).localeCompare(a.done_at as string));
  return { open, done };
}

// ─── Бакет-ліст ──────────────────────────────────────────────────────────────

export function useBucketList(): { open: BucketItem[]; done: BucketItem[] } {
  const items = useRows('bucket_items');
  return useMemo(() => byDone(items, 'newest'), [items]);
}

export function addBucketItem(title: string, note: string | null = null): string | null {
  return saveRow('bucket_items', {
    title: title.trim(),
    note: note?.trim() || null,
    done_at: null,
  });
}

export function updateBucketItem(id: string, title: string, note: string | null): void {
  saveRow('bucket_items', { id, title: title.trim(), note: note?.trim() || null });
}

export function setBucketDone(id: string, done: boolean): void {
  saveRow('bucket_items', { id, done_at: done ? new Date().toISOString() : null });
}

export function deleteBucketItem(id: string): void {
  deleteRow('bucket_items', id);
}

// ─── Списки ──────────────────────────────────────────────────────────────────

export const LIST_KINDS: { kind: ListKind; title: string; placeholder: string }[] = [
  { kind: 'movies', title: 'Фільми', placeholder: 'Назва фільму чи серіалу' },
  { kind: 'restaurants', title: 'Ресторани', placeholder: 'Куди хочемо сходити' },
  { kind: 'gifts', title: 'Подарунки', placeholder: 'Ідея подарунка рідним чи друзям' },
  { kind: 'shopping', title: 'Покупки', placeholder: 'Що купити' },
  { kind: 'other', title: 'Інше', placeholder: 'Новий пункт' },
];

export const listKindInfo = (kind: ListKind) =>
  LIST_KINDS.find((k) => k.kind === kind) ?? LIST_KINDS[LIST_KINDS.length - 1];

export type ListSummary = SharedList & { openCount: number; doneCount: number };

export function useListSummaries(): ListSummary[] {
  const lists = useRows('lists');
  const items = useRows('list_items');
  return useMemo(() => {
    const open = new Map<string, number>();
    const done = new Map<string, number>();
    for (const item of items) {
      const counter = item.done_at ? done : open;
      counter.set(item.list_id, (counter.get(item.list_id) ?? 0) + 1);
    }
    return lists
      .map((l) => ({ ...l, openCount: open.get(l.id) ?? 0, doneCount: done.get(l.id) ?? 0 }))
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [lists, items]);
}

export function useListItems(listId: string): { open: ListItem[]; done: ListItem[] } {
  const items = useRows('list_items');
  return useMemo(
    () =>
      byDone(
        items.filter((i) => i.list_id === listId),
        'oldest',
      ),
    [items, listId],
  );
}

export function saveList(input: { title: string; kind: ListKind }, id?: string): string | null {
  return saveRow('lists', { ...(id ? { id } : {}), title: input.title.trim(), kind: input.kind });
}

export function deleteList(id: string): void {
  deleteRow('lists', id);
}

export function addListItem(listId: string, title: string): string | null {
  return saveRow('list_items', { list_id: listId, title: title.trim(), done_at: null });
}

export function setListItemDone(id: string, done: boolean): void {
  saveRow('list_items', { id, done_at: done ? new Date().toISOString() : null });
}

export function deleteListItem(id: string): void {
  deleteRow('list_items', id);
}

// Наприклад, після походу в магазин
export function clearDoneItems(items: ListItem[]): void {
  for (const item of items) if (item.done_at) deleteRow('list_items', item.id);
}
