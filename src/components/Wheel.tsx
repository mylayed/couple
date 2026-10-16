import { useEffect, useImperativeHandle, type Ref } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export type WheelHandle = { spin: () => void };

type WheelProps = {
  options: string[];
  size: number;
  onResult: (index: number) => void;
  onSpinStart?: () => void;
  ref?: Ref<WheelHandle>;
};

const SPIN_MS = 3800;
const MAX_LABEL = 14;

const shorten = (label: string) =>
  label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL - 1).trimEnd()}…` : label;

// Точка на колі: кут у градусах від верху за годинниковою стрілкою
function point(c: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [c + r * Math.sin(rad), c - r * Math.cos(rad)];
}

// Колесо рулетки: сектори з підписами, стрілка зверху. Результат обирається заздалегідь
// випадково, а анімація лише докручує колесо до нього.
export function Wheel({ options, size, onResult, onSpinStart, ref }: WheelProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const spinning = useSharedValue(false);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  // Новий набір варіантів — колесо повертається на початок
  useEffect(() => {
    rotation.set(0);
  }, [options, rotation]);

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (spinning.get() || options.length < 2) return;
      const n = options.length;
      const slice = 360 / n;
      const index = Math.floor(Math.random() * n);
      // Під стрілкою має опинитися випадкова точка всередині сектора index
      const landing = index * slice + slice * (0.15 + Math.random() * 0.7);
      const current = rotation.get();
      const base = current - (((current % 360) + 360) % 360);
      const target = base + 360 * 6 + (360 - landing);
      spinning.set(true);
      onSpinStart?.();
      rotation.set(
        withTiming(target, { duration: SPIN_MS, easing: Easing.out(Easing.cubic) }, (finished) => {
          spinning.set(false);
          if (finished) scheduleOnRN(onResult, index);
        }),
      );
    },
  }));

  const c = size / 2;
  const r = c - 4;
  const n = options.length;
  const slice = 360 / Math.max(n, 1);
  const pointer = 14;

  return (
    <View style={{ width: size, height: size + pointer, alignItems: 'center' }}>
      <Animated.View style={[{ width: size, height: size, marginTop: pointer }, animatedStyle]}>
        <Svg width={size} height={size}>
          <Circle cx={c} cy={c} r={r + 2} fill={colors.surface} />
          {options.map((label, i) => {
            const [x0, y0] = point(c, r, i * slice);
            const [x1, y1] = point(c, r, (i + 1) * slice);
            const mid = i * slice + slice / 2;
            // При непарній кількості останній сектор не має збігатися з першим за кольором
            const lastOdd = n % 2 === 1 && i === n - 1;
            return (
              <G key={`${i}-${label}`}>
                <Path
                  d={`M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 ${slice > 180 ? 1 : 0} 1 ${x1} ${y1} Z`}
                  fill={i % 2 === 0 ? colors.primary : colors.secondary}
                  fillOpacity={lastOdd ? 0.65 : 1}
                  stroke={colors.surface}
                  strokeWidth={2}
                />
                <SvgText
                  x={c + r - 12}
                  y={c + 5}
                  textAnchor="end"
                  fill={colors.onPrimary}
                  fontFamily={fonts.bodyBold}
                  fontSize={n > 8 ? 12 : 14}
                  transform={`rotate(${mid - 90} ${c} ${c})`}
                >
                  {shorten(label)}
                </SvgText>
              </G>
            );
          })}
          <Circle cx={c} cy={c} r={size * 0.07} fill={colors.surface} />
        </Svg>
      </Animated.View>
      <Svg width={pointer * 2} height={pointer * 1.6} style={{ position: 'absolute', top: 0 }}>
        <Polygon
          points={`0,0 ${pointer * 2},0 ${pointer},${pointer * 1.6}`}
          fill={colors.text}
          stroke={colors.surface}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}
