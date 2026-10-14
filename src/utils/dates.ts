const DAY_MS = 24 * 60 * 60 * 1000;

// Кількість повних днів між датами за календарем (без впливу годин і переходу на літній час)
export function daysBetween(from: Date, to: Date = new Date()): number {
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((end - start) / DAY_MS);
}

// Українські форми множини: 1 день, 2 дні, 5 днів
export function pluralUk(n: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
