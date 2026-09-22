// Message templates organized by category and recipient.
// Formulated with vocabulary and conventions used among Jehovah's Witnesses
// conforming to JW.ORG (fr, pt, and kea/ALUPEC Cape Verdean Creole).

export type TemplateCategory = "speaker" | "logistique" | "groupe";

type LangBody = { title: string; desc: string; body: string };
export type TemplateEntry = {
  category: TemplateCategory;
  fr: LangBody;
  cv: LangBody;
  pt: LangBody;
};

export const messageTemplates: Record<string, TemplateEntry> = {
  // ─── ORATEURS – PRÉSENTIEL ───
  confirmation_speaker: {
    category: "speaker",
    fr: {
      title: "Confirmation – Orateur (Présentiel)",
      desc: "Premier contact fraternel pour confirmer la visite sur place",
      body: `{salutation_orateur},\n\nJ'espère que tu te portes bien ainsi que toute ta famille. C'est ton frère {ton_nom}, serviteur pour l'hospitalité au sein de la congrégation {nom_congregation}. 🙏\n\nC'est une grande joie pour notre congrégation de t'inviter à prononcer le discours public chez nous le {jour_semaine} {date_visite} à {heure_visite}.\n\nPeux-tu nous confirmer si cette date te convient ?\nMerci également de nous préciser :\n• 🏠 Si vous aurez besoin d'un logement sur place ?\n• 🍽️ Si vous avez des allergies ou restrictions alimentaires (toi ou ceux qui t'accompagnent) ?\n• 🚗 Comment vous envisagez de venir (voiture, train, avion...) ?\n{question_enfants_block}{question_accompagnants_block}\nMerci d'avance pour ton retour dès que possible.\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador (Prezensial)",
      desc: "Primer kontaktu fraternal pa konfirma vizita",
      body: `{salutation_orateur},\n\nN ta spera ki bu sta dretu bo ku bu família. Li é bu irmon {ton_nom}, enkaregadu di ospitalidadi na kongregason di {nom_congregation}. 🙏\n\nÉ un grandi alegria pa nos kongregason konvida-u pa faze diskursu públiku na {jour_semaine} {date_visite}, na {heure_visite}.\n\nPur favor, konfirma-nu si es data sta dretu pa bo.\nTanbe nu ta pidi-u pa fla-nu:\n• 🏠 Si nhos meste di alojamentu (lugar pa fika)?\n• 🍽️ Si nhos ten algun alerjia di kumida (bo ô ken ki ta ben ku bo)?\n• 🚗 Modi ki nhos ta ben (karu, konboiu, avion)?\n{question_enfants_block}{question_accompagnants_block}\nNu ta agradese-u di korason. Responde-nu asina ki bu podi.\n\nKu amor fraternal,\nBu irmon {ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador (Presencial)",
      desc: "Primeiro contacto fraternal para confirmar a visita",
      body: `{salutation_orateur},\n\nEspero que estejas bem, assim como toda a tua família. Sou o teu irmão {ton_nom}, responsável pela hospitalidade na congregação {nom_congregation}. 🙏\n\nÉ uma grande alegria para a nossa congregação convidar-te para proferir o discurso público no {jour_semaine} {date_visite}, às {heure_visite}.\n\nPoderias confirmar-nos se esta data te convém?\nAgradecemos também que nos indiques:\n• 🏠 Se vão precisar de alojamento no local?\n• 🍽️ Se têm alguma alergia ou restrição alimentar (tu ou os teus acompanhantes)?\n• 🚗 Como planeiam viajar (carro, comboio, avião)?\n{question_enfants_block}{question_accompagnants_block}\nMuito obrigado pela tua resposta assim que possível.\n\nCom amor fraternal,\nO teu irmão {ton_nom}\n{mon_tel}`,
    },
  },

  // ─── ORATEURS – EN LIGNE (Zoom / Streaming) ───
  confirmation_speaker_online: {
    category: "speaker",
    fr: {
      title: "Confirmation – Orateur (Visioconférence)",
      desc: "Premier contact fraternel pour visite en ligne",
      body: `{salutation_orateur},\n\nJ'espère que tu te portes bien ainsi que toute ta famille. C'est une grande joie pour notre congrégation de t'inviter à prononcer le discours public par {visit_channel_label} le {jour_semaine} {date_visite} à {heure_visite}.\n\nPeux-tu nous confirmer ta disponibilité pour cette date ?\nLes coordonnées de connexion te seront transmises quelques jours avant la réunion.\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador (Vizikonferensia)",
      desc: "Primer kontaktu fraternal pa vizita online",
      body: `{salutation_orateur},\n\nN ta spera ki bu sta dretu bo ku bu família. É un grandi alegria pa nos grupu konvida-u pa faze diskursu públiku via {visit_channel_label} na {jour_semaine} {date_visite}, na {heure_visite}.\n\nBu pode konfirma-nu si bu sta disponivel na es data?\nNu ta manda-u kes informason di konexon uns dia antis di runion.\n\nKu amor fraternal,\nBu irmon {ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador (Videoconferência)",
      desc: "Primeiro contacto fraternal para visita online",
      body: `{salutation_orateur},\n\nEspero que tu e a tua família estejam bem. É uma grande alegria para a nossa congregação convidar-te para proferir o discurso público via {visit_channel_label} no {jour_semaine} {date_visite}, às {heure_visite}.\n\nPoderias confirmar-nos a tua disponibilidade para esta data?\nOs dados de ligação ser-te-ão enviados alguns dias antes da reunião.\n\nCom amor fraternal,\nO teu irmão {ton_nom}\n{mon_tel}`,
    },
  },

  // ─── ORATEURS – LOCAL (KBV Lyon) ───
  confirmation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Confirmation – Orateur local",
      desc: "Membre du groupe, sans logistique",
      body: `Cher frère {prenom_orateur},\n\nVoici la confirmation pour ton discours public le {jour_semaine} {date_visite} à {heure_visite}.\n\nMerci de nous confirmer :\n• ✅ Que tout est bien confirmé pour cette date\n• 📖 Le thème : {theme_discours} (n°{numero_discours})\n\nQue Jéhovah bénisse ta préparation.\n\nAvec notre amour fraternel,\nTon frère {ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador lokal",
      desc: "Ménbru di grupu, sen lojístika",
      body: `Keridu irmon {prenom_orateur},\n\nKonfirmason pa bu diskursu públiku na {jour_semaine} {date_visite} na {heure_visite}.\n\nPur favor konfirma-nu:\n• ✅ Si tudu sta dretu pa es data\n• 📖 Tema: {theme_discours} (nº{numero_discours})\n\nKi Jeová abênsua bu preparason.\n\nKu amor fraternal,\nBu irmon {ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador local",
      desc: "Membro do grupo, sem logística",
      body: `Querido irmão {prenom_orateur},\n\nConfirmação para o teu discurso público no {jour_semaine} {date_visite} às {heure_visite}.\n\nPor favor, confirma-nos:\n• ✅ Se está tudo confirmado para esta data\n• 📖 O tema: {theme_discours} (nº{numero_discours})\n\nQue Jeová abençoe a tua preparação.\n\nCom amor fraternal,\nO teu irmão {ton_nom}\n{mon_tel}`,
    },
  },

  preparation_speaker: {
    category: "speaker",
    fr: {
      title: "Préparation – Orateur (Présentiel)",
      desc: "Détails complets de l'organisation et du séjour",
      body: `{salutation_orateur},\n\nMerci beaucoup pour ta confirmation ! Voici les détails de l'organisation pour votre séjour parmi nous :\n\n📅 Dates et horaires\n• Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n• Réunion : {jour_visite} {date_visite} à {heure_visite}\n• Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\n{programme_chronologique_details}\n\nSi vous avez la moindre question ou besoin d'ajuster quoi que ce soit, n'hésite pas à me contacter au {mon_tel}.\nNous avons hâte de vous accueillir parmi nous !\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Preparason – Orador (Prezensial)",
      desc: "Detalis kompletu di organizason",
      body: `{salutation_orateur},\n\nNu ta agradese-u txeu pa bu konfirmason! Li sta planu di organizason pa nhos stadia ku nos:\n\n📅 Datas i óras\n• Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n• Runion: {jour_visite} {date_visite} na {heure_visite}\n• Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\n{programme_chronologique_details}\n\nSi nhos tiver kualker pergunta ô meste di ajusta algun kuza, bu pode txoma-m na {mon_tel}.\nNu sta ansiozu pa resebe-dos ku nos!\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Preparação – Orador (Presencial)",
      desc: "Detalhes completos da organização",
      body: `{salutation_orateur},\n\nMuito obrigado pela tua confirmação! Aqui estão os detalhes da organização para a vossa estadia connosco:\n\n📅 Datas e horas\n• Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n• Reunião: {jour_visite} {date_visite} às {heure_visite}\n• Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\n{programme_chronologique_details}\n\nSe tiverem alguma dúvida ou necessidade de ajuste, não hesites em contactar-me no {mon_tel}.\nEstamos muito felizes por receber-vos!\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  preparation_speaker_online: {
    category: "speaker",
    fr: {
      title: "Préparation – Orateur (Visioconférence)",
      desc: "Détails de connexion pour le discours en ligne",
      body: `{salutation_orateur},\n\nMerci beaucoup pour ta confirmation ! Voici les détails pour ton discours par visioconférence :\n\n📅 Date et heure de la réunion\n• {jour_visite} {date_visite} à {heure_visite}\n\n💻 Connexion\n• Plateforme : {visit_channel_label}\n• Lien de connexion : (À insérer ici)\n• ID de réunion : (À insérer ici)\n• Code secret : (À insérer ici)\n\nMerci de bien vouloir te connecter environ 15 minutes avant le début de la réunion afin de tester le son et la vidéo avec les frères préposés.\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Preparason – Orador (Vizikonferensia)",
      desc: "Detalis di konexon pa vizita online",
      body: `{salutation_orateur},\n\nNu ta agradese-u txeu pa bu konfirmason! Li sta detalis pa bu diskursu via {visit_channel_label}:\n\n📅 Data i óra di runion\n• {jour_visite} {date_visite} na {heure_visite}\n\n💻 Konexon\n• Plataforma: {visit_channel_label}\n• Link di konexon: (Pô li)\n• ID di runion: (Pô li)\n• Kódigu: (Pô li)\n\nPur favor, liga uns 15 minutu antis pa testa son ku vídiu djuntu ku kes irmon responsavel di son.\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Preparação – Orador (Videoconferência)",
      desc: "Detalhes de ligação para o discurso online",
      body: `{salutation_orateur},\n\nMuito obrigado pela tua confirmação! Aqui estão os detalhes para o teu discurso via videoconferência:\n\n📅 Data e hora da reunião\n• {jour_visite} {date_visite} às {heure_visite}\n\n💻 Ligação\n• Plataforma: {visit_channel_label}\n• Link de ligação: (Inserir aqui)\n• ID da reunião: (Inserir aqui)\n• Código: (Inserir aqui)\n\nPor favor, liga-te cerca de 15 minutos antes do início para testarmos o som e vídeo com os irmãos do áudio/vídeo.\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  preparation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Rappel – Orateur local",
      desc: "Rappel fraternel quelques jours avant",
      body: `Cher frère {prenom_orateur},\n\nPetit rappel fraternel pour ton discours public :\n📅 {jour_visite} {date_visite} à {heure_visite}\n📖 Thème : {theme_discours} (n°{numero_discours})\n\nQue Jéhovah bénisse ta préparation. À très bientôt !\n\nAvec notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Lembransa – Orador lokal",
      desc: "Lembransa fraternal uns dia antis",
      body: `Keridu irmon {prenom_orateur},\n\nLembransa fraternal pa bu diskursu públiku:\n📅 {jour_visite} {date_visite} na {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nKi Jeová abênsua bu preparason. Té breve!\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Lembrete – Orador local",
      desc: "Lembrete fraternal alguns dias antes",
      body: `Querido irmão {prenom_orateur},\n\nUm lembrete fraternal para o teu discurso público:\n📅 {jour_visite} {date_visite} às {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nQue Jeová abençoe a tua preparação. Até breve!\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  thanks_speaker: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur",
      desc: "Message de gratitude après la visite",
      body: `{salutation_orateur},\n\nNous tenons à vous remercier de tout cœur pour votre visite et pour ton discours qui a beaucoup fortifié notre congrégation ! 🙏✨\nCe fut une joie immense de vous accueillir au sein de notre congrégation {nom_congregation}.\n\nNous espérons avoir le plaisir de vous revoir bientôt. Que Jéhovah continue de bénir abondamment ton ministère et ton esprit de sacrifice.\n\n(Si tu as engagé des frais de déplacement pour cette visite, n'hésite pas à remplir et nous transmettre le formulaire de remboursement prévu à cet effet).\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador",
      desc: "Mensajen di agradesimentu dipôs di vizita",
      body: `{salutation_orateur},\n\nNu ta agradese-dos di korason pa nhos vizita i pa diskursu ki fortifika nos kongregason interu! 🙏✨\nFoi un grandi alegria resebe-dos na nos kongregason di {nom_congregation}.\n\nNu ta spera torna odja-dos faxi. Ki Jeová kontínua ta abênsua bu ministériu ku bu spíritu di sakrifísiu.\n\n(Si bu tevi dispezas ku transporti, pur favor preenxe i manda-nu formuláriu di ranbolsu di dispezas di vijen).\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador",
      desc: "Mensagem de agradecimento após a visita",
      body: `{salutation_orateur},\n\nAgradecemos de coração pela vossa visita e pelo excelente discurso que tanto edificou a nossa congregação! 🙏✨\nFoi uma enorme alegria receber-vos na nossa congregação {nom_congregation}.\n\nEsperamos ter a oportunidade de vos rever em breve. Que Jeová continue a abençoar ricamente o teu ministério e a vossa abnegação.\n\n(Se tiveste despesas de transporte decorrentes da visita, não hesites em preencher e enviar o formulário de reembolso de despesas de viagem).\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  thanks_speaker_online: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur (Visioconférence)",
      desc: "Message après le discours en ligne",
      body: `{salutation_orateur},\n\nMerci du fond du cœur pour le discours public que tu as présenté via {visit_channel_label} ! 🙏💻\nMême à distance, ton enseignement a grandement fortifié toute notre congrégation.\n\nNous espérons avoir la joie de vous accueillir en personne une prochaine fois. Que Jéhovah continue de bénir ton service à ses côtés.\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador (Vizikonferensia)",
      desc: "Mensajen pós-vizita online",
      body: `{salutation_orateur},\n\nNu ta agradese-u di korason pa diskursu públiku ki bu faze pa nos via {visit_channel_label}! 🙏💻\nMésmu na distánsia, bu mensajen bibliku fortifika nos kongregason interu.\n\nNu ta spera podi resebe-dos pesoalmenti un otru bes. Ki Jeová kontínua ta abênsua bu sirvisu pa El.\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador (Videoconferência)",
      desc: "Mensagem pós-visita online",
      body: `{salutation_orateur},\n\nMuito obrigado de coração pelo discurso público que partilhaste connosco via {visit_channel_label}! 🙏💻\nMesmo à distância, o teu discurso fortaleceu grandemente a nossa congregação.\n\nEsperamos ter a alegria de vos receber pessoalmente numa próxima ocasião. Que Jeová continue a abençoar o teu serviço fiel.\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  thanks_speaker_local: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur local",
      desc: "Message court d'encouragement après le discours",
      body: `Cher frère {prenom_orateur},\n\nMerci beaucoup pour ton discours public aujourd'hui. C'était un enseignement très encourageant et fortifiant pour toute la congrégation ! 🙏✨\n\nQue Jéhovah bénisse ton zèle et tes efforts.\n\nAvec notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador lokal",
      desc: "Mensajen kurtu di agradesimentu dipôs di diskursu",
      body: `Keridu irmon {prenom_orateur},\n\nObrigadu txeu pa bu diskursu públiku oji. Foi un lison animador ki fortifika nos kongregason! 🙏✨\n\nKi Jeová abênsua bu zelu ku bu sforsu.\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador local",
      desc: "Mensagem curta de encorajamento pós-discurso",
      body: `Querido irmão {prenom_orateur},\n\nMuito obrigado pelo teu discurso público hoje. Foi um ensino muito encorajador e edificante para todos nós! 🙏✨\n\nQue Jeová abençoe o teu zelo e os teus esforços.\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  // ─── ANNULATION / REPORT ───
  cancellation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Annulation / Report – Orateur local",
      desc: "Message fraternel d'information",
      body: `Cher frère {prenom_orateur},\n\nJe t'écris pour t'informer que ton discours public du {jour_visite} {date_visite} doit être reporté / annulé. 🙏\n\nNous nous reparlerons dès que possible pour convenir d'une nouvelle date.\n\nAvec notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Anulason / Adiamentu – Orador lokal",
      desc: "Mensajen fraternal pa informa",
      body: `Keridu irmon {prenom_orateur},\n\nN sta skrebe-u pa aviza ma bu diskursu públiku di {jour_visite} {date_visite} ten ki ser adiadu / anuladu. 🙏\n\nNu ta torna fala faxi pa nu marka un otru dia.\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Cancelamento / Adiamento – Orador local",
      desc: "Mensagem fraternal de informação",
      body: `Querido irmão {prenom_orateur},\n\nEscrevo-te para avisar que o teu discurso público de {jour_visite} {date_visite} terá de ser adiado / cancelado. 🙏\n\nFalaremos assim que possível para agendar uma nova data.\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  cancellation_speaker: {
    category: "speaker",
    fr: {
      title: "Annulation / Report – Orateur visiteur",
      desc: "Informer l'orateur d'une annulation ou d'un report",
      body: `Cher frère {prenom_orateur},\n\nJe t'écris pour t'informer que la visite prévue le {jour_visite} {date_visite} doit malheureusement être reportée / annulée.\n\nNous reviendrons vers toi très vite pour convenir d'une nouvelle date avec ta congrégation.\nNous te remercions chaleureusement pour ta compréhension et ton esprit fraternel. 🙏\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Anulason / Adiamentu – Orador vizitanti",
      desc: "Informa orador di adiamentu ô anulason",
      body: `Keridu irmon {prenom_orateur},\n\nN sta skrebe-u pa informa ma vizita ki staba marxiadu pa {jour_visite} {date_visite} ten ki ser adiadu / anuladu.\n\nNu ta volta kontata-u faxi pa nu kombina un novu dia djuntu ku bu kongregason.\nNu ta agradese-u txeu pa bu konprenson ku bu amor fraternal. 🙏\n\nKu amor fraternal,\nBu irmon {ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Cancelamento / Adiamento – Orador visitante",
      desc: "Informar o orador de adiamento ou cancelamento",
      body: `Querido irmão {prenom_orateur},\n\nEscrevo-te para informar que a visita agendada para {jour_visite} {date_visite} terá de ser adiada / cancelada.\n\nVoltaremos a contactar-te em breve para combinar uma nova data em conjunto com a tua congregação.\nAgradecemos muito a tua compreensão e o teu espírito fraternal. 🙏\n\nCom amor fraternal,\nO teu irmão {ton_nom}\n{mon_tel}`,
    },
  },

  cancellation_group: {
    category: "groupe",
    fr: {
      title: "Annulation – Groupe des Hôtes",
      desc: "Informer les volontaires d'une annulation",
      body: `Chers frères et sœurs,\n\nNous vous informons que la visite de frère {prenom_orateur} {nom_orateur} prévue le {jour_visite} {date_visite} est reportée / annulée.\n\nUn grand merci à tous ceux qui s'étaient déjà portés volontaires pour manifester l'hospitalité. Nous reviendrons vers vous dès qu'une nouvelle date sera programmée. 🙏\n\nAvec notre amour fraternel`,
    },
    cv: {
      title: "Anulason – Grupu di Resebedor",
      desc: "Informa kes voluntáriu di anulason",
      body: `Keridus irmons i irmans,\n\nNu sta informa ma vizita di irmon {prenom_orateur} {nom_orateur} ki staba marxiadu pa {jour_visite} {date_visite} fika adiadu / anuladu.\n\nNu ta agradese di korason tudu kes ki dja staba prontu pa mostra ospitalidadi. Asina ki nu tiver un novu data nu ta aviza-nhos. 🙏\n\nKu amor fraternal`,
    },
    pt: {
      title: "Cancelamento – Grupo de Voluntários",
      desc: "Informar os voluntários de um cancelamento",
      body: `Queridos irmãos e irmãs,\n\nInformamos que a visita do irmão {prenom_orateur} {nom_orateur} agendada para {jour_visite} {date_visite} foi adiada / cancelada.\n\nUm sincero obrigado a todos os que se disponibilizaram para acolher e ajudar. Avisaremos assim que tivermos uma nova data confirmada. 🙏\n\nCom amor fraternal`,
    },
  },

  // ─── LOGISTIQUE & HOSPITALITÉ ───
  logistique_host: {
    category: "logistique",
    fr: {
      title: "Briefing – Hôte(s)",
      desc: "Message complet pour le frère / la sœur assigné(e)",
      body: `{salutation_hebergeur},\n\nVoici les informations d'organisation pour l'accueil de {orateur_et_epouse_titre} :\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n{repas_label}\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nMerci beaucoup pour ton bel esprit d'hospitalité chrétienne et ton aide précieuse ! 🙏\n\nAvec notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Briefing – Resebedor",
      desc: "Mensajen kompletu pa irmon ô irmã atribuidu",
      body: `{salutation_hebergeur},\n\nLi sta informasons di lojístika pa ospitalidadi di {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Vizitantis\n{composition_visite_block}\n{repas_label}\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nNu ta agradese-u txeu pa bu bunitu spíritu di ospitalidadi i pa bu djuda presiozu! 🙏\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Briefing – Anfitrião",
      desc: "Mensagem completa para o irmão / irmã designado(a)",
      body: `{salutation_hebergeur},\n\nAqui estão os dados logísticos para o acolhimento de {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n{repas_label}\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nMuito obrigado pelo teu lindo espírito de hospitalidade e pela tua ajuda preciosa! 🙏\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  reminder_hosts: {
    category: "logistique",
    fr: {
      title: "Relance – Hôtes (J-3)",
      desc: "Petit rappel fraternel quelques jours avant la visite",
      body: `{salutation_hebergeur},\n\nPetit rappel fraternel : la visite de {orateur_et_epouse_titre} a lieu très bientôt !\n📅 {jour_visite} {date_visite} à {heure_visite}\n\nPeux-tu simplement me confirmer que tout est prêt et en ordre de ton côté (hébergement / repas / transport) ? 🙏\n\nAvec notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Lembransa – Resebedor (J-3)",
      desc: "Lembransa fraternal uns dia antis di vizita",
      body: `{salutation_hebergeur},\n\nLembransa fraternal: vizita di {orateur_et_epouse_titre} sta txiga!\n📅 {jour_visite} {date_visite} na {heure_visite}\n\nFavor konfirma-m si sta tudu prontu i dretu di bu ladu (alojamentu / kumida / transporti). 🙏\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Lembrete – Anfitrião (J-3)",
      desc: "Lembrete fraternal alguns dias antes da visita",
      body: `{salutation_hebergeur},\n\nLembrete fraternal: a visita de {orateur_et_epouse_titre} está a chegar!\n📅 {jour_visite} {date_visite} às {heure_visite}\n\nPor favor, confirma-me se está tudo a postos e pronto do teu lado (alojamento / refeições / transporte). 🙏\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  // ─── GROUPES DE VOLONTAIRES ───
  volunteers_group: {
    category: "groupe",
    fr: {
      title: "Recherche de volontaires",
      desc: "Message pour le groupe des frères et sœurs",
      body: `Chers frères et sœurs ! 👋\n\nNous recherchons des VOLONTAIRES pour manifester l'hospitalité chrétienne lors de la visite de notre prochain orateur :\n\n🎤 Orateur : {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n📅 Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n📅 Réunion : {jour_visite} {date_visite} à {heure_visite}\n📅 Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\nNous avons besoin de volontaires pour :\n{besoins_volontaires_block}{details_allergies_block}\nSi vous avez la possibilité d'apporter votre aide pour l'un de ces besoins, merci de me contacter dès que possible.\n\n« N'oubliez pas l'hospitalité » (Héb. 13:2).\nMerci pour votre bel esprit fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Buska di voluntárius",
      desc: "Mensajen pa grupu di kes irmon i irmans",
      body: `Keridus irmons i irmans! 👋\n\nNu sta buska VOLUNTÁRIUS pa mostra ospitalidadi na vizita di nos prósimu orador:\n\n🎤 Orador: {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Vizitantis\n{composition_visite_block}\n📅 Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n📅 Runion: {jour_visite} {date_visite} na {heure_visite}\n📅 Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\nNu meste di voluntárius pa:\n{besoins_volontaires_block}{details_allergies_block}\nSi bu pode djuda na algun des kuzas, pur favor responde-m más faxi posivel.\n\n«Ka nhos skese di ospitalidadi» (Ebr. 13:2).\nNu ta agradese nhos amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Procura de voluntários",
      desc: "Mensagem para o grupo de irmãos e irmãs",
      body: `Queridos irmãos e irmãs! 👋\n\nProcuramos VOLUNTÁRIOS para manifestar a hospitalidade cristã na visita do nosso próximo orador:\n\n🎤 Orador: {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n📅 Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n📅 Reunião: {jour_visite} {date_visite} às {heure_visite}\n📅 Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\nPrecisamos de voluntários para:\n{besoins_volontaires_block}{details_allergies_block}\nSe tiverem possibilidade de ajudar nalgum destes aspetos, por favor contactem-me assim que possível.\n\n«Não se esqueçam da hospitalidade» (Heb. 13:2).\nMuito obrigado pelo vosso amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  preparation_group: {
    category: "groupe",
    fr: {
      title: "Préparation – Groupe des Hôtes",
      desc: "Briefing complet pour tous les volontaires",
      body: `Chers frères et sœurs ! 👋\n\nVoici le point d'organisation pour la visite de {orateur_et_epouse_titre} :\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n📅 Dates et horaires\n• Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n• Réunion : {jour_visite} {date_visite} à {heure_visite}\n• Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nUn grand merci à chacun de vous pour votre dévouement et votre bel esprit d'hospitalité ! 🙏✨\n\nAvec tout notre amour fraternel`,
    },
    cv: {
      title: "Preparason – Grupu di Resebedor",
      desc: "Briefing kompletu pa tudu voluntáriu",
      body: `Keridus irmons i irmans! 👋\n\nLi sta planifikason pa vizita di {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Vizitantis\n{composition_visite_block}\n📅 Datas i óras\n• Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n• Runion: {jour_visite} {date_visite} na {heure_visite}\n• Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nNu ta agradese di korason kada un di nhos pa nhos dispuzison i ospitalidadi! 🙏✨\n\nKu amor fraternal`,
    },
    pt: {
      title: "Preparação – Grupo de Voluntários",
      desc: "Briefing completo para todos os voluntários",
      body: `Queridos irmãos e irmãs! 👋\n\nAqui está a organização para a visita de {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n📅 Datas e horas\n• Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n• Reunião: {jour_visite} {date_visite} às {heure_visite}\n• Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\n{programme_chronologique_court}\n\n{transport_type_block}{details_allergies_block}\nUm sincero obrigado a cada um pelo vosso apoio e espírito hospitaleiro! 🙏✨\n\nCom amor fraternal`,
    },
  },

  // ─── RAPPEL J-7 ORATEUR ───
  reminder_speaker_j7: {
    category: "speaker",
    fr: {
      title: "Rappel final – Orateur (J-7)",
      desc: "Dernière vérification logistique une semaine avant",
      body: `{salutation_orateur},\n\nNous nous réjouissons beaucoup de t'accueillir le week-end prochain pour ton discours public !\n📅 Réunion : {jour_visite} {date_visite} à {heure_visite}\n📖 Thème : {theme_discours} (n°{numero_discours})\n\nToute la logistique pour votre accueil est prête et nos frères et sœurs ont hâte de faire votre connaissance.\nN'hésite pas si tu as la moindre question pratique d'ici là au {mon_tel}.\n\nQue Jéhovah bénisse la fin de ta préparation !\n\nAvec tout notre amour fraternel,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Lembransa final – Orador (J-7)",
      desc: "Últimu revizon di lojístika un simana antis",
      body: `{salutation_orateur},\n\nNu sta kontenti dimás pa resebe-u na fin di simana ki sta ben pa bu diskursu públiku!\n📅 Runion: {jour_visite} {date_visite} na {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nTudu lojístika dja sta prontu pa nhos akolhimentu i kes irmons sta ansiozu pa konxe-dos.\nSi bu tiver kualker pergunta ti lá, bu podi txoma-m na {mon_tel}.\n\nKi Jeová abênsua bu preparason!\n\nKu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Lembrete final – Orador (J-7)",
      desc: "Última verificação logística uma semana antes",
      body: `{salutation_orateur},\n\nEstamos muito felizes por receber-vos no próximo fim de semana para o teu discurso público!\n📅 Reunião: {jour_visite} {date_visite} às {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nToda a logística de acolhimento está a postos e os irmãos aguardam com muita expectativa a vossa chegada.\nSe tiveres alguma dúvida prática até lá, não hesites em contactar-me no {mon_tel}.\n\nQue Jeová abençoe a tua preparação final!\n\nCom amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },

  // ─── REMERCIEMENTS AUX HÔTES & VOLONTAIRES ───
  thanks_hosts: {
    category: "logistique",
    fr: {
      title: "Remerciements – Hôtes & Volontaires",
      desc: "Message chaleureux après le départ de l'orateur",
      body: `{salutation_hebergeur},\n\nUn très grand merci du fond du cœur pour ton accueil chaleureux et pour avoir manifesté l'hospitalité chrétienne à l'égard de {orateur_et_epouse_titre} ! 🙏✨\n\nTon aide dévouée et ton amour fraternel ont rendu ce week-end particulièrement fortifiant pour tous.\n\n« Dieu n'est pas injuste pour oublier votre œuvre et l'amour que vous avez montré pour son nom » (Héb. 6:10).\n\nAvec toute notre affection fraternelle,\nTon frère {ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Resebedor & Voluntárius",
      desc: "Mensajen karinhosu dipôs di partida di orador",
      body: `{salutation_hebergeur},\n\nUn grandi obrigadu di korason pa bu akolhimentu karinhosu i pa bu bunitu ospitalidadi kristan ku {orateur_et_epouse_titre}! 🙏✨\n\nBu dispuzison ku bu amor fraternal fazi es fin di simana ser mutu animador pa tudu nos.\n\n«Pamodi Deus é ka injustu pa El skese di nhos trabadju ku amor ki nhos mostra pa se nómi» (Ebr. 6:10).\n\nKu mutu amor fraternal,\nBu irmon {ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Anfitriões & Voluntários",
      desc: "Mensagem calorosa após a partida do orador",
      body: `{salutation_hebergeur},\n\nUm sincero e profundo agradecimento pelo teu acolhimento tão caloroso e por teres manifestado a hospitalidade cristã a {orateur_et_epouse_titre}! 🙏✨\n\nA tua abnegação e o teu amor fraternal tornaram este fim de semana muito edificante para todos nós.\n\n«Porque Deus não é injusto para se esquecer da vossa obra e do amor que mostrastes ao seu nome» (Heb. 6:10).\n\nCom muito amor fraternal,\nO teu irmão {ton_nom}`,
    },
  },
};
