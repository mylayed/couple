export default {
  langName: 'Português',
  ui: {
    updated: 'Última atualização: {updated}',
    nav: { privacy: 'Privacidade', terms: 'Termos', delete: 'Excluir conta', support: 'Suporte' },
    indexTitle: 'Dotyk — informações legais e suporte',
    indexIntro:
      'Dotyk é um app para casais: memórias compartilhadas, bilhetes, datas, jogos e um bichinho que vocês cuidam juntos.',
  },
  privacy: {
    title: 'Política de Privacidade',
    intro:
      'Esta política explica quais dados o Dotyk coleta, por quê, quem os trata e como você pode controlá-los. Criamos o Dotyk para que a vida privada de um casal continue privada: sem anúncios, sem rastreamento e sem venda de dados.',
    sections: [
      {
        h: 'Quem somos',
        p: [
          'O Dotyk é desenvolvido e operado por {owner}, pessoa física sediada na Ucrânia («nós»). Somos o controlador dos seus dados pessoais. Contato: <a href="mailto:{email}">{email}</a>.',
        ],
      },
      {
        h: 'O que coletamos',
        p: ['<strong>Dados da conta.</strong>'],
        ul: [
          'E-mail e senha (a senha é guardada apenas como hash seguro no nosso provedor de autenticação) ou, se você entrar com o Google, o e-mail, o nome e o identificador da sua conta Google.',
          'Seu nome e, se quiser, sua data de nascimento e foto de perfil.',
          'Configurações: idioma do app, se a IA está ativada e preferências de notificação.',
        ],
      },
      {
        p: [
          '<strong>Conteúdo que vocês criam juntos.</strong> Memórias e suas fotos, comentários, bilhetes, momentos «Quando foi a última vez…», humores, respostas à pergunta do dia, respostas de jogos, desafios, lista de desejos e listas compartilhadas, datas importantes, cápsulas do tempo, desenhos, o bichinho compartilhado e os cuidados com ele, e os «toques» (coração, abraço, pensando em você). Esse conteúdo é visível para seu par por definição — é para isso que o app existe.',
          '<strong>Dados de pareamento.</strong> O código de convite que você compartilha e um registro de tentativas de entrada, para impedir que alguém adivinhe o código.',
          '<strong>Dados técnicos e do dispositivo.</strong> Um token de notificações push e a plataforma (iOS ou Android) para entregar notificações. Nosso provedor de hospedagem trata endereços IP e registros de solicitações para operar e proteger o serviço.',
          '<strong>Compras.</strong> Os pagamentos são feitos pela App Store ou Google Play; nunca vemos os dados do seu cartão. Nosso provedor de assinaturas recebe seu identificador no app e os recibos de compra para confirmar seu status Plus. Guardamos o status e a data de expiração do Plus e de qual tela a oferta foi aberta.',
          '<strong>Solicitações de IA.</strong> Somente quando você toca em um botão marcado com ✨, e somente com os dados que a função precisa (veja «Funções de IA»). Contamos as solicitações para aplicar o limite diário.',
        ],
      },
      {
        h: 'O que não coletamos',
        ul: [
          'Nenhum anúncio, identificador de publicidade ou rastreamento em outros apps ou sites.',
          'Nenhum SDK de análise de terceiros.',
          'Nem localização, nem contatos, nem gravações do microfone ou da câmera. Apenas as fotos que você escolhe adicionar.',
          'Nunca vendemos nem alugamos seus dados.',
        ],
      },
      {
        h: 'Para que usamos (bases legais)',
        ul: [
          '<strong>Fornecer o app</strong> — contas, pareamento, sincronização do conteúdo compartilhado, Plus (execução de contrato).',
          '<strong>Funções opcionais</strong> — a IA e as notificações push só funcionam se você ativá-las, e você pode desativá-las a qualquer momento (consentimento).',
          '<strong>Segurança e prevenção de abusos</strong> — limites de uso, proteção dos códigos de convite, correção de erros (legítimo interesse).',
          '<strong>Obrigações legais</strong> — por exemplo, registros fiscais e contábeis mantidos pelas lojas de apps.',
        ],
      },
      {
        h: 'Funções de IA',
        p: [
          'As funções de IA (ideias de encontros, ajuda com bilhetes, a história do seu ano) são opcionais. As solicitações vão para nosso servidor e de lá para o modelo Claude, da Anthropic. Pelos termos da Anthropic, dados enviados pela API não são usados para treinar modelos.',
          'Enviamos apenas o que a função precisa: para ideias de encontros, o orçamento e o clima escolhidos, o mês atual, seus momentos mais frequentes e os desejos ainda não realizados; para bilhetes, o tom, seu rascunho e o nome do seu par; para a história do ano, os números do ano, seus nomes, momentos frequentes, desejos realizados e legendas das memórias. Fotos, respostas à pergunta do dia, humores, bilhetes e comentários do seu par, seu e-mail e sua data de nascimento nunca são enviados.',
          'As respostas prontas ficam em cache no nosso servidor por até 30 dias, para que a mesma solicitação não gaste seu limite. Se seu par desativar a IA, nenhum dado compartilhado do casal é enviado.',
        ],
      },
      {
        h: 'Quem trata seus dados',
        p: ['Usamos poucos provedores, que tratam dados em nosso nome:'],
        ul: [
          '<strong>Supabase</strong> — banco de dados, autenticação, armazenamento de fotos e funções de servidor.',
          '<strong>Anthropic</strong> — funções de IA, só quando você as usa.',
          '<strong>RevenueCat</strong> — gestão de compras no app e assinaturas.',
          '<strong>Apple e Google</strong> — login com Google, pagamentos e entrega de notificações push (APNs, Firebase Cloud Messaging).',
          '<strong>Expo</strong> — serviço de notificações push que encaminha as notificações à Apple e ao Google.',
        ],
        p2: [
          'Alguns provedores tratam dados fora da Ucrânia e do Espaço Econômico Europeu, inclusive nos Estados Unidos. Quando necessário, as transferências são protegidas por cláusulas contratuais padrão ou garantias equivalentes oferecidas por esses provedores.',
        ],
      },
      {
        h: 'Seu par e os dados compartilhados',
        p: [
          'Tudo o que você adiciona ao espaço do casal é visível para seu par, e você vê o conteúdo dele. Seu par também vê seu nome, sua foto de perfil e sua data de nascimento (para lembretes de aniversário).',
          'Se qualquer um dos dois sair do casal ou excluir a conta, o espaço compartilhado — todo o conteúdo e as fotos compartilhadas — é excluído para ambos. Assim ninguém fica com os dados da outra pessoa.',
        ],
      },
      {
        h: 'Por quanto tempo guardamos os dados',
        ul: [
          'Conta e conteúdo — enquanto sua conta existir. O que você exclui some na hora para os dois e é apagado definitivamente, no máximo, quando o casal é excluído.',
          'Respostas de IA em cache — até 30 dias.',
          'Ao excluir sua conta, seu perfil, foto de perfil, tokens push e o espaço compartilhado do casal são excluídos imediatamente. As cópias de backup do nosso provedor de hospedagem são sobrescritas em um período limitado.',
          'Os registros de compra são mantidos pela Apple, Google e RevenueCat conforme suas próprias políticas e obrigações legais.',
        ],
      },
      {
        h: 'Segurança',
        p: [
          'Os dados são criptografados em trânsito. As regras do banco de dados garantem que só você e seu par possam ler os dados do casal. As fotos ficam em armazenamento privado e só podem ser acessadas por links temporários. Sua sessão é guardada criptografada no dispositivo, com a chave no chaveiro do sistema.',
        ],
      },
      {
        h: 'Seus direitos',
        p: [
          'Dependendo de onde você mora (incluindo o GDPR, a LGPD e a lei ucraniana de proteção de dados pessoais), você tem direito de acessar seus dados, corrigi-los, excluí-los, receber uma cópia em formato portátil, limitar ou se opor ao tratamento e retirar o consentimento a qualquer momento.',
          'Você pode editar a maioria dos dados no app e excluir sua conta em Ajustes. Para qualquer outra coisa, escreva para <a href="mailto:{email}">{email}</a> — respondemos em até 30 dias. Você também pode reclamar a uma autoridade de proteção de dados: na Ucrânia, o Comissário do Parlamento para os Direitos Humanos; no Brasil, a ANPD; na UE, a autoridade do seu país.',
        ],
      },
      {
        h: 'Idade',
        p: [
          'O Dotyk é destinado a pessoas com 16 anos ou mais. Não coletamos intencionalmente dados de crianças mais novas. Se você acredita que uma criança criou uma conta, fale com a gente e nós a excluiremos.',
        ],
      },
      {
        h: 'Mudanças nesta política',
        p: [
          'Se mudarmos esta política, atualizaremos a data acima e avisaremos no app sobre mudanças importantes antes que entrem em vigor.',
        ],
      },
      { h: 'Contato', p: ['{owner}, Ucrânia — <a href="mailto:{email}">{email}</a>'] },
    ],
  },
  terms: {
    title: 'Termos de Uso',
    intro:
      'Estes termos se aplicam ao uso do app Dotyk. Ao criar uma conta, você os aceita. Leia-os junto com nossa <a href="privacy.html">Política de Privacidade</a>.',
    sections: [
      {
        h: 'O serviço',
        p: [
          'O Dotyk é oferecido por {owner}, Ucrânia («nós»). O app permite que duas pessoas criem um espaço compartilhado: memórias, bilhetes, datas, planos, jogos e um bichinho virtual.',
        ],
      },
      {
        h: 'Quem pode usar o Dotyk',
        p: [
          'Você precisa ter pelo menos 16 anos e poder aceitar estes termos. Você só pode estar em um casal por vez.',
        ],
      },
      {
        h: 'Sua conta',
        p: [
          'Informe dados verdadeiros e proteja seus dados de acesso. Você é responsável pela atividade da sua conta. Avise-nos se achar que outra pessoa tem acesso a ela.',
        ],
      },
      {
        h: 'Seu conteúdo',
        p: [
          'Você mantém todos os direitos sobre o que adiciona. Você nos dá uma permissão limitada para armazenar, tratar e mostrar seu conteúdo a você e ao seu par, apenas para o app funcionar.',
          'Adicione apenas conteúdo que você tem direito de compartilhar. Não envie fotos de outras pessoas sem o consentimento delas e não use o Dotyk para nada ilegal, abusivo ou prejudicial.',
          'Lembre-se de que seu par vê o que você adiciona ao espaço compartilhado e de que o conteúdo compartilhado é excluído para os dois se qualquer um sair do casal ou excluir a conta.',
        ],
      },
      {
        h: 'Uso aceitável',
        ul: [
          'Não tente acessar contas ou dados de outras pessoas nem interferir no serviço.',
          'Não faça engenharia reversa, não sobrecarregue nem abuse do app, de seus limites ou das funções de IA.',
          'Não use o app para spam ou conteúdo ilegal.',
        ],
      },
      {
        h: 'Dotyk Plus',
        ul: [
          'O Plus é opcional. As funções principais são gratuitas.',
          'O Plus é comprado pela App Store ou Google Play e vale para os dois enquanto vocês estiverem pareados. Preço e período aparecem antes da compra.',
          'As assinaturas renovam automaticamente, a menos que sejam canceladas pelo menos 24 horas antes do fim do período atual. A cobrança é feita na sua conta da loja nas 24 horas anteriores à renovação.',
          'Você pode gerenciar ou cancelar a assinatura nas configurações da sua conta da App Store ou do Google Play. Excluir o app ou a conta Dotyk não cancela a assinatura.',
          'Se houver um teste grátis, a parte não usada termina ao comprar uma assinatura. Reembolsos são tratados pela Apple ou pelo Google conforme suas políticas.',
          'Uma compra única «para sempre» dá acesso ao Plus enquanto o app for oferecido.',
        ],
      },
      {
        h: 'Funções de IA',
        p: [
          'As sugestões da IA são geradas automaticamente e podem ser imprecisas ou inadequadas. Use seu próprio julgamento. As funções de IA são opcionais e têm limites diários no plano gratuito.',
        ],
      },
      {
        h: 'Mudanças e disponibilidade',
        p: [
          'Melhoramos o Dotyk continuamente e podemos mudar ou remover funções. Fazemos o possível para manter o app disponível, mas não podemos garantir que ele funcione sempre sem interrupções. Avisaremos com antecedência sobre mudanças importantes nestes termos.',
        ],
      },
      {
        h: 'Encerramento',
        p: [
          'Você pode parar de usar o Dotyk e excluir sua conta a qualquer momento em Ajustes. Podemos suspender ou encerrar contas que violem estes termos de forma grave ou repetida.',
        ],
      },
      {
        h: 'Responsabilidade',
        p: [
          'O app é fornecido «no estado em que se encontra». Na medida permitida por lei, não respondemos por danos indiretos ou perda de dados. Nada nestes termos limita os direitos que você tem como consumidor pela lei do seu país.',
        ],
      },
      {
        h: 'Apple App Store',
        p: [
          'Se você baixou o Dotyk na App Store, estes termos são entre você e nós, não a Apple. Também se aplica o <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Contrato de Licença de Usuário Final da Apple</a>, e a Apple não tem obrigação de dar suporte ao app.',
        ],
      },
      {
        h: 'Lei aplicável',
        p: [
          'Estes termos são regidos pela lei da Ucrânia. Se você for consumidor, mantém também a proteção das normas obrigatórias do país onde vive.',
        ],
      },
      { h: 'Contato', p: ['<a href="mailto:{email}">{email}</a>'] },
    ],
  },
  delete: {
    title: 'Excluir sua conta do Dotyk',
    intro: 'Você pode excluir sua conta e seus dados a qualquer momento, direto no app.',
    sections: [
      {
        h: 'No app',
        ol: [
          'Abra o Dotyk e vá até a aba <strong>Perfil</strong>.',
          'Role até <strong>Conta</strong>.',
          'Toque em <strong>Excluir conta</strong> e confirme.',
        ],
      },
      {
        h: 'O que é excluído',
        ul: [
          'Sua conta, nome, e-mail, data de nascimento e foto de perfil.',
          'O espaço compartilhado do casal — memórias e fotos, bilhetes, momentos, datas, planos, jogos, desenhos e o bichinho. Ele também some para seu par.',
          'Tokens de notificações push e respostas de IA em cache.',
        ],
        p2: ['A exclusão é imediata. As cópias de backup são sobrescritas em um período limitado.'],
      },
      {
        h: 'O que não é excluído automaticamente',
        ul: [
          '<strong>Assinaturas.</strong> Cancele o Plus nas configurações da sua conta da App Store ou do Google Play — excluir a conta não interrompe os pagamentos.',
          'Registros de compra mantidos pela Apple, Google e RevenueCat conforme suas próprias políticas e obrigações legais.',
        ],
      },
      {
        h: 'Sem acesso ao app?',
        p: [
          'Escreva para <a href="mailto:{email}?subject=Delete%20my%20Dotyk%20account">{email}</a> a partir do endereço que você usa no Dotyk, com o assunto «Excluir minha conta Dotyk». Excluiremos a conta em até 30 dias e confirmaremos por e-mail.',
        ],
      },
    ],
  },
  support: {
    title: 'Suporte',
    intro:
      'Dúvidas, ideias ou algo não funciona? Escreva para <a href="mailto:{email}">{email}</a> — costumamos responder em poucos dias.',
    sections: [
      {
        h: 'Como nos conectamos como casal?',
        p: [
          'Um de vocês cria o casal e compartilha o código de convite; o outro o digita na tela «Código do parceiro».',
        ],
      },
      {
        h: 'Como cancelo o Plus?',
        p: [
          'Nas configurações da sua conta da App Store ou do Google Play, em Assinaturas. O Plus continua ativo até o fim do período pago.',
        ],
      },
      {
        h: 'Comprei o Plus, mas ele não aparece',
        p: [
          'Abra a aba Perfil e toque em «Restaurar compras». Confira se você está conectado à mesma conta da App Store ou do Google Play.',
        ],
      },
      {
        h: 'Como excluo minha conta?',
        p: ['Veja <a href="delete-account.html">Excluir conta</a>.'],
      },
    ],
  },
};
