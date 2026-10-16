// Ідеї побачень: випадкова ідея за бюджетом і настроєм. Каталог живе в застосунку,
// персональні ідеї від ШІ — на тому ж екрані через src/services/ai.ts.

export type Budget = 'free' | 'low' | 'treat';
export type DateMood = 'cozy' | 'active' | 'romantic' | 'fun';

export type DateIdea = {
  id: string;
  title: string;
  description: string;
  budget: Budget;
  mood: DateMood;
};

export const BUDGETS: { value: Budget; title: string }[] = [
  { value: 'free', title: 'Безкоштовно' },
  { value: 'low', title: 'Недорого' },
  { value: 'treat', title: 'Розщедритись' },
];

export const DATE_MOODS: { value: DateMood; title: string }[] = [
  { value: 'cozy', title: 'Затишно' },
  { value: 'romantic', title: 'Романтично' },
  { value: 'active', title: 'Активно' },
  { value: 'fun', title: 'Щось нове' },
];

export const DATE_IDEAS: DateIdea[] = [
  // Безкоштовно
  {
    id: 'blanket-fort',
    title: 'Курінь із ковдр',
    description:
      'Зведіть курінь із подушок і ковдр, візьміть гірлянду й подивіться фільм усередині.',
    budget: 'free',
    mood: 'cozy',
  },
  {
    id: 'old-photos',
    title: 'Вечір старих фото',
    description: 'Перегляньте фото з перших місяців разом і згадайте історії за кожним кадром.',
    budget: 'free',
    mood: 'cozy',
  },
  {
    id: 'read-aloud',
    title: 'Читання вголос',
    description: 'Оберіть коротку книжку чи оповідання й читайте одне одному по черзі.',
    budget: 'free',
    mood: 'cozy',
  },
  {
    id: 'stargazing',
    title: 'Дивитися на зорі',
    description: 'Виїдьте подалі від міських вогнів, візьміть плед і застосунок із сузір’ями.',
    budget: 'free',
    mood: 'romantic',
  },
  {
    id: 'sunrise',
    title: 'Зустріти світанок',
    description: 'Прокиньтеся рано, візьміть термос із чаєм і знайдіть місце з видом на схід.',
    budget: 'free',
    mood: 'romantic',
  },
  {
    id: 'love-letters',
    title: 'Листи одне одному',
    description: 'Напишіть від руки листи про те, що цінуєте одне в одному, і обміняйтеся ними.',
    budget: 'free',
    mood: 'romantic',
  },
  {
    id: 'slow-dance',
    title: 'Танець на кухні',
    description: 'Складіть плейлист із «ваших» пісень, вимкніть світло й потанцюйте вдома.',
    budget: 'free',
    mood: 'romantic',
  },
  {
    id: 'new-trail',
    title: 'Нова стежка',
    description: 'Знайдіть парк чи ліс, де ви ще не були, і пройдіть маршрут хоча б на 5 км.',
    budget: 'free',
    mood: 'active',
  },
  {
    id: 'sunset-run',
    title: 'Пробіжка на заході сонця',
    description: 'Легка пробіжка чи велопрогулянка ввечері, а потім розтяжка разом.',
    budget: 'free',
    mood: 'active',
  },
  {
    id: 'home-workout',
    title: 'Тренування вдвох',
    description: 'Знайдіть відео з парними вправами й спробуйте весь комплекс до кінця.',
    budget: 'free',
    mood: 'active',
  },
  {
    id: 'city-tourists',
    title: 'Туристи у своєму місті',
    description: 'Проведіть день, ніби вперше в місті: екскурсія, пам’ятки, фото на фоні всього.',
    budget: 'free',
    mood: 'fun',
  },
  {
    id: 'random-walk',
    title: 'Прогулянка навмання',
    description: 'На кожному перехресті кидайте монетку: орел — ліворуч, решка — праворуч.',
    budget: 'free',
    mood: 'fun',
  },
  {
    id: 'learn-together',
    title: 'Новий навик за вечір',
    description: 'Оберіть щось незнайоме: жонглювання, оригамі, кілька фраз чужою мовою.',
    budget: 'free',
    mood: 'fun',
  },
  // Недорого
  {
    id: 'picnic',
    title: 'Пікнік',
    description: 'Зберіть кошик із улюбленими перекусами й знайдіть галявину чи набережну.',
    budget: 'low',
    mood: 'romantic',
  },
  {
    id: 'cook-new',
    title: 'Приготувати нове',
    description:
      'Оберіть страву кухні, яку ви ще не пробували готувати, і купіть інгредієнти разом.',
    budget: 'low',
    mood: 'cozy',
  },
  {
    id: 'board-games',
    title: 'Вечір настільних ігор',
    description: 'Нова настільна гра або турнір у старі улюблені, переможець обирає десерт.',
    budget: 'low',
    mood: 'cozy',
  },
  {
    id: 'coffee-tour',
    title: 'Кавовий тур',
    description: 'Три кав’ярні за день, у кожній — по маленькій каві й оцінка від 1 до 10.',
    budget: 'low',
    mood: 'cozy',
  },
  {
    id: 'bike-rent',
    title: 'Велопрогулянка',
    description: 'Візьміть велосипеди в прокат і проїдьтеся набережною чи парком.',
    budget: 'low',
    mood: 'active',
  },
  {
    id: 'skating',
    title: 'Ковзанка чи ролики',
    description: 'Навіть якщо не вмієте — тим веселіше триматися за руки.',
    budget: 'low',
    mood: 'active',
  },
  {
    id: 'market',
    title: 'Базар чи фермерський ринок',
    description: 'Ідіть без списку, купіть три незнайомі продукти й придумайте з ними вечерю.',
    budget: 'low',
    mood: 'fun',
  },
  {
    id: 'museum',
    title: 'Музей чи виставка',
    description: 'Оберіть виставку, на яку жоден із вас сам би не пішов.',
    budget: 'low',
    mood: 'fun',
  },
  {
    id: 'paint-night',
    title: 'Малюємо одне одного',
    description: 'Купіть фарби й полотна, намалюйте портрети одне одного за 30 хвилин.',
    budget: 'low',
    mood: 'fun',
  },
  {
    id: 'open-cinema',
    title: 'Кіно просто неба',
    description: 'Літній кінотеатр або проєктор на балконі з попкорном.',
    budget: 'low',
    mood: 'romantic',
  },
  {
    id: 'karaoke',
    title: 'Караоке',
    description: 'Заспівайте дуетом пісню, яку обере партнер.',
    budget: 'low',
    mood: 'fun',
  },
  // Розщедритись
  {
    id: 'fancy-dinner',
    title: 'Вечеря в ресторані',
    description: 'Заклад, про який давно говорили, з дрес-кодом і без телефонів на столі.',
    budget: 'treat',
    mood: 'romantic',
  },
  {
    id: 'weekend-trip',
    title: 'Вихідні в іншому місті',
    description: 'Спонтанна поїздка на дві ночі туди, де жоден із вас ще не був.',
    budget: 'treat',
    mood: 'romantic',
  },
  {
    id: 'spa',
    title: 'СПА-день',
    description: 'Масаж, сауна й басейн — день, щоб нікуди не поспішати.',
    budget: 'treat',
    mood: 'cozy',
  },
  {
    id: 'cabin',
    title: 'Будиночок за містом',
    description: 'Оренда будиночка з каміном чи чаном, книжки й повільний ранок.',
    budget: 'treat',
    mood: 'cozy',
  },
  {
    id: 'concert',
    title: 'Концерт',
    description: 'Квитки на виконавця, якого любите обоє, або на когось нового для обох.',
    budget: 'treat',
    mood: 'fun',
  },
  {
    id: 'cooking-class',
    title: 'Кулінарний майстер-клас',
    description: 'Паста, суші чи вареники — головне, щоб готували разом.',
    budget: 'treat',
    mood: 'fun',
  },
  {
    id: 'kayak',
    title: 'Сплав на каяках',
    description: 'Пів дня на воді з інструктором, а потім обід на березі.',
    budget: 'treat',
    mood: 'active',
  },
  {
    id: 'climbing',
    title: 'Скеледром',
    description: 'Пробне заняття для двох: страхуєте одне одного по черзі.',
    budget: 'treat',
    mood: 'active',
  },
  {
    id: 'horse-ride',
    title: 'Кінна прогулянка',
    description: 'Прогулянка верхи лісом чи полем, навіть для новачків.',
    budget: 'treat',
    mood: 'active',
  },
];

// Випадкова ідея за фільтрами; щойно показані повторюються, лише коли інших не лишилось
export function pickDateIdea(
  filters: { budget: Budget | null; mood: DateMood | null },
  seen: Set<string>,
): DateIdea | null {
  const matching = DATE_IDEAS.filter(
    (idea) =>
      (!filters.budget || idea.budget === filters.budget) &&
      (!filters.mood || idea.mood === filters.mood),
  );
  if (matching.length === 0) return null;
  const fresh = matching.filter((idea) => !seen.has(idea.id));
  const pool = fresh.length > 0 ? fresh : matching;
  return pool[Math.floor(Math.random() * pool.length)];
}
