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

// Дата народження вводиться як ДД.ММ.РРРР, а в базі зберігається як YYYY-MM-DD
export function parseUkDate(raw: string): string | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw.trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const valid =
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d &&
    y > 1900 &&
    date.getTime() <= Date.now();
  if (!valid) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function formatUkDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}
