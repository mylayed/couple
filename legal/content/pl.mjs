export default {
  langName: 'Polski',
  ui: {
    updated: 'Ostatnia aktualizacja: {updated}',
    nav: { privacy: 'Prywatność', terms: 'Regulamin', delete: 'Usuwanie konta', support: 'Pomoc' },
    indexTitle: 'Dotyk — informacje prawne i pomoc',
    indexIntro:
      'Dotyk to aplikacja dla par: wspólne wspomnienia, liściki, daty, gry i pupil, o którego dbacie razem.',
  },
  privacy: {
    title: 'Polityka prywatności',
    intro:
      'Ta polityka wyjaśnia, jakie dane zbiera Dotyk, w jakim celu, kto je przetwarza i jak możesz nimi zarządzać. Stworzyliśmy Dotyk, by prywatne życie pary pozostało prywatne: bez reklam, bez śledzenia, bez sprzedaży danych.',
    sections: [
      {
        h: 'Kim jesteśmy',
        p: [
          'Dotyk tworzy i prowadzi {owner}, osoba fizyczna z siedzibą na Ukrainie („my”). Jesteśmy administratorem Twoich danych osobowych. Kontakt: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'Jakie dane zbieramy',
        p: ['<strong>Dane konta.</strong>'],
        ul: [
          'Adres e-mail i hasło (hasło jest przechowywane wyłącznie jako bezpieczny skrót u naszego dostawcy uwierzytelniania) lub — jeśli logujesz się przez Google — e-mail, imię i identyfikator Twojego konta Google.',
          'Twoje imię oraz opcjonalnie data urodzenia i zdjęcie profilowe.',
          'Ustawienia: język aplikacji, czy funkcje AI są włączone, preferencje powiadomień.',
        ],
      },
      {
        p: [
          '<strong>Treści tworzone razem.</strong> Wspomnienia i ich zdjęcia, komentarze, liściki, momenty „Kiedy ostatnio…”, nastroje, odpowiedzi na pytanie dnia, odpowiedzi w grach, wyzwania, lista marzeń i wspólne listy, ważne daty, kapsuły czasu, rysunki, wspólny pupil i opieka nad nim oraz „dotyki” (serce, przytulas, myślę o Tobie). Te treści z założenia widzi Twój partner lub partnerka — po to jest aplikacja.',
          '<strong>Dane parowania.</strong> Kod zaproszenia, który udostępniasz, i rejestr prób dołączenia, aby nikt nie mógł odgadnąć kodu.',
          '<strong>Dane techniczne i urządzenia.</strong> Token powiadomień push i platforma (iOS lub Android), aby dostarczać powiadomienia. Nasz dostawca hostingu przetwarza adresy IP i logi zapytań, aby utrzymać i chronić usługę.',
          '<strong>Zakupy.</strong> Płatności odbywają się przez App Store lub Google Play; nigdy nie widzimy danych Twojej karty. Nasz dostawca subskrypcji otrzymuje Twój identyfikator w aplikacji i potwierdzenia zakupów, by potwierdzić status Plus. Przechowujemy status i datę wygaśnięcia Plus oraz to, z którego ekranu otwarto ofertę.',
          '<strong>Zapytania do AI.</strong> Tylko gdy dotkniesz przycisku oznaczonego ✨ i tylko z danymi potrzebnymi tej funkcji (zob. „Funkcje AI”). Liczymy zapytania, aby stosować dzienny limit.',
        ],
      },
      {
        h: 'Czego nie zbieramy',
        ul: [
          'Żadnych reklam, identyfikatorów reklamowych ani śledzenia w innych aplikacjach i witrynach.',
          'Żadnych zewnętrznych SDK analitycznych.',
          'Żadnej lokalizacji, kontaktów ani nagrań z mikrofonu czy aparatu. Tylko zdjęcia, które sam(a) dodasz.',
          'Nigdy nie sprzedajemy ani nie wynajmujemy Twoich danych.',
        ],
      },
      {
        h: 'Cele i podstawy prawne',
        ul: [
          '<strong>Świadczenie usługi</strong> — konta, parowanie, synchronizacja wspólnych treści, Plus (wykonanie umowy, art. 6 ust. 1 lit. b RODO).',
          '<strong>Funkcje opcjonalne</strong> — AI i powiadomienia push działają tylko po ich włączeniu i można je w każdej chwili wyłączyć (zgoda, art. 6 ust. 1 lit. a RODO).',
          '<strong>Bezpieczeństwo i zapobieganie nadużyciom</strong> — limity, ochrona kodów zaproszeń, naprawa błędów (prawnie uzasadniony interes, art. 6 ust. 1 lit. f RODO).',
          '<strong>Obowiązki prawne</strong> — np. dokumentacja podatkowa i księgowa prowadzona przez sklepy z aplikacjami.',
        ],
      },
      {
        h: 'Funkcje AI',
        p: [
          'Funkcje AI (pomysły na randki, pomoc przy liścikach, historia Waszego roku) są opcjonalne. Zapytania trafiają na nasz serwer, a stamtąd do modelu Claude firmy Anthropic. Zgodnie z warunkami Anthropic dane przesyłane przez API nie są używane do trenowania modeli.',
          'Wysyłamy tylko to, czego potrzebuje funkcja: przy pomysłach na randki — wybrany budżet i nastrój, bieżący miesiąc, Wasze najczęstsze momenty i niespełnione marzenia z listy; przy liścikach — ton, Twój szkic i imię partnera; przy historii roku — liczby z roku, Wasze imiona, częste momenty, spełnione marzenia i podpisy wspomnień. Zdjęcia, odpowiedzi na pytanie dnia, nastroje, liściki i komentarze partnera, Twój e-mail i data urodzenia nigdy nie są wysyłane.',
          'Gotowe odpowiedzi są przechowywane w pamięci podręcznej na naszym serwerze do 30 dni, by to samo zapytanie nie zużywało limitu. Jeśli partner wyłączy AI, żadne wspólne dane pary nie są wysyłane.',
        ],
      },
      {
        h: 'Kto przetwarza Twoje dane',
        p: ['Korzystamy z niewielu dostawców, którzy przetwarzają dane w naszym imieniu:'],
        ul: [
          '<strong>Supabase</strong> — baza danych, uwierzytelnianie, przechowywanie zdjęć i funkcje serwerowe.',
          '<strong>Anthropic</strong> — funkcje AI, tylko gdy z nich korzystasz.',
          '<strong>RevenueCat</strong> — obsługa zakupów w aplikacji i subskrypcji.',
          '<strong>Apple i Google</strong> — logowanie przez Google, płatności i dostarczanie powiadomień push (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong> — usługa powiadomień push przekazująca powiadomienia do Apple i Google.',
        ],
        p2: [
          'Niektórzy dostawcy przetwarzają dane poza Ukrainą i Europejskim Obszarem Gospodarczym, także w USA. W razie potrzeby przekazywanie jest zabezpieczone standardowymi klauzulami umownymi lub równoważnymi gwarancjami tych dostawców.',
        ],
      },
      {
        h: 'Twój partner i wspólne dane',
        p: [
          'Wszystko, co dodajesz do przestrzeni pary, widzi Twój partner lub partnerka, a Ty widzisz jego lub jej treści. Partner widzi też Twoje imię, zdjęcie profilowe i datę urodzenia (do przypomnień o urodzinach).',
          'Jeśli którekolwiek z Was opuści parę lub usunie konto, wspólna przestrzeń — wszystkie wspólne treści i zdjęcia — zostaje usunięta dla obojga. Dzięki temu nikt nie zostaje z danymi drugiej osoby.',
        ],
      },
      {
        h: 'Jak długo przechowujemy dane',
        ul: [
          'Konto i treści — dopóki istnieje Twoje konto. To, co usuniesz, od razu znika dla Was obojga i zostaje trwale usunięte najpóźniej wraz z usunięciem pary.',
          'Odpowiedzi AI w pamięci podręcznej — do 30 dni.',
          'Po usunięciu konta Twój profil, zdjęcie profilowe, tokeny push i wspólna przestrzeń pary są usuwane natychmiast. Kopie w backupach naszego dostawcy hostingu są nadpisywane w ograniczonym czasie.',
          'Potwierdzenia zakupów przechowują Apple, Google i RevenueCat zgodnie z własnymi zasadami i obowiązkami prawnymi.',
        ],
      },
      {
        h: 'Bezpieczeństwo',
        p: [
          'Dane są szyfrowane podczas przesyłania. Reguły bazy danych zapewniają, że dane Waszej pary możecie odczytać tylko Ty i Twój partner. Zdjęcia leżą w prywatnym magazynie i są dostępne tylko przez krótkotrwałe linki. Sesja logowania jest przechowywana na urządzeniu w postaci zaszyfrowanej, a klucz — w systemowym pęku kluczy.',
        ],
      },
      {
        h: 'Twoje prawa',
        p: [
          'W zależności od miejsca zamieszkania (m.in. na mocy RODO i ukraińskiej ustawy o ochronie danych osobowych) masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, otrzymania kopii w przenośnym formacie, ograniczenia przetwarzania lub sprzeciwu wobec niego oraz cofnięcia zgody w dowolnym momencie.',
          'Większość danych możesz zmienić w aplikacji, a konto usunąć w Ustawieniach. W pozostałych sprawach napisz na <a href="mailto:{email}">{email}</a> — odpowiadamy w ciągu 30 dni. Możesz też złożyć skargę do organu ochrony danych: na Ukrainie — do Rzecznika Praw Człowieka Rady Najwyższej; w UE — do organu w swoim kraju (w Polsce — do Prezesa UODO).',
        ],
      },
      {
        h: 'Wiek',
        p: [
          'Dotyk jest przeznaczony dla osób od 16. roku życia. Świadomie nie zbieramy danych młodszych dzieci. Jeśli uważasz, że konto założyło dziecko, napisz do nas, a je usuniemy.',
        ],
      },
      {
        h: 'Zmiany polityki',
        p: [
          'Jeśli zmienimy tę politykę, zaktualizujemy datę powyżej, a o ważnych zmianach poinformujemy w aplikacji, zanim wejdą w życie.',
        ],
      },
      { h: 'Kontakt', p: ['{owner}, Ukraina — <a href="mailto:{email}">{email}</a>'] },
    ],
  },
  terms: {
    title: 'Regulamin',
    intro:
      'Ten regulamin obowiązuje podczas korzystania z aplikacji Dotyk. Zakładając konto, akceptujesz go. Przeczytaj go razem z naszą <a href="privacy.html">Polityką prywatności</a>.',
    sections: [
      {
        h: 'Usługa',
        p: [
          'Dotyk udostępnia {owner}, Ukraina („my”). Aplikacja pozwala dwóm osobom stworzyć wspólną przestrzeń: wspomnienia, liściki, daty, plany, gry i wirtualnego pupila.',
        ],
      },
      {
        h: 'Kto może korzystać z Dotyk',
        p: [
          'Musisz mieć co najmniej 16 lat i móc zaakceptować ten regulamin. Jednocześnie możesz być tylko w jednej parze.',
        ],
      },
      {
        h: 'Twoje konto',
        p: [
          'Podawaj prawdziwe dane i chroń dane logowania. Odpowiadasz za aktywność na swoim koncie. Daj nam znać, jeśli uważasz, że ktoś inny ma do niego dostęp.',
        ],
      },
      {
        h: 'Twoje treści',
        p: [
          'Zachowujesz wszystkie prawa do tego, co dodajesz. Udzielasz nam ograniczonej zgody na przechowywanie, przetwarzanie i wyświetlanie Twoich treści Tobie i Twojemu partnerowi — wyłącznie w celu działania aplikacji.',
          'Dodawaj tylko treści, którymi masz prawo się dzielić. Nie przesyłaj zdjęć innych osób bez ich zgody i nie używaj Dotyk do niczego nielegalnego, nękającego ani szkodliwego.',
          'Pamiętaj, że partner widzi to, co dodajesz do wspólnej przestrzeni, a wspólne treści są usuwane dla Was obojga, jeśli któreś z Was opuści parę lub usunie konto.',
        ],
      },
      {
        h: 'Dozwolone korzystanie',
        ul: [
          'Nie próbuj uzyskać dostępu do cudzych kont lub danych ani zakłócać działania usługi.',
          'Nie stosuj inżynierii wstecznej, nie przeciążaj aplikacji i nie nadużywaj jej limitów ani funkcji AI.',
          'Nie używaj aplikacji do spamu ani nielegalnych treści.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus jest opcjonalny. Podstawowe funkcje są bezpłatne.',
          'Plus kupuje się przez App Store lub Google Play i obowiązuje dla Was obojga, dopóki jesteście parą. Cena i okres są widoczne przed zakupem.',
          'Subskrypcje odnawiają się automatycznie, chyba że zostaną anulowane co najmniej 24 godziny przed końcem bieżącego okresu. Opłata jest pobierana z konta sklepu w ciągu 24 godzin przed odnowieniem.',
          'Subskrypcją możesz zarządzać lub ją anulować w ustawieniach konta App Store lub Google Play. Usunięcie aplikacji lub konta Dotyk nie anuluje subskrypcji.',
          'Jeśli oferowany jest bezpłatny okres próbny, jego niewykorzystana część kończy się z chwilą zakupu subskrypcji. Zwroty obsługują Apple lub Google zgodnie ze swoimi zasadami.',
          'Jednorazowy zakup „na zawsze” daje Plus tak długo, jak aplikacja jest dostępna.',
        ],
      },
      {
        h: 'Funkcje AI',
        p: [
          'Propozycje AI są generowane automatycznie i mogą być niedokładne lub nietrafione. Kieruj się własnym osądem. Funkcje AI są opcjonalne i w wersji bezpłatnej mają dzienne limity.',
        ],
      },
      {
        h: 'Zmiany i dostępność',
        p: [
          'Stale rozwijamy Dotyk i możemy zmieniać lub usuwać funkcje. Staramy się, by aplikacja była dostępna, ale nie możemy zagwarantować, że zawsze będzie działać bez przerw. O ważnych zmianach regulaminu poinformujemy z wyprzedzeniem.',
        ],
      },
      {
        h: 'Zakończenie korzystania',
        p: [
          'Możesz w każdej chwili przestać korzystać z Dotyk i usunąć konto w Ustawieniach. Możemy zawiesić lub zamknąć konta, które poważnie lub wielokrotnie naruszają regulamin.',
        ],
      },
      {
        h: 'Odpowiedzialność',
        p: [
          'Aplikacja jest udostępniana „w stanie, w jakim jest”. W zakresie dozwolonym przez prawo nie odpowiadamy za szkody pośrednie ani utratę danych. Nic w regulaminie nie ogranicza praw, które przysługują Ci jako konsumentowi na mocy prawa Twojego kraju.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Jeśli pobrano Dotyk z App Store, regulamin wiąże Ciebie i nas, a nie Apple. Obowiązuje także <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Umowa licencyjna Apple z użytkownikiem końcowym</a>, a Apple nie ma obowiązku zapewniać wsparcia dla aplikacji.',
        ],
      },
      {
        h: 'Prawo właściwe',
        p: [
          'Regulamin podlega prawu Ukrainy. Jeśli jesteś konsumentem, zachowujesz też ochronę bezwzględnie obowiązujących przepisów kraju, w którym mieszkasz.',
        ],
      },
      { h: 'Kontakt', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Usuwanie konta Dotyk',
    intro: 'Konto i dane możesz usunąć w każdej chwili, bezpośrednio w aplikacji.',
    sections: [
      {
        h: 'W aplikacji',
        ol: [
          'Otwórz Dotyk i przejdź do karty <strong>Profil</strong>.',
          'Przewiń do sekcji <strong>Konto</strong>.',
          'Dotknij <strong>Usuń konto</strong> i potwierdź.',
        ],
      },
      {
        h: 'Co zostaje usunięte',
        ul: [
          'Twoje konto, imię, e-mail, data urodzenia i zdjęcie profilowe.',
          'Wspólna przestrzeń Waszej pary — wspomnienia i zdjęcia, liściki, momenty, daty, plany, gry, rysunki i pupil. Znika ona także dla partnera.',
          'Tokeny powiadomień push i odpowiedzi AI w pamięci podręcznej.',
        ],
        p2: [
          'Usunięcie następuje natychmiast. Kopie w backupach są nadpisywane w ograniczonym czasie.',
        ],
      },
      {
        h: 'Czego nie usuwamy automatycznie',
        ul: [
          '<strong>Subskrypcji.</strong> Anuluj Plus w ustawieniach konta App Store lub Google Play — usunięcie konta nie zatrzymuje płatności.',
          'Potwierdzeń zakupów przechowywanych przez Apple, Google i RevenueCat zgodnie z ich zasadami i obowiązkami prawnymi.',
        ],
      },
      {
        h: 'Nie masz dostępu do aplikacji?',
        p: [
          'Napisz na <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> z adresu używanego w Dotyk, w temacie „Usuń moje konto Dotyk”. Usuniemy konto w ciągu 30 dni i potwierdzimy to e-mailem.',
        ],
      },
    ],
  },
  support: {
    title: 'Pomoc',
    intro:
      'Pytania, pomysły albo coś nie działa? Napisz na <a href="mailto:{email}">{email}</a> — zwykle odpowiadamy w ciągu kilku dni.',
    sections: [
      {
        h: 'Jak połączyć się w parę?',
        p: [
          'Jedno z Was tworzy parę i udostępnia kod zaproszenia, drugie wpisuje go na ekranie „Kod partnera”.',
        ],
      },
      {
        h: 'Jak anulować Plus?',
        p: [
          'W ustawieniach konta App Store lub Google Play, w sekcji Subskrypcje. Plus działa do końca opłaconego okresu.',
        ],
      },
      {
        h: 'Kupiłem(-am) Plus, ale go nie widać',
        p: [
          'Otwórz kartę Profil i dotknij „Przywróć zakupy”. Upewnij się, że jesteś zalogowany(-a) na to samo konto App Store lub Google Play.',
        ],
      },
      { h: 'Jak usunąć konto?', p: ['Zob. <a href="delete-account.html">Usuwanie konta</a>.'] },
    ],
  },
};
