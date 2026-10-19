# Анкети приватності для магазинів

Відповіді зібрано з коду застосунку станом на 2026-10-19. Якщо додаси аналітику, рекламу чи нового постачальника — онови і цей файл, і `legal/content/*.mjs`.

## Посилання

| Що                                 | URL                                                     |
| ---------------------------------- | ------------------------------------------------------- |
| Privacy Policy URL                 | https://mylayed.github.io/couple/en/privacy.html        |
| Terms of Use (EULA)                | https://mylayed.github.io/couple/en/terms.html          |
| Support URL                        | https://mylayed.github.io/couple/en/support.html        |
| Account deletion URL (Google Play) | https://mylayed.github.io/couple/en/delete-account.html |
| Контакт                            | hello.dotyk@gmail.com                                   |

У App Store Connect у полі **License Agreement** можна лишити стандартну EULA Apple — вона вже згадана в наших умовах. Посилання на Terms і Privacy додай також в опис застосунку (вимога для підписок).

## App Store Connect → App Privacy

**Tracking:** No. Дані не використовуються для стеження, рекламних ідентифікаторів немає.

| Тип даних (Apple)                                                                | Збираємо                                                   | Привʼязано до користувача | Мета              |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------- | ----------------- |
| Contact Info → Name                                                              | Так                                                        | Так                       | App Functionality |
| Contact Info → Email Address                                                     | Так                                                        | Так                       | App Functionality |
| User Content → Photos or Videos                                                  | Так (лише фото)                                            | Так                       | App Functionality |
| User Content → Other User Content                                                | Так (спогади, листівки, відповіді, малюнки, списки)        | Так                       | App Functionality |
| Identifiers → User ID                                                            | Так                                                        | Так                       | App Functionality |
| Identifiers → Device ID                                                          | Так (push-токен)                                           | Так                       | App Functionality |
| Purchases → Purchase History                                                     | Так                                                        | Так                       | App Functionality |
| Usage Data → Product Interaction                                                 | Так (з якого екрана відкрили пейвол, лічильник запитів ШІ) | Так                       | App Functionality |
| Other Data → дата народження                                                     | Так (необовʼязково)                                        | Так                       | App Functionality |
| Location, Contacts, Health, Financial Info, Browsing/Search History, Diagnostics | Ні                                                         | —                         | —                 |

## Google Play Console → Data safety

- **Чи збирає або передає застосунок дані:** Так.
- **Чи шифруються дані під час передачі:** Так.
- **Чи можна попросити видалити дані:** Так — у застосунку та за URL видалення акаунта.
- **Передача третім сторонам (sharing):** Ні. Постачальники (Supabase, Anthropic, RevenueCat, Expo, Google) обробляють дані за нашим дорученням — у Google це не вважається «sharing».

| Категорія (Google)  | Тип                                         | Збирається | Обовʼязково | Мета                                  |
| ------------------- | ------------------------------------------- | ---------- | ----------- | ------------------------------------- |
| Personal info       | Name                                        | Так        | Так         | App functionality, Account management |
| Personal info       | Email address                               | Так        | Так         | App functionality, Account management |
| Personal info       | User IDs                                    | Так        | Так         | App functionality, Account management |
| Personal info       | Other info (дата народження)                | Так        | Ні          | App functionality                     |
| Photos and videos   | Photos                                      | Так        | Ні          | App functionality                     |
| Messages            | Other in-app messages (листівки, коментарі) | Так        | Ні          | App functionality                     |
| App activity        | Other user-generated content                | Так        | Ні          | App functionality                     |
| App activity        | App interactions                            | Так        | Так         | App functionality, Analytics          |
| Financial info      | Purchase history                            | Так        | Ні          | App functionality                     |
| Device or other IDs | Device or other IDs (push-токен)            | Так        | Ні          | App functionality                     |

## Інше, що попросять магазини

- **Вікове обмеження:** у анкетах вказуй, що застосунок для 16+ (у Google Play — цільова аудиторія 16–17 і 18+; не для дітей).
- **Google Play → App access:** дай тестовий акаунт, бо без входу застосунок не відкрити.
- **App Store → Sign in with Apple:** за правилом 4.8 застосунок із входом через Google має пропонувати й рівноцінний «приватний» спосіб входу. Найпростіше — додати Sign in with Apple; без нього рецензія App Store, імовірно, відхилить подачу.
