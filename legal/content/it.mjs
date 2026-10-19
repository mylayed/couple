export default {
  langName: 'Italiano',
  ui: {
    updated: 'Ultimo aggiornamento: {updated}',
    nav: { privacy: 'Privacy', terms: 'Termini', delete: 'Elimina account', support: 'Assistenza' },
    indexTitle: 'Dotyk — note legali e assistenza',
    indexIntro:
      'Dotyk è un’app per coppie: ricordi condivisi, bigliettini, date, giochi e un cucciolo di cui prendervi cura insieme.',
  },
  privacy: {
    title: 'Informativa sulla privacy',
    intro:
      'Questa informativa spiega quali dati raccoglie Dotyk, perché, chi li tratta e come puoi controllarli. Abbiamo creato Dotyk perché la vita privata di una coppia resti privata: niente pubblicità, niente tracciamento, nessuna vendita di dati.',
    sections: [
      {
        h: 'Chi siamo',
        p: [
          'Dotyk è sviluppata e gestita da {owner}, persona fisica con sede in Ucraina («noi»). Siamo il titolare del trattamento dei tuoi dati personali. Contatto: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'Quali dati raccogliamo',
        p: ['<strong>Dati dell’account.</strong>'],
        ul: [
          'Email e password (la password è conservata solo come hash sicuro presso il nostro fornitore di autenticazione) oppure, se accedi con Google, email, nome e identificativo del tuo account Google.',
          'Il tuo nome e, se vuoi, data di nascita e foto del profilo.',
          'Impostazioni: lingua dell’app, attivazione dell’IA, preferenze di notifica.',
        ],
      },
      {
        p: [
          '<strong>Contenuti creati insieme.</strong> Ricordi e relative foto, commenti, bigliettini, momenti «Quando è stata l’ultima volta…», umori, risposte alla domanda del giorno, risposte ai giochi, sfide, lista dei desideri e liste condivise, date importanti, capsule del tempo, disegni, il vostro cucciolo condiviso e le cure che gli date, e i «tocchi» (cuore, abbraccio, ti penso). Questi contenuti sono visibili al tuo partner per scelta: è lo scopo dell’app.',
          '<strong>Dati di abbinamento.</strong> Il codice di invito che condividi e un registro dei tentativi di accesso, per evitare che qualcuno indovini il codice.',
          '<strong>Dati tecnici e del dispositivo.</strong> Un token per le notifiche push e la piattaforma (iOS o Android) per poter inviare notifiche. Il nostro fornitore di hosting tratta indirizzi IP e log delle richieste per far funzionare e proteggere il servizio.',
          '<strong>Acquisti.</strong> I pagamenti avvengono tramite App Store o Google Play; non vediamo mai i dati della tua carta. Il nostro fornitore di abbonamenti riceve il tuo identificativo nell’app e le ricevute di acquisto per confermare lo stato Plus. Conserviamo lo stato e la scadenza di Plus e da quale schermata è stata aperta l’offerta.',
          '<strong>Richieste all’IA.</strong> Solo quando tocchi un pulsante con ✨, e solo con i dati necessari a quella funzione (vedi «Funzioni di IA»). Contiamo le richieste per applicare il limite giornaliero.',
        ],
      },
      {
        h: 'Cosa non raccogliamo',
        ul: [
          'Nessuna pubblicità, nessun identificativo pubblicitario, nessun tracciamento su altre app o siti.',
          'Nessun SDK di analisi di terze parti.',
          'Niente posizione, contatti, registrazioni del microfono o della fotocamera. Solo le foto che scegli di aggiungere.',
          'Non vendiamo né affittiamo mai i tuoi dati.',
        ],
      },
      {
        h: 'Perché li usiamo (basi giuridiche)',
        ul: [
          '<strong>Fornire l’app</strong>: account, abbinamento, sincronizzazione dei contenuti condivisi, Plus (esecuzione del contratto).',
          '<strong>Funzioni facoltative</strong>: l’IA e le notifiche push funzionano solo se le attivi, e puoi disattivarle in qualsiasi momento (consenso).',
          '<strong>Sicurezza e prevenzione degli abusi</strong>: limiti di utilizzo, protezione dei codici di invito, correzione degli errori (legittimo interesse).',
          '<strong>Obblighi di legge</strong>: ad esempio registri fiscali e contabili tenuti dagli store.',
        ],
      },
      {
        h: 'Funzioni di IA',
        p: [
          'Le funzioni di IA (idee per uscite, aiuto con i bigliettini, la storia del vostro anno) sono facoltative. Le richieste passano dal nostro server e da lì al modello Claude di Anthropic. Secondo le condizioni di Anthropic, i dati inviati tramite la sua API non vengono usati per addestrare modelli.',
          'Inviamo solo ciò che serve alla funzione: per le idee per uscite, budget e umore scelti, il mese corrente, i vostri momenti più frequenti e i desideri ancora da realizzare; per i bigliettini, il tono, la tua bozza e il nome del partner; per la storia dell’anno, i numeri dell’anno, i vostri nomi, i momenti frequenti, i desideri realizzati e le didascalie dei ricordi. Foto, risposte alla domanda del giorno, umori, bigliettini e commenti del partner, la tua email e la data di nascita non vengono mai inviati.',
          'Le risposte finite restano in cache sul nostro server fino a 30 giorni, così la stessa richiesta non consuma il tuo limite. Se il tuo partner disattiva l’IA, nessun dato condiviso della coppia viene inviato.',
        ],
      },
      {
        h: 'Chi tratta i tuoi dati',
        p: ['Ci affidiamo a pochi fornitori che trattano dati per nostro conto:'],
        ul: [
          '<strong>Supabase</strong>: database, autenticazione, archiviazione delle foto e funzioni server.',
          '<strong>Anthropic</strong>: funzioni di IA, solo quando le usi.',
          '<strong>RevenueCat</strong>: gestione di acquisti in-app e abbonamenti.',
          '<strong>Apple e Google</strong>: accesso con Google, pagamenti e consegna delle notifiche push (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong>: servizio di notifiche push che inoltra le notifiche ad Apple e Google.',
        ],
        p2: [
          'Alcuni fornitori trattano dati fuori dall’Ucraina e dallo Spazio economico europeo, anche negli Stati Uniti. Ove necessario, i trasferimenti sono tutelati da clausole contrattuali standard o garanzie equivalenti offerte da questi fornitori.',
        ],
      },
      {
        h: 'Il tuo partner e i dati condivisi',
        p: [
          'Tutto ciò che aggiungi allo spazio della coppia è visibile al tuo partner, e tu vedi i suoi contenuti. Il partner vede anche il tuo nome, la foto del profilo e la data di nascita (per i promemoria di compleanno).',
          'Se uno dei due lascia la coppia o elimina l’account, lo spazio condiviso — tutti i contenuti e le foto condivisi — viene eliminato per entrambi. Così nessuno resta con i dati dell’altra persona.',
        ],
      },
      {
        h: 'Per quanto tempo conserviamo i dati',
        ul: [
          'Account e contenuti: finché esiste il tuo account. Ciò che elimini scompare subito per entrambi e viene cancellato definitivamente al più tardi quando viene eliminata la coppia.',
          'Risposte dell’IA in cache: fino a 30 giorni.',
          'Quando elimini l’account, profilo, foto del profilo, token push e spazio condiviso della coppia vengono eliminati subito. Le copie di backup del nostro fornitore di hosting vengono sovrascritte entro un periodo limitato.',
          'Le ricevute di acquisto sono conservate da Apple, Google e RevenueCat secondo le loro politiche e obblighi di legge.',
        ],
      },
      {
        h: 'Sicurezza',
        p: [
          'I dati sono cifrati in transito. Le regole del database garantiscono che solo tu e il tuo partner possiate leggere i dati della vostra coppia. Le foto sono conservate in uno spazio privato e accessibili solo tramite link temporanei. La sessione è salvata cifrata sul dispositivo, con la chiave nel portachiavi di sistema.',
        ],
      },
      {
        h: 'I tuoi diritti',
        p: [
          'A seconda di dove vivi (incluso il GDPR e la legge ucraina sulla protezione dei dati personali), hai diritto di accedere ai tuoi dati, rettificarli, cancellarli, riceverne una copia portabile, limitarne o opporti al trattamento e revocare il consenso in qualsiasi momento.',
          'Puoi modificare la maggior parte dei dati nell’app ed eliminare l’account nelle Impostazioni. Per tutto il resto scrivi a <a href="mailto:{email}">{email}</a>: rispondiamo entro 30 giorni. Puoi anche presentare reclamo a un’autorità per la protezione dei dati: in Ucraina, il Commissario del Parlamento per i diritti umani; nell’UE, l’autorità del tuo paese (in Italia, il Garante per la protezione dei dati personali).',
        ],
      },
      {
        h: 'Età',
        p: [
          'Dotyk è destinata a persone dai 16 anni in su. Non raccogliamo consapevolmente dati di minori di questa età. Se pensi che un minore abbia creato un account, contattaci e lo elimineremo.',
        ],
      },
      {
        h: 'Modifiche a questa informativa',
        p: [
          'Se modifichiamo l’informativa, aggiorneremo la data in alto e ti avviseremo nell’app delle modifiche importanti prima che entrino in vigore.',
        ],
      },
      { h: 'Contatti', p: ['{owner}, Ucraina — <a href="mailto:{email}">{email}</a>'] },
    ],
  },
  terms: {
    title: 'Termini di utilizzo',
    intro:
      'Questi termini si applicano quando usi l’app Dotyk. Creando un account li accetti. Leggili insieme alla nostra <a href="privacy.html">Informativa sulla privacy</a>.',
    sections: [
      {
        h: 'Il servizio',
        p: [
          'Dotyk è fornita da {owner}, Ucraina («noi»). L’app permette a due persone di creare uno spazio condiviso: ricordi, bigliettini, date, progetti, giochi e un cucciolo virtuale.',
        ],
      },
      {
        h: 'Chi può usare Dotyk',
        p: [
          'Devi avere almeno 16 anni ed essere in grado di accettare questi termini. Puoi far parte di una sola coppia alla volta.',
        ],
      },
      {
        h: 'Il tuo account',
        p: [
          'Fornisci dati veritieri e proteggi le tue credenziali. Sei responsabile dell’attività del tuo account. Avvisaci se pensi che qualcun altro vi abbia accesso.',
        ],
      },
      {
        h: 'I tuoi contenuti',
        p: [
          'Mantieni tutti i diritti su ciò che aggiungi. Ci concedi un permesso limitato di conservare, trattare e mostrare i tuoi contenuti a te e al tuo partner, solo per far funzionare l’app.',
          'Aggiungi solo contenuti che hai il diritto di condividere. Non caricare foto di altre persone senza il loro consenso e non usare Dotyk per scopi illeciti, molesti o dannosi.',
          'Ricorda che il partner vede ciò che aggiungi allo spazio condiviso e che i contenuti condivisi vengono eliminati per entrambi se uno dei due lascia la coppia o elimina l’account.',
        ],
      },
      {
        h: 'Uso consentito',
        ul: [
          'Non tentare di accedere ad account o dati altrui né di interferire con il servizio.',
          'Niente reverse engineering, sovraccarico o abuso dell’app, dei suoi limiti o delle funzioni di IA.',
          'Non usare l’app per spam o contenuti illeciti.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus è facoltativo. Le funzioni di base sono gratuite.',
          'Plus si acquista tramite App Store o Google Play ed è condiviso con il partner finché siete in coppia. Prezzo e durata sono mostrati prima dell’acquisto.',
          'Gli abbonamenti si rinnovano automaticamente se non vengono disdetti almeno 24 ore prima della fine del periodo in corso. L’addebito avviene sul tuo account dello store nelle 24 ore precedenti al rinnovo.',
          'Puoi gestire o disdire l’abbonamento nelle impostazioni del tuo account App Store o Google Play. Eliminare l’app o l’account Dotyk non disdice l’abbonamento.',
          'Se è offerta una prova gratuita, la parte non usata termina con l’acquisto di un abbonamento. I rimborsi sono gestiti da Apple o Google secondo le loro regole.',
          'Un acquisto unico «per sempre» dà accesso a Plus finché l’app è disponibile.',
        ],
      },
      {
        h: 'Funzioni di IA',
        p: [
          'I suggerimenti dell’IA sono generati automaticamente e possono essere imprecisi o inadatti. Usa il tuo giudizio. Le funzioni di IA sono facoltative e hanno limiti giornalieri nel piano gratuito.',
        ],
      },
      {
        h: 'Modifiche e disponibilità',
        p: [
          'Miglioriamo Dotyk continuamente e possiamo modificare o rimuovere funzioni. Facciamo il possibile perché l’app sia disponibile, ma non possiamo garantire che funzioni sempre senza interruzioni. Ti avviseremo in anticipo delle modifiche importanti a questi termini.',
        ],
      },
      {
        h: 'Cessazione',
        p: [
          'Puoi smettere di usare Dotyk ed eliminare l’account in qualsiasi momento nelle Impostazioni. Possiamo sospendere o chiudere gli account che violano questi termini in modo grave o ripetuto.',
        ],
      },
      {
        h: 'Responsabilità',
        p: [
          'L’app è fornita «così com’è». Nei limiti consentiti dalla legge, non rispondiamo di danni indiretti o perdita di dati. Nulla in questi termini limita i diritti che ti spettano come consumatore secondo la legge del tuo paese.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Se hai scaricato Dotyk dall’App Store, questi termini sono tra te e noi, non Apple. Si applica anche il <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Contratto di licenza per l’utente finale di Apple</a>, e Apple non ha alcun obbligo di fornire assistenza per l’app.',
        ],
      },
      {
        h: 'Legge applicabile',
        p: [
          'Questi termini sono regolati dalla legge ucraina. Se sei un consumatore, mantieni anche la tutela delle norme imperative del paese in cui vivi.',
        ],
      },
      { h: 'Contatti', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Eliminare l’account Dotyk',
    intro: 'Puoi eliminare account e dati in qualsiasi momento, direttamente nell’app.',
    sections: [
      {
        h: 'Nell’app',
        ol: [
          'Apri Dotyk e vai alla scheda <strong>Profilo</strong>.',
          'Scorri fino ad <strong>Account</strong>.',
          'Tocca <strong>Elimina account</strong> e conferma.',
        ],
      },
      {
        h: 'Cosa viene eliminato',
        ul: [
          'Il tuo account, nome, email, data di nascita e foto del profilo.',
          'Lo spazio condiviso della coppia — ricordi e foto, bigliettini, momenti, date, progetti, giochi, disegni e il vostro cucciolo. Scompare anche per il partner.',
          'I token delle notifiche push e le risposte dell’IA in cache.',
        ],
        p2: [
          'L’eliminazione è immediata. Le copie di backup vengono sovrascritte entro un periodo limitato.',
        ],
      },
      {
        h: 'Cosa non viene eliminato automaticamente',
        ul: [
          '<strong>Abbonamenti.</strong> Disdici Plus nelle impostazioni del tuo account App Store o Google Play: eliminare l’account non interrompe i pagamenti.',
          'Le ricevute di acquisto conservate da Apple, Google e RevenueCat secondo le loro politiche e obblighi di legge.',
        ],
      },
      {
        h: 'Non hai accesso all’app?',
        p: [
          'Scrivi a <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> dall’indirizzo che usi in Dotyk con oggetto «Elimina il mio account Dotyk». Elimineremo l’account entro 30 giorni e te lo confermeremo via email.',
        ],
      },
    ],
  },
  support: {
    title: 'Assistenza',
    intro:
      'Domande, idee o qualcosa non funziona? Scrivi a <a href="mailto:{email}">{email}</a>: di solito rispondiamo in pochi giorni.',
    sections: [
      {
        h: 'Come ci colleghiamo come coppia?',
        p: [
          'Uno di voi crea la coppia e condivide il codice di invito; l’altro lo inserisce nella schermata «Codice del partner».',
        ],
      },
      {
        h: 'Come disdico Plus?',
        p: [
          'Nelle impostazioni del tuo account App Store o Google Play, in Abbonamenti. Plus resta attivo fino alla fine del periodo pagato.',
        ],
      },
      {
        h: 'Ho acquistato Plus ma non compare',
        p: [
          'Apri la scheda Profilo e tocca «Ripristina acquisti». Verifica di aver effettuato l’accesso con lo stesso account App Store o Google Play.',
        ],
      },
      {
        h: 'Come elimino l’account?',
        p: ['Vedi <a href="delete-account.html">Elimina account</a>.'],
      },
    ],
  },
};
