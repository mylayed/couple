const DAY_MS = 24 * 60 * 60 * 1000;

// Кількість повних днів між датами за календарем (без впливу годин і переходу на літній час)
export function daysBetween(from: Date, to: Date = new Date()): number {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((end - start) / DAY_MS);
}

// YYYY-MM-DD із бази — календарна дата, а не момент часу, тому читаємо її в локальному часі
export function parseIsoDate(iso: string): Date {
  if (iso.length !== 10) return new Date(iso);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Українські форми множини: 1 день, 2 дні, 5 днів
export function pluralUk(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

// Календарна дата в локальному часі як YYYY-MM-DD
export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Цей місяць і день у вказаному році; 29 лютого в невисокосний рік стає 28-м
function inYear(source: Date, year: number): Date {
  const date = new Date(year, source.getMonth(), source.getDate());
  return date.getMonth() === source.getMonth() ? date : new Date(year, source.getMonth() + 1, 0);
}

// Найближча річниця дати, починаючи з сьогодні включно
export function nextOccurrence(iso: string, from: Date = new Date()): Date {
  const source = parseIsoDate(iso);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const thisYear = inYear(source, today.getFullYear());
  return thisYear >= today ? thisYear : inYear(source, today.getFullYear() + 1);
}

// Скільки повних років, місяців і днів минуло
export function durationParts(from: Date, to: Date = new Date()) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function formatDuration({ years, months, days }: ReturnType<typeof durationParts>): string {
  const parts = [
    years ? `${years} ${pluralUk(years, ['рік', 'роки', 'років'])}` : '',
    months ? `${months} ${pluralUk(months, ['місяць', 'місяці', 'місяців'])}` : '',
    days ? `${days} ${pluralUk(days, ['день', 'дні', 'днів'])}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : 'Сьогодні ваш перший день';
}

const MONTHS_NOMINATIVE = [
  'Січень',
  'Лютий',
  'Березень',
  'Квітень',
  'Травень',
  'Червень',
  'Липень',
  'Серпень',
  'Вересень',
  'Жовтень',
  'Листопад',
  'Грудень',
];

// «Жовтень 2026»; month з 0
export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_NOMINATIVE[month]} ${year}`;
}

export function monthName(month: number): string {
  return MONTHS_NOMINATIVE[month];
}

const MONTHS_GENITIVE = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

// «14 лютого» або «14 лютого 2020»
export function formatDayMonth(date: Date, withYear = false): string {
  const base = `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
  return withYear ? `${base} ${date.getFullYear()}` : base;
}

// «сьогодні», «вчора», «5 днів тому»
export function formatDaysAgo(days: number): string {
  if (days <= 0) return 'сьогодні';
  if (days === 1) return 'вчора';
  return `${days} ${pluralUk(days, ['день', 'дні', 'днів'])} тому`;
}

// «сьогодні», «завтра», «через 5 днів»
export function formatDaysLeft(days: number): string {
  if (days <= 0) return 'сьогодні';
  if (days === 1) return 'завтра';
  return `через ${days} ${pluralUk(days, ['день', 'дні', 'днів'])}`;
}

// Порядковий номер річниці: 1-ша, 2-га, 3-тя, 7-ма, 40-ва, решта -та
export function formatOrdinal(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 19) return `${n}-та`;
  if (mod100 === 40) return `${n}-ва`;
  const suffix = { 1: 'ша', 2: 'га', 3: 'тя', 7: 'ма', 8: 'ма' }[mod10] ?? 'та';
  return `${n}-${suffix}`;
}

// «щойно», «5 хв тому», «3 год тому», далі як formatDaysAgo
export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - Date.parse(iso)) / 60_000);
  if (minutes < 1) return 'щойно';
  if (minutes < 60) return `${minutes} хв тому`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;
  return formatDaysAgo(daysBetween(new Date(iso), now));
}
