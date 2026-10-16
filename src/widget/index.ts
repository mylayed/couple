import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { useSync } from '@/services/sync';
import { selectIsPaired, useCouple } from '@/store/couple';
import { readWidgetSnapshot, writeWidgetSnapshot, type WidgetSnapshot } from './snapshot';
import { TogetherWidget, WIDGET_NAME } from './TogetherWidget';

function currentSnapshot(): WidgetSnapshot | null {
  const coupleState = useCouple.getState();
  if (!selectIsPaired(coupleState)) return null;
  const { rows } = useSync.getState();

  // Найсвіжіша відмітка «Коли ми востаннє…»
  let last: { momentId: string; on: string } | null = null;
  for (const log of Object.values(rows.moment_logs)) {
    if (log.deleted_at || rows.moments[log.moment_id]?.deleted_at) continue;
    if (!last || log.happened_on > last.on) last = { momentId: log.moment_id, on: log.happened_on };
  }
  const moment = last ? rows.moments[last.momentId] : undefined;

  return {
    since: coupleState.couple?.started_on ?? coupleState.pairedAt,
    partnerName: coupleState.partner?.name ?? null,
    lastMoment: last && moment ? { title: moment.title, on: last.on } : null,
  };
}

async function updateWidget(): Promise<void> {
  const snapshot = currentSnapshot();
  if (JSON.stringify(snapshot) === JSON.stringify(readWidgetSnapshot())) return;
  writeWidgetSnapshot(snapshot);
  try {
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => TogetherWidget({ snapshot }),
    });
  } catch (e) {
    // Стара збірка без нативного модуля: віджет просто не оновиться
    console.warn('widget: не вдалося оновити', e);
  }
}

let started = false;
let timer: ReturnType<typeof setTimeout> | null = null;

function scheduleUpdate(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void updateWidget();
  }, 1000);
}

// Викликається один раз у кореневому layout
export function startWidgetUpdates(): void {
  if (started || Platform.OS !== 'android') return;
  started = true;
  useSync.subscribe((s, prev) => {
    if (s.rows.moments !== prev.rows.moments || s.rows.moment_logs !== prev.rows.moment_logs) {
      scheduleUpdate();
    }
  });
  useCouple.subscribe(scheduleUpdate);
  scheduleUpdate();
}
