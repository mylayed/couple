import { useMemo } from 'react';

import { useAuth } from '@/store/auth';
import { storage, StorageKeys } from './storage';
import { deleteRow, saveRow, useRows, type Note, type TouchKind } from './sync';

// Листівки: тепле повідомлення партнеру. Отримувач бачить конверт і відкриває його сам.

export type NoteStyle = Note['style'];

export const NOTE_STYLES: NoteStyle[] = ['rose', 'violet', 'mint', 'dawn'];

export const MAX_NOTE = 500;

export function useNotes(): { inbox: Note[]; sent: Note[]; unopened: Note[] } {
  const notes = useRows('notes');
  const userId = useAuth((s) => s.session?.user.id);
  return useMemo(() => {
    const sorted = [...notes].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const inbox = sorted.filter((n) => n.created_by !== userId);
    return {
      inbox,
      sent: sorted.filter((n) => n.created_by === userId),
      unopened: inbox.filter((n) => !n.opened_at),
    };
  }, [notes, userId]);
}

export function sendNote(body: string, style: NoteStyle): string | null {
  const id = saveRow('notes', { body: body.trim(), style, opened_at: null, reaction: null });
  if (id) clearNoteDraft();
  return id;
}

export function openNote(note: Note): void {
  if (note.opened_at) return;
  saveRow('notes', { id: note.id, opened_at: new Date().toISOString() });
}

export function reactToNote(note: Note, reaction: TouchKind | null): void {
  saveRow('notes', { id: note.id, reaction });
}

export function deleteNote(id: string): void {
  deleteRow('notes', id);
}

// Чернетка живе лише на телефоні, щоб недописана листівка не губилась
type Draft = { body: string; style: NoteStyle };

export function loadNoteDraft(): Draft | null {
  const raw = storage.getString(StorageKeys.noteDraft);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

export function saveNoteDraft(draft: Draft): void {
  if (draft.body.trim()) storage.set(StorageKeys.noteDraft, JSON.stringify(draft));
  else clearNoteDraft();
}

export function clearNoteDraft(): void {
  storage.remove(StorageKeys.noteDraft);
}
