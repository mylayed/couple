import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

type TreeProps = {
  // 0 — насінина … 7 — віковий дуб (див. TREE_STAGES у src/services/points.ts)
  stage: number;
  size: number;
};

const GROUND = 172;

// Висота стовбура для кожної стадії
const TRUNK = [0, 26, 44, 62, 74, 82, 88, 92];
// Кола крони відносно верхівки стовбура: зсув x, зсув y, радіус
const CROWN: [number, number, number][] = [
  [0, 0, 30],
  [-24, 10, 22],
  [24, 10, 22],
  [-14, -18, 22],
  [14, -18, 22],
  [-38, -2, 18],
  [38, -2, 18],
  [0, -34, 20],
];
const CROWN_COUNT = [0, 0, 0, 3, 5, 7, 8, 8];
const BLOSSOMS: [number, number][] = [
  [-30, 4],
  [-8, -26],
  [20, -6],
  [36, 12],
  [-18, 18],
  [6, 10],
  [28, -30],
  [-40, -14],
];
const HEARTS: [number, number][] = [
  [-20, 2],
  [16, 16],
  [4, -22],
  [-34, 18],
  [32, -8],
];

function heart(x: number, y: number, s: number): string {
  return [
    `M ${x} ${y + s * 0.4}`,
    `C ${x - s} ${y - s * 0.2} ${x - s * 0.5} ${y - s} ${x} ${y - s * 0.45}`,
    `C ${x + s * 0.5} ${y - s} ${x + s} ${y - s * 0.2} ${x} ${y + s * 0.4}`,
    'Z',
  ].join(' ');
}

// «Дерево стосунків»: росте разом із рівнем пари. Прості м'які форми в кольорах теми.
export function Tree({ stage, size }: TreeProps) {
  const { colors } = useTheme();
  const s = Math.max(0, Math.min(stage, TRUNK.length - 1));
  const top = GROUND - TRUNK[s];
  // Найстаріше дерево трохи ширше
  const scale = s === 7 ? 1.15 : 1;
  const trunkWidth = 6 + s * 1.6;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Ellipse cx={100} cy={GROUND + 6} rx={70} ry={12} fill={colors.success} fillOpacity={0.18} />

      {s === 0 ? (
        <G>
          <Ellipse cx={100} cy={GROUND - 2} rx={9} ry={6} fill={colors.textMuted} />
          <Path
            d={`M 100 ${GROUND - 7} q 4 -8 10 -9`}
            stroke={colors.success}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : null}

      {s === 1 || s === 2 ? (
        <G>
          <Line
            x1={100}
            y1={GROUND}
            x2={100}
            y2={top}
            stroke={colors.success}
            strokeWidth={s === 1 ? 3 : 4}
            strokeLinecap="round"
          />
          <Ellipse
            cx={90}
            cy={top + 6}
            rx={11}
            ry={6}
            fill={colors.success}
            transform={`rotate(-30 90 ${top + 6})`}
          />
          <Ellipse
            cx={110}
            cy={top + 6}
            rx={11}
            ry={6}
            fill={colors.success}
            transform={`rotate(30 110 ${top + 6})`}
          />
          {s === 2 ? (
            <>
              <Ellipse
                cx={89}
                cy={top + 24}
                rx={12}
                ry={6}
                fill={colors.success}
                fillOpacity={0.8}
                transform={`rotate(-25 89 ${top + 24})`}
              />
              <Ellipse
                cx={111}
                cy={top + 20}
                rx={12}
                ry={6}
                fill={colors.success}
                fillOpacity={0.8}
                transform={`rotate(25 111 ${top + 20})`}
              />
              <Ellipse cx={100} cy={top - 6} rx={6} ry={10} fill={colors.success} />
            </>
          ) : null}
        </G>
      ) : null}

      {s >= 3 ? (
        <G>
          <Path
            d={`M ${100 - trunkWidth} ${GROUND} L ${100 - trunkWidth * 0.5} ${top} L ${100 + trunkWidth * 0.5} ${top} L ${100 + trunkWidth} ${GROUND} Z`}
            fill={colors.textMuted}
          />
          {CROWN.slice(0, CROWN_COUNT[s]).map(([dx, dy, r], i) => (
            <Circle
              key={`c${i}`}
              cx={100 + dx * scale}
              cy={top - 14 + dy * scale}
              r={r * scale}
              fill={colors.success}
              fillOpacity={i % 2 === 0 ? 0.95 : 0.8}
            />
          ))}
          {s >= 5
            ? BLOSSOMS.slice(0, s === 5 ? 5 : BLOSSOMS.length).map(([dx, dy], i) => (
                <Circle
                  key={`b${i}`}
                  cx={100 + dx * scale}
                  cy={top - 14 + dy * scale}
                  r={3.5}
                  fill={colors.surface}
                  fillOpacity={0.9}
                />
              ))
            : null}
          {s >= 6
            ? HEARTS.slice(0, s === 6 ? 3 : HEARTS.length).map(([dx, dy], i) => (
                <Path
                  key={`h${i}`}
                  d={heart(100 + dx * scale, top - 14 + dy * scale, 8)}
                  fill={colors.primary}
                />
              ))
            : null}
        </G>
      ) : null}
    </Svg>
  );
}
