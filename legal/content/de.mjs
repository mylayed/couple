export default {
  langName: 'Deutsch',
  ui: {
    updated: 'Zuletzt aktualisiert: {updated}',
    nav: {
      privacy: 'Datenschutz',
      terms: 'Nutzungsbedingungen',
      delete: 'Konto löschen',
      support: 'Support',
    },
    indexTitle: 'Dotyk — Rechtliches und Support',
    indexIntro:
      'Dotyk ist eine App für Paare: gemeinsame Erinnerungen, Notizen, Termine, Spiele und ein Haustier, um das ihr euch zusammen kümmert.',
  },
  privacy: {
    title: 'Datenschutzerklärung',
    intro:
      'Diese Erklärung beschreibt, welche Daten Dotyk erhebt, wozu, wer sie verarbeitet und wie du sie steuern kannst. Wir haben Dotyk entwickelt, damit das Privatleben eines Paares privat bleibt: keine Werbung, kein Tracking, kein Verkauf von Daten.',
    sections: [
      {
        h: 'Wer wir sind',
        p: [
          'Dotyk wird von {owner}, einer Privatperson mit Sitz in der Ukraine („wir“), entwickelt und betrieben. Wir sind Verantwortlicher für deine personenbezogenen Daten. Kontakt: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'Welche Daten wir erheben',
        p: ['<strong>Kontodaten.</strong>'],
        ul: [
          'E-Mail-Adresse und Passwort (das Passwort wird bei unserem Authentifizierungsanbieter nur als sicherer Hash gespeichert) oder, wenn du dich mit Google anmeldest, E-Mail, Name und Kennung deines Google-Kontos.',
          'Dein Name und optional dein Geburtsdatum und Profilfoto.',
          'Einstellungen: App-Sprache, ob KI-Funktionen aktiv sind, Benachrichtigungseinstellungen.',
        ],
      },
      {
        p: [
          '<strong>Inhalte, die ihr gemeinsam erstellt.</strong> Erinnerungen und ihre Fotos, Kommentare, Notizen, „Wann haben wir zuletzt …“-Momente, Stimmungen, Antworten auf die Frage des Tages, Spielantworten, Challenges, Bucket List und gemeinsame Listen, wichtige Daten, Zeitkapseln, Zeichnungen, euer gemeinsames Haustier und seine Pflege sowie „Berührungen“ (Herz, Umarmung, ich denk an dich). Diese Inhalte sieht dein Partner bzw. deine Partnerin — genau dafür ist die App da.',
          '<strong>Daten zur Paarbildung.</strong> Der Einladungscode, den du teilst, und ein Protokoll der Beitrittsversuche, damit niemand den Code erraten kann.',
          '<strong>Geräte- und technische Daten.</strong> Ein Push-Token und die Plattform (iOS oder Android), um Benachrichtigungen zuzustellen. Unser Hosting-Anbieter verarbeitet IP-Adressen und Anfrageprotokolle, um den Dienst zu betreiben und zu schützen.',
          '<strong>Käufe.</strong> Zahlungen laufen über den App Store oder Google Play; deine Kartendaten sehen wir nie. Unser Abo-Dienstleister erhält deine In-App-Kennung und Kaufbelege, um deinen Plus-Status zu bestätigen. Wir speichern Status und Ablaufdatum von Plus sowie, von welchem Bildschirm das Angebot geöffnet wurde.',
          '<strong>KI-Anfragen.</strong> Nur wenn du auf eine Schaltfläche mit ✨ tippst, und nur mit den Daten, die diese Funktion braucht (siehe „KI-Funktionen“). Wir zählen Anfragen für das Tageslimit.',
        ],
      },
      {
        h: 'Was wir nicht erheben',
        ul: [
          'Keine Werbung, keine Werbe-IDs, kein Tracking über andere Apps oder Websites.',
          'Keine Analyse-SDKs von Drittanbietern.',
          'Keinen Standort, keine Kontakte, keine Mikrofon- oder Kameraaufnahmen. Nur Fotos, die du selbst hinzufügst.',
          'Wir verkaufen oder vermieten deine Daten niemals.',
        ],
      },
      {
        h: 'Wozu wir sie nutzen (Rechtsgrundlagen)',
        ul: [
          '<strong>Bereitstellung der App</strong> — Konten, Paarbildung, Synchronisation gemeinsamer Inhalte, Plus (Vertragserfüllung, Art. 6 Abs. 1 lit. b DSGVO).',
          '<strong>Optionale Funktionen</strong> — KI und Push-Benachrichtigungen funktionieren nur, wenn du sie einschaltest, und lassen sich jederzeit ausschalten (Einwilligung, Art. 6 Abs. 1 lit. a DSGVO).',
          '<strong>Sicherheit und Missbrauchsschutz</strong> — Limits, Schutz der Einladungscodes, Fehlerbehebung (berechtigte Interessen, Art. 6 Abs. 1 lit. f DSGVO).',
          '<strong>Rechtliche Pflichten</strong> — z. B. Steuer- und Buchhaltungsunterlagen der App-Stores.',
        ],
      },
      {
        h: 'KI-Funktionen',
        p: [
          'KI-Funktionen (Date-Ideen, Hilfe bei Notizen, die Geschichte eures Jahres) sind optional. Anfragen gehen an unseren Server und von dort an das Modell Claude von Anthropic. Nach den Bedingungen von Anthropic werden über die API gesendete Daten nicht zum Training von Modellen verwendet.',
          'Wir senden nur, was die Funktion braucht: für Date-Ideen das gewählte Budget und die Stimmung, den aktuellen Monat, eure häufigsten Momente und offene Wünsche der Bucket List; für Notizen den Ton, deinen Entwurf und den Namen deines Partners bzw. deiner Partnerin; für die Jahresgeschichte die Zahlen des Jahres, eure Namen, häufige Momente, erfüllte Wünsche und Bildunterschriften der Erinnerungen. Fotos, Antworten auf die Frage des Tages, Stimmungen, Notizen und Kommentare deines Gegenübers, deine E-Mail und dein Geburtsdatum werden nie gesendet.',
          'Fertige Antworten werden bis zu 30 Tage auf unserem Server zwischengespeichert, damit dieselbe Anfrage dein Limit nicht verbraucht. Hat dein Gegenüber KI deaktiviert, werden gar keine gemeinsamen Daten des Paares gesendet.',
        ],
      },
      {
        h: 'Wer deine Daten verarbeitet',
        p: ['Wir nutzen wenige Dienstleister, die Daten in unserem Auftrag verarbeiten:'],
        ul: [
          '<strong>Supabase</strong> — Datenbank, Authentifizierung, Fotospeicher und Serverfunktionen.',
          '<strong>Anthropic</strong> — KI-Funktionen, nur wenn du sie nutzt.',
          '<strong>RevenueCat</strong> — Verwaltung von In-App-Käufen und Abos.',
          '<strong>Apple und Google</strong> — Anmeldung mit Google, Zahlungen und Zustellung von Push-Benachrichtigungen (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong> — Push-Dienst, der Benachrichtigungen an Apple und Google weiterleitet.',
        ],
        p2: [
          'Einige Dienstleister verarbeiten Daten außerhalb der Ukraine und des Europäischen Wirtschaftsraums, auch in den USA. Soweit erforderlich, sind Übermittlungen durch Standardvertragsklauseln oder gleichwertige Garantien dieser Anbieter abgesichert.',
        ],
      },
      {
        h: 'Dein Partner bzw. deine Partnerin und gemeinsame Daten',
        p: [
          'Alles, was du im Bereich des Paares hinzufügst, sieht dein Gegenüber, und du siehst dessen Inhalte. Dein Gegenüber sieht außerdem deinen Namen, dein Profilfoto und dein Geburtsdatum (für Geburtstagserinnerungen).',
          'Verlässt einer von euch das Paar oder löscht sein Konto, wird der gemeinsame Bereich — alle gemeinsamen Inhalte und Fotos — für beide gelöscht. So bleibt niemand mit den Daten der anderen Person zurück.',
        ],
      },
      {
        h: 'Wie lange wir Daten speichern',
        ul: [
          'Konto und Inhalte — solange dein Konto besteht. Gelöschtes verschwindet sofort für euch beide und wird spätestens mit dem Löschen des Paares endgültig entfernt.',
          'Zwischengespeicherte KI-Antworten — bis zu 30 Tage.',
          'Beim Löschen deines Kontos werden Profil, Profilfoto, Push-Tokens und der gemeinsame Bereich des Paares sofort gelöscht. Kopien in Backups unseres Hosting-Anbieters werden innerhalb eines begrenzten Zeitraums überschrieben.',
          'Kaufbelege werden von Apple, Google und RevenueCat nach deren eigenen Richtlinien und gesetzlichen Pflichten aufbewahrt.',
        ],
      },
      {
        h: 'Sicherheit',
        p: [
          'Daten werden bei der Übertragung verschlüsselt. Datenbankregeln stellen sicher, dass nur du und dein Gegenüber die Daten eures Paares lesen können. Fotos liegen in privatem Speicher und sind nur über kurzlebige Links abrufbar. Deine Anmeldesitzung wird verschlüsselt auf deinem Gerät gespeichert, der Schlüssel im Schlüsselbund des Systems.',
        ],
      },
      {
        h: 'Deine Rechte',
        p: [
          'Je nach Wohnort (u. a. nach der DSGVO und dem ukrainischen Gesetz „Über den Schutz personenbezogener Daten“) hast du das Recht auf Auskunft, Berichtigung, Löschung, Datenübertragbarkeit, Einschränkung der Verarbeitung, Widerspruch sowie den jederzeitigen Widerruf deiner Einwilligung.',
          'Die meisten Daten kannst du direkt in der App bearbeiten und dein Konto in den Einstellungen löschen. Für alles andere schreib an <a href="mailto:{email}">{email}</a> — wir antworten innerhalb von 30 Tagen. Du kannst dich auch bei einer Datenschutzaufsichtsbehörde beschweren: in der Ukraine beim Menschenrechtsbeauftragten des Parlaments, in der EU bei der Behörde deines Landes.',
        ],
      },
      {
        h: 'Alter',
        p: [
          'Dotyk richtet sich an Personen ab 16 Jahren. Wir erheben wissentlich keine Daten jüngerer Kinder. Wenn du glaubst, dass ein Kind ein Konto erstellt hat, melde dich bei uns und wir löschen es.',
        ],
      },
      {
        h: 'Änderungen dieser Erklärung',
        p: [
          'Wenn wir diese Erklärung ändern, aktualisieren wir das Datum oben und informieren dich in der App über wichtige Änderungen, bevor sie wirksam werden.',
        ],
      },
      { h: 'Kontakt', p: ['{owner}, Ukraine — <a href="mailto:{email}">{email}</a>'] },
    ],
  },
  terms: {
    title: 'Nutzungsbedingungen',
    intro:
      'Diese Bedingungen gelten für die Nutzung der App Dotyk. Mit dem Erstellen eines Kontos stimmst du ihnen zu. Bitte lies sie zusammen mit unserer <a href="privacy.html">Datenschutzerklärung</a>.',
    sections: [
      {
        h: 'Der Dienst',
        p: [
          'Dotyk wird von {owner}, Ukraine („wir“), bereitgestellt. Die App gibt zwei Menschen einen gemeinsamen Bereich: Erinnerungen, Notizen, Termine, Pläne, Spiele und ein virtuelles Haustier.',
        ],
      },
      {
        h: 'Wer Dotyk nutzen darf',
        p: [
          'Du musst mindestens 16 Jahre alt und in der Lage sein, diesen Bedingungen zuzustimmen. Du kannst jeweils nur in einem Paar sein.',
        ],
      },
      {
        h: 'Dein Konto',
        p: [
          'Mach wahrheitsgemäße Angaben und schütze deine Anmeldedaten. Du bist für Aktivitäten in deinem Konto verantwortlich. Sag uns Bescheid, wenn du glaubst, dass jemand anderes Zugriff hat.',
        ],
      },
      {
        h: 'Deine Inhalte',
        p: [
          'Alle Rechte an deinen Inhalten bleiben bei dir. Du gibst uns eine beschränkte Erlaubnis, sie zu speichern, zu verarbeiten und dir und deinem Gegenüber anzuzeigen — nur um die App zu betreiben.',
          'Füge nur Inhalte hinzu, die du teilen darfst. Lade keine Fotos anderer Personen ohne deren Einwilligung hoch und nutze Dotyk nicht für Rechtswidriges, Belästigendes oder Schädliches.',
          'Denk daran: Dein Gegenüber sieht, was du im gemeinsamen Bereich hinzufügst, und gemeinsame Inhalte werden für beide gelöscht, wenn einer von euch das Paar verlässt oder sein Konto löscht.',
        ],
      },
      {
        h: 'Zulässige Nutzung',
        ul: [
          'Versuche nicht, auf fremde Konten oder Daten zuzugreifen oder den Dienst zu stören.',
          'Kein Reverse Engineering, keine Überlastung und kein Missbrauch der App, ihrer Limits oder KI-Funktionen.',
          'Nutze die App nicht für Spam oder rechtswidrige Inhalte.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus ist optional. Die Grundfunktionen sind kostenlos.',
          'Plus wird über den App Store oder Google Play gekauft und gilt für euch beide, solange ihr ein Paar seid. Preis und Laufzeit werden vor dem Kauf angezeigt.',
          'Abos verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ende des laufenden Zeitraums gekündigt werden. Die Abbuchung erfolgt innerhalb von 24 Stunden vor der Verlängerung über dein Store-Konto.',
          'Abos verwaltest oder kündigst du in den Einstellungen deines App-Store- oder Google-Play-Kontos. Das Löschen der App oder deines Dotyk-Kontos kündigt kein Abo.',
          'Wird eine kostenlose Testphase angeboten, endet ein ungenutzter Rest mit dem Kauf eines Abos. Erstattungen bearbeiten Apple oder Google nach ihren Richtlinien.',
          'Ein einmaliger „Für immer“-Kauf gewährt Plus, solange die App angeboten wird.',
        ],
      },
      {
        h: 'KI-Funktionen',
        p: [
          'KI-Vorschläge werden automatisch erzeugt und können ungenau oder unpassend sein. Verlass dich auf dein eigenes Urteil. KI-Funktionen sind optional und im kostenlosen Tarif täglich begrenzt.',
        ],
      },
      {
        h: 'Änderungen und Verfügbarkeit',
        p: [
          'Wir entwickeln Dotyk weiter und können Funktionen ändern oder entfernen. Wir bemühen uns um Verfügbarkeit, können aber keinen unterbrechungsfreien Betrieb garantieren. Über wichtige Änderungen dieser Bedingungen informieren wir vorab.',
        ],
      },
      {
        h: 'Beendigung',
        p: [
          'Du kannst Dotyk jederzeit nicht mehr nutzen und dein Konto in den Einstellungen löschen. Wir können Konten sperren oder schließen, die schwer oder wiederholt gegen diese Bedingungen verstoßen.',
        ],
      },
      {
        h: 'Haftung',
        p: [
          'Die App wird „wie besehen“ bereitgestellt. Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden oder Datenverlust. Unberührt bleiben die Haftung für Vorsatz und grobe Fahrlässigkeit, für Schäden an Leben, Körper und Gesundheit sowie deine zwingenden Verbraucherrechte.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Wenn du Dotyk aus dem App Store geladen hast, gelten diese Bedingungen zwischen dir und uns, nicht Apple. Zusätzlich gilt Apples <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Endbenutzer-Lizenzvertrag (EULA)</a>; Apple ist nicht verpflichtet, Support für die App zu leisten.',
        ],
      },
      {
        h: 'Anwendbares Recht',
        p: [
          'Es gilt ukrainisches Recht. Als Verbraucher behältst du zusätzlich den Schutz der zwingenden Vorschriften des Landes, in dem du lebst.',
        ],
      },
      { h: 'Kontakt', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Dotyk-Konto löschen',
    intro: 'Du kannst dein Konto und deine Daten jederzeit direkt in der App löschen.',
    sections: [
      {
        h: 'In der App',
        ol: [
          'Öffne Dotyk und gehe zum Tab <strong>Profil</strong>.',
          'Scrolle zu <strong>Konto</strong>.',
          'Tippe auf <strong>Konto löschen</strong> und bestätige.',
        ],
      },
      {
        h: 'Was gelöscht wird',
        ul: [
          'Dein Konto, Name, E-Mail, Geburtsdatum und Profilfoto.',
          'Der gemeinsame Bereich eures Paares — Erinnerungen und Fotos, Notizen, Momente, Termine, Pläne, Spiele, Zeichnungen und euer Haustier. Er wird auch für dein Gegenüber entfernt.',
          'Push-Tokens und zwischengespeicherte KI-Antworten.',
        ],
        p2: [
          'Die Löschung erfolgt sofort. Kopien in Backups werden innerhalb eines begrenzten Zeitraums überschrieben.',
        ],
      },
      {
        h: 'Was nicht automatisch gelöscht wird',
        ul: [
          '<strong>Abos.</strong> Kündige Plus in den Einstellungen deines App-Store- oder Google-Play-Kontos — das Löschen des Kontos beendet keine Zahlungen.',
          'Kaufbelege, die Apple, Google und RevenueCat nach eigenen Richtlinien und gesetzlichen Pflichten aufbewahren.',
        ],
      },
      {
        h: 'Kein Zugriff auf die App?',
        p: [
          'Schreib an <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> von der Adresse, die du in Dotyk nutzt, mit dem Betreff „Mein Dotyk-Konto löschen“. Wir löschen das Konto innerhalb von 30 Tagen und bestätigen es per E-Mail.',
        ],
      },
    ],
  },
  support: {
    title: 'Support',
    intro:
      'Fragen, Ideen oder funktioniert etwas nicht? Schreib an <a href="mailto:{email}">{email}</a> — wir antworten meist innerhalb weniger Tage.',
    sections: [
      {
        h: 'Wie verbinden wir uns als Paar?',
        p: [
          'Eine Person erstellt das Paar und teilt den Einladungscode; die andere gibt ihn auf dem Bildschirm „Code deines Partners“ ein.',
        ],
      },
      {
        h: 'Wie kündige ich Plus?',
        p: [
          'In den Einstellungen deines App-Store- oder Google-Play-Kontos unter Abonnements. Plus bleibt bis zum Ende des bezahlten Zeitraums aktiv.',
        ],
      },
      {
        h: 'Ich habe Plus gekauft, aber es wird nicht angezeigt',
        p: [
          'Öffne den Tab Profil und tippe auf „Käufe wiederherstellen“. Achte darauf, mit demselben App-Store- oder Google-Play-Konto angemeldet zu sein.',
        ],
      },
      {
        h: 'Wie lösche ich mein Konto?',
        p: ['Siehe <a href="delete-account.html">Konto löschen</a>.'],
      },
    ],
  },
};
