import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { darkColors, lightColors, type Colors } from '@/theme/tokens';
import { daysBetween, formatDaysAgo, parseIsoDate, pluralUk } from '@/utils/dates';
import type { WidgetSnapshot } from './snapshot';

export const WIDGET_NAME = 'Together';

// Віджет приймає лише шістнадцяткові кольори
type Hex = `#${string}`;
const hex = (color: string) => color as Hex;

function Layout({ snapshot, colors }: { snapshot: WidgetSnapshot | null; colors: Colors }) {
  const days = snapshot?.since ? daysBetween(parseIsoDate(snapshot.since)) : null;
  const last = snapshot?.lastMoment;
  const lastLine = last
    ? `${last.title}: ${formatDaysAgo(daysBetween(parseIsoDate(last.on)))}`
    : snapshot?.partnerName
      ? `Ти і ${snapshot.partnerName}`
      : 'Відкрий Dotyk, щоб почати';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={days !== null ? `${days} днів разом` : 'Dotyk'}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 24,
        backgroundGradient: {
          from: hex(colors.gradient[0]),
          to: hex(colors.gradient[1]),
          orientation: 'TL_BR',
        },
      }}
    >
      <TextWidget
        text={days !== null ? String(days) : '💞'}
        style={{ fontSize: 40, fontFamily: 'Unbounded_700Bold', color: hex(colors.onPrimary) }}
      />
      <TextWidget
        text={days !== null ? `${pluralUk(days, ['день', 'дні', 'днів'])} разом` : 'Dotyk'}
        style={{ fontSize: 14, fontFamily: 'Manrope_500Medium', color: hex(colors.onPrimary) }}
      />
      <TextWidget
        text={lastLine}
        maxLines={1}
        truncate="END"
        style={{
          marginTop: 8,
          fontSize: 12,
          fontFamily: 'Manrope_500Medium',
          color: hex(`${colors.onPrimary}CC`),
        }}
      />
    </FlexWidget>
  );
}

export function TogetherWidget({ snapshot }: { snapshot: WidgetSnapshot | null }) {
  return {
    light: <Layout snapshot={snapshot} colors={lightColors} />,
    dark: <Layout snapshot={snapshot} colors={darkColors} />,
  };
}
