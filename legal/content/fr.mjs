export default {
  langName: 'Français',
  ui: {
    updated: 'Dernière mise à jour : {updated}',
    nav: {
      privacy: 'Confidentialité',
      terms: 'Conditions',
      delete: 'Supprimer le compte',
      support: 'Assistance',
    },
    indexTitle: 'Dotyk — informations légales et assistance',
    indexIntro:
      'Dotyk est une app pour les couples : souvenirs partagés, mots doux, dates, jeux et un animal dont vous prenez soin ensemble.',
  },
  privacy: {
    title: 'Politique de confidentialité',
    intro:
      'Cette politique explique quelles données Dotyk collecte, pourquoi, qui les traite et comment vous pouvez les contrôler. Nous avons créé Dotyk pour que la vie privée d’un couple reste privée : pas de publicité, pas de pistage, pas de vente de données.',
    sections: [
      {
        h: 'Qui sommes-nous',
        p: [
          'Dotyk est développé et exploité par {owner}, personne physique établie en Ukraine (« nous »). Nous sommes le responsable du traitement de vos données personnelles. Contact : <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'Données collectées',
        p: ['<strong>Données de compte.</strong>'],
        ul: [
          'Adresse e-mail et mot de passe (le mot de passe n’est conservé que sous forme de hachage sécurisé chez notre prestataire d’authentification) ou, si vous vous connectez avec Google, l’e-mail, le nom et l’identifiant de votre compte Google.',
          'Votre prénom et, si vous le souhaitez, votre date de naissance et votre photo de profil.',
          'Réglages : langue de l’app, activation de l’IA, préférences de notifications.',
        ],
      },
      {
        p: [
          '<strong>Contenus créés ensemble.</strong> Souvenirs et leurs photos, commentaires, mots doux, moments « À quand remonte la dernière fois… », humeurs, réponses à la question du jour, réponses aux jeux, défis, liste d’envies et listes partagées, dates importantes, capsules temporelles, dessins, votre animal partagé et les soins qui lui sont apportés, ainsi que les « touches » (cœur, câlin, je pense à toi). Ces contenus sont visibles par votre partenaire : c’est le principe de l’app.',
          '<strong>Données d’association.</strong> Le code d’invitation que vous partagez et un historique des tentatives, pour empêcher qu’on devine le code.',
          '<strong>Données techniques et de l’appareil.</strong> Un jeton de notifications push et la plateforme (iOS ou Android) pour envoyer les notifications. Notre hébergeur traite les adresses IP et les journaux de requêtes pour faire fonctionner et protéger le service.',
          '<strong>Achats.</strong> Les paiements passent par l’App Store ou Google Play ; nous ne voyons jamais vos données bancaires. Notre prestataire d’abonnements reçoit votre identifiant dans l’app et les reçus d’achat pour confirmer votre statut Plus. Nous conservons le statut et la date d’expiration de Plus et l’écran depuis lequel l’offre a été ouverte.',
          '<strong>Requêtes d’IA.</strong> Uniquement quand vous touchez un bouton marqué ✨, et uniquement avec les données nécessaires à cette fonction (voir « Fonctions d’IA »). Nous comptons les requêtes pour appliquer la limite quotidienne.',
        ],
      },
      {
        h: 'Ce que nous ne collectons pas',
        ul: [
          'Aucune publicité, aucun identifiant publicitaire, aucun pistage dans d’autres apps ou sites.',
          'Aucun SDK d’analyse tiers.',
          'Ni localisation, ni contacts, ni enregistrements du micro ou de la caméra. Seulement les photos que vous choisissez d’ajouter.',
          'Nous ne vendons ni ne louons jamais vos données.',
        ],
      },
      {
        h: 'Finalités et bases légales',
        ul: [
          '<strong>Fournir l’app</strong> : comptes, association, synchronisation des contenus partagés, Plus (exécution du contrat).',
          '<strong>Fonctions facultatives</strong> : l’IA et les notifications push ne fonctionnent que si vous les activez, et vous pouvez les désactiver à tout moment (consentement).',
          '<strong>Sécurité et prévention des abus</strong> : limites d’usage, protection des codes d’invitation, correction des erreurs (intérêt légitime).',
          '<strong>Obligations légales</strong> : par exemple les registres fiscaux et comptables tenus par les boutiques d’apps.',
        ],
      },
      {
        h: 'Fonctions d’IA',
        p: [
          'Les fonctions d’IA (idées de sorties, aide pour les mots doux, l’histoire de votre année) sont facultatives. Les requêtes passent par notre serveur puis vont au modèle Claude d’Anthropic. Selon les conditions d’Anthropic, les données envoyées via son API ne servent pas à entraîner les modèles.',
          'Nous n’envoyons que ce dont la fonction a besoin : pour les idées de sorties, le budget et l’humeur choisis, le mois en cours, vos moments les plus fréquents et les envies non réalisées ; pour les mots doux, le ton, votre brouillon et le prénom de votre partenaire ; pour l’histoire de l’année, les chiffres de l’année, vos prénoms, les moments fréquents, les envies réalisées et les légendes des souvenirs. Les photos, réponses à la question du jour, humeurs, mots et commentaires de votre partenaire, votre e-mail et votre date de naissance ne sont jamais envoyés.',
          'Les réponses finales sont mises en cache sur notre serveur jusqu’à 30 jours afin qu’une même requête ne consomme pas votre limite. Si votre partenaire désactive l’IA, aucune donnée partagée du couple n’est envoyée.',
        ],
      },
      {
        h: 'Qui traite vos données',
        p: [
          'Nous faisons appel à quelques prestataires qui traitent des données pour notre compte :',
        ],
        ul: [
          '<strong>Supabase</strong> : base de données, authentification, stockage des photos et fonctions serveur.',
          '<strong>Anthropic</strong> : fonctions d’IA, uniquement quand vous les utilisez.',
          '<strong>RevenueCat</strong> : gestion des achats intégrés et abonnements.',
          '<strong>Apple et Google</strong> : connexion avec Google, paiements et acheminement des notifications push (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong> : service de notifications push qui transmet les notifications à Apple et Google.',
        ],
        p2: [
          'Certains prestataires traitent des données hors d’Ukraine et de l’Espace économique européen, notamment aux États-Unis. Lorsque c’est nécessaire, les transferts sont encadrés par des clauses contractuelles types ou des garanties équivalentes offertes par ces prestataires.',
        ],
      },
      {
        h: 'Votre partenaire et les données partagées',
        p: [
          'Tout ce que vous ajoutez à l’espace du couple est visible par votre partenaire, et vous voyez ses contenus. Votre partenaire voit aussi votre prénom, votre photo de profil et votre date de naissance (pour les rappels d’anniversaire).',
          'Si l’un de vous quitte le couple ou supprime son compte, l’espace partagé — tous les contenus et photos partagés — est supprimé pour les deux. Ainsi, personne ne reste avec les données de l’autre.',
        ],
      },
      {
        h: 'Durée de conservation',
        ul: [
          'Compte et contenus : tant que votre compte existe. Ce que vous supprimez disparaît aussitôt pour vous deux et est effacé définitivement au plus tard à la suppression du couple.',
          'Réponses d’IA en cache : jusqu’à 30 jours.',
          'À la suppression de votre compte, votre profil, votre photo de profil, vos jetons push et l’espace partagé du couple sont supprimés immédiatement. Les copies de sauvegarde de notre hébergeur sont écrasées dans un délai limité.',
          'Les justificatifs d’achat sont conservés par Apple, Google et RevenueCat selon leurs propres politiques et obligations légales.',
        ],
      },
      {
        h: 'Sécurité',
        p: [
          'Les données sont chiffrées en transit. Les règles de la base de données garantissent que seuls vous et votre partenaire pouvez lire les données de votre couple. Les photos sont stockées dans un espace privé et accessibles uniquement via des liens temporaires. Votre session est enregistrée chiffrée sur votre appareil, la clé étant conservée dans le trousseau du système.',
        ],
      },
      {
        h: 'Vos droits',
        p: [
          'Selon votre lieu de résidence (notamment au titre du RGPD et de la loi ukrainienne sur la protection des données personnelles), vous avez le droit d’accéder à vos données, de les rectifier, de les effacer, d’en recevoir une copie portable, de limiter le traitement ou de vous y opposer, et de retirer votre consentement à tout moment.',
          'Vous pouvez modifier la plupart des données dans l’app et supprimer votre compte dans les Réglages. Pour toute autre demande, écrivez à <a href="mailto:{email}">{email}</a> ; nous répondons sous 30 jours. Vous pouvez aussi saisir une autorité de protection des données : en Ukraine, le Commissaire aux droits de l’homme du Parlement ; dans l’UE, l’autorité de votre pays (en France, la CNIL).',
        ],
      },
      {
        h: 'Âge',
        p: [
          'Dotyk est destiné aux personnes de 16 ans et plus. Nous ne collectons pas sciemment de données d’enfants plus jeunes. Si vous pensez qu’un enfant a créé un compte, contactez-nous et nous le supprimerons.',
        ],
      },
      {
        h: 'Modifications de cette politique',
        p: [
          'Si nous modifions cette politique, nous mettrons à jour la date ci-dessus et vous informerons dans l’app des changements importants avant leur entrée en vigueur.',
        ],
      },
      { h: 'Contact', p: ['{owner}, Ukraine — <a href="mailto:{email}">{email}</a>'] },
    ],
  },
  terms: {
    title: 'Conditions d’utilisation',
    intro:
      'Ces conditions s’appliquent à l’utilisation de l’app Dotyk. En créant un compte, vous les acceptez. Lisez-les avec notre <a href="privacy.html">Politique de confidentialité</a>.',
    sections: [
      {
        h: 'Le service',
        p: [
          'Dotyk est fourni par {owner}, Ukraine (« nous »). L’app permet à deux personnes de créer un espace partagé : souvenirs, mots doux, dates, projets, jeux et un animal virtuel.',
        ],
      },
      {
        h: 'Qui peut utiliser Dotyk',
        p: [
          'Vous devez avoir au moins 16 ans et être en mesure d’accepter ces conditions. Vous ne pouvez faire partie que d’un seul couple à la fois.',
        ],
      },
      {
        h: 'Votre compte',
        p: [
          'Fournissez des informations exactes et protégez vos identifiants. Vous êtes responsable de l’activité de votre compte. Prévenez-nous si vous pensez que quelqu’un d’autre y a accès.',
        ],
      },
      {
        h: 'Vos contenus',
        p: [
          'Vous conservez tous les droits sur ce que vous ajoutez. Vous nous accordez une autorisation limitée de stocker, traiter et afficher vos contenus à vous et à votre partenaire, uniquement pour faire fonctionner l’app.',
          'N’ajoutez que des contenus que vous avez le droit de partager. Ne publiez pas de photos d’autres personnes sans leur accord et n’utilisez pas Dotyk à des fins illégales, de harcèlement ou nuisibles.',
          'Votre partenaire voit ce que vous ajoutez à l’espace partagé, et les contenus partagés sont supprimés pour vous deux si l’un de vous quitte le couple ou supprime son compte.',
        ],
      },
      {
        h: 'Usage acceptable',
        ul: [
          'N’essayez pas d’accéder aux comptes ou données d’autrui ni de perturber le service.',
          'Pas de rétro-ingénierie, de surcharge ou d’abus de l’app, de ses limites ou de ses fonctions d’IA.',
          'N’utilisez pas l’app pour du spam ou des contenus illicites.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'Plus est facultatif. Les fonctions de base sont gratuites.',
          'Plus s’achète via l’App Store ou Google Play et est partagé avec votre partenaire tant que vous êtes en couple dans l’app. Le prix et la durée sont affichés avant l’achat.',
          'Les abonnements se renouvellent automatiquement sauf résiliation au moins 24 heures avant la fin de la période en cours. Votre compte de la boutique est débité dans les 24 heures précédant le renouvellement.',
          'Vous pouvez gérer ou résilier l’abonnement dans les réglages de votre compte App Store ou Google Play. Supprimer l’app ou votre compte Dotyk ne résilie pas l’abonnement.',
          'Si un essai gratuit est proposé, la partie non utilisée prend fin à l’achat d’un abonnement. Les remboursements sont gérés par Apple ou Google selon leurs règles.',
          'Un achat unique « à vie » donne accès à Plus tant que l’app est proposée.',
        ],
      },
      {
        h: 'Fonctions d’IA',
        p: [
          'Les suggestions de l’IA sont générées automatiquement et peuvent être inexactes ou inadaptées. Faites preuve de discernement. Les fonctions d’IA sont facultatives et limitées chaque jour dans l’offre gratuite.',
        ],
      },
      {
        h: 'Évolutions et disponibilité',
        p: [
          'Nous améliorons Dotyk en continu et pouvons modifier ou retirer des fonctions. Nous faisons notre possible pour que l’app soit disponible, sans pouvoir garantir l’absence d’interruptions. Nous vous informerons à l’avance des changements importants de ces conditions.',
        ],
      },
      {
        h: 'Fin d’utilisation',
        p: [
          'Vous pouvez cesser d’utiliser Dotyk et supprimer votre compte à tout moment dans les Réglages. Nous pouvons suspendre ou fermer les comptes qui enfreignent gravement ou de façon répétée ces conditions.',
        ],
      },
      {
        h: 'Responsabilité',
        p: [
          'L’app est fournie « en l’état ». Dans les limites permises par la loi, nous ne sommes pas responsables des dommages indirects ni de la perte de données. Rien dans ces conditions ne limite les droits que vous confère la loi de votre pays en tant que consommateur.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Si vous avez téléchargé Dotyk sur l’App Store, ces conditions vous lient à nous et non à Apple. Le <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Contrat de licence utilisateur final d’Apple</a> s’applique également, et Apple n’est pas tenue d’assurer l’assistance de l’app.',
        ],
      },
      {
        h: 'Droit applicable',
        p: [
          'Ces conditions sont régies par le droit ukrainien. Si vous êtes consommateur, vous conservez la protection des dispositions impératives du pays où vous vivez.',
        ],
      },
      { h: 'Contact', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Supprimer votre compte Dotyk',
    intro:
      'Vous pouvez supprimer votre compte et vos données à tout moment, directement dans l’app.',
    sections: [
      {
        h: 'Dans l’app',
        ol: [
          'Ouvrez Dotyk et allez dans l’onglet <strong>Profil</strong>.',
          'Faites défiler jusqu’à <strong>Compte</strong>.',
          'Touchez <strong>Supprimer le compte</strong> et confirmez.',
        ],
      },
      {
        h: 'Ce qui est supprimé',
        ul: [
          'Votre compte, prénom, e-mail, date de naissance et photo de profil.',
          'L’espace partagé de votre couple — souvenirs et photos, mots doux, moments, dates, projets, jeux, dessins et votre animal. Il disparaît aussi pour votre partenaire.',
          'Les jetons de notifications push et les réponses d’IA en cache.',
        ],
        p2: [
          'La suppression est immédiate. Les copies de sauvegarde sont écrasées dans un délai limité.',
        ],
      },
      {
        h: 'Ce qui n’est pas supprimé automatiquement',
        ul: [
          '<strong>Abonnements.</strong> Résiliez Plus dans les réglages de votre compte App Store ou Google Play : supprimer le compte n’arrête pas les paiements.',
          'Les justificatifs d’achat conservés par Apple, Google et RevenueCat selon leurs propres politiques et obligations légales.',
        ],
      },
      {
        h: 'Pas d’accès à l’app ?',
        p: [
          'Écrivez à <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> depuis l’adresse utilisée dans Dotyk avec l’objet « Supprimer mon compte Dotyk ». Nous supprimerons le compte sous 30 jours et vous le confirmerons par e-mail.',
        ],
      },
    ],
  },
  support: {
    title: 'Assistance',
    intro:
      'Une question, une idée ou un souci ? Écrivez à <a href="mailto:{email}">{email}</a> ; nous répondons généralement en quelques jours.',
    sections: [
      {
        h: 'Comment nous associer en couple ?',
        p: [
          'L’un de vous crée le couple et partage le code d’invitation ; l’autre le saisit sur l’écran « Code de ton ou ta partenaire ».',
        ],
      },
      {
        h: 'Comment résilier Plus ?',
        p: [
          'Dans les réglages de votre compte App Store ou Google Play, rubrique Abonnements. Plus reste actif jusqu’à la fin de la période payée.',
        ],
      },
      {
        h: 'J’ai acheté Plus mais il n’apparaît pas',
        p: [
          'Ouvrez l’onglet Profil et touchez « Restaurer les achats ». Vérifiez que vous êtes connecté au même compte App Store ou Google Play.',
        ],
      },
      {
        h: 'Comment supprimer mon compte ?',
        p: ['Voir <a href="delete-account.html">Supprimer le compte</a>.'],
      },
    ],
  },
};
