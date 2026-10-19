// English is the source text; other languages translate it section by section.
// {owner}, {email}, {updated} and {base} are filled in by legal/build.mjs.
export default {
  langName: 'English',
  ui: {
    updated: 'Last updated: {updated}',
    nav: { privacy: 'Privacy', terms: 'Terms', delete: 'Delete account', support: 'Support' },
    indexTitle: 'Dotyk — legal and support',
    indexIntro:
      'Dotyk is an app for couples: shared memories, notes, dates, games and a pet you look after together.',
  },
  privacy: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what data Dotyk collects, why, who processes it and how you can control it. We built Dotyk to keep the private life of a couple private: no ads, no tracking, no selling of data.',
    sections: [
      {
        h: 'Who we are',
        p: [
          'Dotyk is developed and operated by {owner}, an individual based in Ukraine ("we", "us"). We are the controller of your personal data. Contact: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'What we collect',
        p: ['<strong>Account data.</strong>'],
        ul: [
          'Email address and password (the password is stored only as a secure hash by our authentication provider), or, if you sign in with Google, your Google account email, name and account identifier.',
          'Your name, and optionally your date of birth and profile photo.',
          'Settings: app language, whether AI features are on, notification preferences.',
        ],
      },
      {
        p: [
          '<strong>Content you create together.</strong> Memories and their photos, comments, notes, "When did we last…" moments, moods, answers to the question of the day, game answers, challenges, bucket list and shared lists, important dates, time capsules, drawings, your shared pet and the care actions for it, and "touches" (heart, hug, thinking of you). This content is shared with your partner by design — that is what the app is for.',
          '<strong>Pairing data.</strong> The invite code you share with your partner and a record of join attempts, used to prevent code guessing.',
          '<strong>Device and technical data.</strong> A push notification token and the platform (iOS or Android) so we can deliver notifications. Our hosting provider processes IP addresses and request logs to operate and protect the service.',
          '<strong>Purchases.</strong> Payments are made through the App Store or Google Play; we never see your card details. Our subscription provider receives your in-app user identifier and purchase receipts so we can confirm your Plus status. We store the status and expiry date of Plus and which screen the offer was opened from.',
          '<strong>AI requests.</strong> Only when you tap a button marked ✨, and only the data that feature needs (see "AI features" below). We count requests to apply the daily limit.',
        ],
      },
      {
        h: 'What we do not collect',
        ul: [
          'No advertising, no advertising identifiers, no tracking across other apps or websites.',
          'No third-party analytics SDKs.',
          'No location, contacts, microphone or camera recordings. Photos are only those you choose to add.',
          'We never sell or rent your data.',
        ],
      },
      {
        h: 'Why we use it (legal bases)',
        ul: [
          '<strong>To provide the app</strong> — accounts, pairing, syncing your shared content, Plus (performance of a contract).',
          '<strong>Optional features</strong> — AI features and push notifications work only when you turn them on, and you can turn them off at any time (consent).',
          '<strong>Security and abuse prevention</strong> — rate limits, protecting invite codes, fixing errors (legitimate interests).',
          '<strong>Legal obligations</strong> — for example, tax and accounting records kept by the app stores.',
        ],
      },
      {
        h: 'AI features',
        p: [
          "AI features (date ideas, help with notes, the story of your year) are optional. Requests go to our server and from there to the Claude model by Anthropic. Under Anthropic's terms, data sent through its API is not used to train models.",
          "We send only what the feature needs: for date ideas — the chosen budget and mood, the current month, your most frequent moments and open bucket list items; for notes — the tone, your draft and your partner's name; for the year story — the year's numbers, your names, frequent moments, completed dreams and memory captions. Photos, answers to the question of the day, moods, your partner's notes and comments, your email and date of birth are never sent.",
          'Finished answers are cached on our server for up to 30 days so the same request does not use up your limit. If your partner turns AI off, shared data of the couple is not sent at all.',
        ],
      },
      {
        h: 'Who processes your data',
        p: ['We use a small number of service providers who process data on our behalf:'],
        ul: [
          '<strong>Supabase</strong> — database, authentication, photo storage and server functions.',
          '<strong>Anthropic</strong> — AI features, only when you use them.',
          '<strong>RevenueCat</strong> — managing in-app purchases and subscriptions.',
          '<strong>Apple and Google</strong> — Sign in with Google, payments, and delivery of push notifications (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong> — the push notification service that forwards notifications to Apple and Google.',
        ],
        p2: [
          'Some providers process data outside Ukraine and the European Economic Area, including in the United States. Where required, transfers are protected by standard contractual clauses or equivalent safeguards offered by these providers.',
        ],
      },
      {
        h: 'Your partner and shared data',
        p: [
          "Everything you add to the couple's space is visible to your partner, and your partner's content is visible to you. Your partner also sees your name, profile photo and date of birth (used for birthday reminders).",
          "If either partner leaves the couple or deletes their account, the couple's shared space — all shared content and photos — is deleted for both partners. This prevents anyone from being left with the other person's data.",
        ],
      },
      {
        h: 'How long we keep data',
        ul: [
          'Account and content — while your account exists. Items you delete disappear immediately for both of you and are erased permanently, at the latest, when the couple is deleted.',
          'Cached AI answers — up to 30 days.',
          "When you delete your account, your profile, profile photo, push tokens and the couple's shared space are deleted right away. Copies in our hosting provider's backups are overwritten within a limited period.",
          'Purchase records are kept by Apple, Google and RevenueCat under their own policies and legal obligations.',
        ],
      },
      {
        h: 'Security',
        p: [
          "Data is encrypted in transit. Database rules ensure that only you and your partner can read your couple's data. Photos are stored in private storage and are available only through short-lived links. Your sign-in session is stored encrypted on your device, with the key kept in the system keychain.",
        ],
      },
      {
        h: 'Your rights',
        p: [
          'Depending on where you live (including under the GDPR and the Law of Ukraine "On Personal Data Protection"), you have the right to access your data, correct it, delete it, receive a copy in a portable format, restrict or object to processing, and withdraw consent at any time.',
          'You can edit most data directly in the app and delete your account in Settings. For anything else, write to <a href="mailto:{email}">{email}</a> — we reply within 30 days. You can also complain to a data protection authority: in Ukraine — the Ukrainian Parliament Commissioner for Human Rights; in the EU — the authority in your country.',
        ],
      },
      {
        h: 'Age',
        p: [
          'Dotyk is intended for people aged 16 and over. We do not knowingly collect data from younger children. If you believe a child has created an account, contact us and we will delete it.',
        ],
      },
      {
        h: 'Changes to this policy',
        p: [
          'If we change this policy, we will update the date above, and we will tell you in the app about important changes before they take effect.',
        ],
      },
      {
        h: 'Contact',
        p: ['{owner}, Ukraine — <a href="mailto:{email}">{email}</a>'],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    intro:
      'These terms apply when you use the Dotyk app. By creating an account you agree to them. Please read them together with our <a href="privacy.html">Privacy Policy</a>.',
    sections: [
      {
        h: 'The service',
        p: [
          'Dotyk is provided by {owner}, Ukraine ("we"). The app lets two people create a shared space: memories, notes, dates, plans, games and a virtual pet.',
        ],
      },
      {
        h: 'Who can use Dotyk',
        p: [
          'You must be at least 16 years old and able to agree to these terms. You may be in one couple at a time.',
        ],
      },
      {
        h: 'Your account',
        p: [
          'Provide accurate information and keep your sign-in details safe. You are responsible for activity in your account. Tell us if you think someone else has access to it.',
        ],
      },
      {
        h: 'Your content',
        p: [
          'You keep all rights to what you add. You give us a limited permission to store, process and show your content to you and your partner only to run the app.',
          'Only add content you have the right to share. Do not upload photos of other people without their consent, and do not use Dotyk for anything illegal, harassing or harmful.',
          'Remember that your partner sees what you add to the shared space, and that shared content is deleted for both of you if either of you leaves the couple or deletes their account.',
        ],
      },
      {
        h: 'Acceptable use',
        ul: [
          "Do not try to access other people's accounts or data, or interfere with the service.",
          'Do not reverse engineer, overload or abuse the app, its limits or its AI features.',
          'Do not use the app to send spam or unlawful content.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus is optional. Core features are free.',
          'Plus is bought through the App Store or Google Play and is shared with your partner while you are paired. The price and period are shown before you buy.',
          'Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Your store account is charged within 24 hours before renewal.',
          'You can manage or cancel a subscription in your App Store or Google Play account settings. Deleting the app or your Dotyk account does not cancel a subscription.',
          'If a free trial is offered, any unused part of it ends when you buy a subscription. Refunds are handled by Apple or Google under their policies.',
          'A one-time "forever" purchase gives Plus for as long as the app is offered.',
        ],
      },
      {
        h: 'AI features',
        p: [
          'AI suggestions are generated automatically and may be inaccurate or unsuitable. Use your own judgement. AI features are optional and have daily limits on the free plan.',
        ],
      },
      {
        h: 'Changes and availability',
        p: [
          'We keep improving Dotyk and may change or remove features. We try to keep the app available but cannot promise it will always work without interruptions. We will tell you in advance about important changes to these terms.',
        ],
      },
      {
        h: 'Ending your use',
        p: [
          'You can stop using Dotyk and delete your account at any time in Settings. We may suspend or close accounts that seriously or repeatedly break these terms.',
        ],
      },
      {
        h: 'Liability',
        p: [
          'The app is provided "as is". To the extent permitted by law, we are not liable for indirect damages or loss of data. Nothing in these terms limits rights you have as a consumer under the law of your country.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'If you downloaded Dotyk from the App Store, these terms are between you and us, not Apple. Apple\'s <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Licensed Application End User License Agreement</a> also applies, and Apple has no obligation to provide support for the app.',
        ],
      },
      {
        h: 'Law',
        p: [
          'These terms are governed by the law of Ukraine. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live.',
        ],
      },
      {
        h: 'Contact',
        p: ['<a href="mailto:{email}">{email}</a>'],
      },
    ],
  },
  delete: {
    title: 'Delete your Dotyk account',
    intro: 'You can delete your account and data at any time, directly in the app.',
    sections: [
      {
        h: 'In the app',
        ol: [
          'Open Dotyk and go to the <strong>Profile</strong> tab.',
          'Scroll down to <strong>Account</strong>.',
          'Tap <strong>Delete account</strong> and confirm.',
        ],
      },
      {
        h: 'What is deleted',
        ul: [
          'Your account, name, email, date of birth and profile photo.',
          "Your couple's shared space — memories and photos, notes, moments, dates, plans, games, drawings and your pet. This also removes it for your partner.",
          'Push notification tokens and cached AI answers.',
        ],
        p2: [
          'Deletion happens immediately. Copies in backups are overwritten within a limited period.',
        ],
      },
      {
        h: 'What is not deleted automatically',
        ul: [
          '<strong>Subscriptions.</strong> Cancel Plus in your App Store or Google Play account settings — deleting the account does not stop payments.',
          'Purchase records kept by Apple, Google and RevenueCat under their own policies and legal obligations.',
        ],
      },
      {
        h: 'No access to the app?',
        p: [
          'Email <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> from the address you use in Dotyk with the subject "Delete my Dotyk account". We will delete the account within 30 days and confirm by email.',
        ],
      },
    ],
  },
  support: {
    title: 'Support',
    intro:
      'Questions, ideas or something not working? Write to <a href="mailto:{email}">{email}</a> — we usually reply within a few days.',
    sections: [
      {
        h: 'How do we connect as a couple?',
        p: [
          'One of you creates a couple and shares the invite code; the other enters it on the "Partner’s code" screen.',
        ],
      },
      {
        h: 'How do I cancel Plus?',
        p: [
          'In your App Store or Google Play account settings, under Subscriptions. Plus stays active until the end of the paid period.',
        ],
      },
      {
        h: 'I bought Plus but it is not showing',
        p: [
          'Open the Profile tab and tap "Restore purchases". Make sure you are signed in to the same App Store or Google Play account.',
        ],
      },
      {
        h: 'How do I delete my account?',
        p: ['See <a href="delete-account.html">Delete account</a>.'],
      },
    ],
  },
};
