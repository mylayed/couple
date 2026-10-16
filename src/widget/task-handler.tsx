import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { readWidgetSnapshot } from './snapshot';
import { TogetherWidget, WIDGET_NAME } from './TogetherWidget';

// Фонова задача Android: віджет додали, змінили розмір або настав час планового оновлення
export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (widgetInfo.widgetName !== WIDGET_NAME) return;
  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(TogetherWidget({ snapshot: readWidgetSnapshot() }));
      break;
    default:
      break;
  }
}
