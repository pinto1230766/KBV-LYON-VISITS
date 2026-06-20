// Message templates organized by category and recipient.
// Extracted from PlanningHub for maintainability — pure data, no logic.

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
      desc: "Premier contact chaleureux pour la visite sur place",
      body: `{salutation_orateur},\n\nJ'espère que tu vas bien. C'est {ton_nom} du Groupe Kabuverdianu de Lyon. \u{1F64F}\n\nC'est un grand plaisir de t'inviter pour un discours chez nous le {jour_semaine} {date_visite} à {heure_visite}.\n\nPeux-tu me confirmer si c'est bon pour toi ?\nDis-nous aussi si :\n\u{2022} 🏠 Tu as besoin d'un hébergement ?\n\u{2022} 🍽️ Tu as des allergies alimentaires (toi ou ceux qui t'accompagnent) ?\n\u{2022} 🚗 Comment tu penses venir (voiture, train...) ?\n{question_enfants_block}{question_accompagnants_block}\nMerci d'avance pour ton retour !\n\nFraternellement,\n{ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador (Prezensial)",
      desc: "Primer kontaktu fraternal pa konfirma vizita",
      body: `{salutation_orateur},\n\nKli é {ton_nom}, inkaregadu di akolhimentu na Grupu Kabuverdianu di Lyon. 🙏\n\nN ten un grandi prazer di konvida-u pa un diskursu na {jour_semaine} {date_visite}, na {heure_visite}.\n\nFavor, konfirma-m si sta tudu dretu:\n• ✅ Bu pode ben na es data i óra?\n• 🏠 Bu meste di alojamentu (lugar pa fika)?\n• 🍽️ Algum alerjia di kumida (bo + akonpanhantis)?\n• 🚗 Modi ki bu ta bem (karu, konboiu, avion)?\n{question_enfants_block}{question_accompagnants_block}\nObrigadu di korason, responde-m asina ki bu pode.\n\nFraternalmenti,\n{ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador (Presencial)",
      desc: "Primeiro contacto fraternal para confirmar a visita",
      body: `{salutation_orateur},\n\nSou {ton_nom}, responsável pelo acolhimento no Grupo Cabo-verdiano de Lyon. 🙏\n\nÉ um grande prazer convidar-te para um discurso no {jour_semaine} {date_visite}, às {heure_visite}.\n\nPor favor, confirma-me os seguintes pontos:\n• ✅ Podes vir nesta data e hora?\n• 🏠 Precisas de alojamento?\n• 🍽️ Tens alguma alergia alimentar (tu + acompanhantes)?\n• 🚗 Como pretendes vir (carro, comboio, avião)?\n{question_enfants_block}{question_accompagnants_block}\nObrigado pela tua resposta assim que for possível.\n\nFraternalmente,\n{ton_nom}\n{mon_tel}`,
    },
  },

  // ─── ORATEURS – ONLINE ───
  confirmation_speaker_online: {
    category: "speaker",
    fr: {
      title: "Confirmation – Orateur (Zoom/Streaming)",
      desc: "Premier contact chaleureux pour la visite en ligne",
      body: `{salutation_orateur},\n\nJ'espère que tu vas bien. C'est un grand plaisir de t'inviter pour un discours par {visit_channel_label} le {jour_semaine} {date_visite} à {heure_visite}.\n\nPeux-tu nous confirmer ta disponibilité pour cette date ?\nLes liens de connexion te seront envoyés quelques jours avant.\n\nFraternellement,\n{ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador (Zoom/Streaming)",
      desc: "Primer kontaktu fraternal pa vizita online",
      body: `{salutation_orateur},\n\nN ta spera ki bu sta dretu. N ten un grandi prazer di konvida-u pa un diskursu pa {visit_channel_label} na {jour_semaine} {date_visite}, na {heure_visite}.\n\nBu pode konfirma-nu si bu sta disponivel na es data?\nNu ta manda-u link di konexon uns dia antis.\n\nFraternalmenti,\n{ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador (Zoom/Streaming)",
      desc: "Primeiro contacto fraternal para visita online",
      body: `{salutation_orateur},\n\nEspero que estejas bem. É um grande prazer convidar-te para um discurso via {visit_channel_label} no {jour_semaine} {date_visite}, às {heure_visite}.\n\nPodes confirmar a tua disponibilidade para esta data?\nOs links de ligação serão enviados alguns dias antes.\n\nFraternalmente,\n{ton_nom}\n{mon_tel}`,
    },
  },

  // ─── ORATEURS – LOCAL (KBV Lyon) ───
  confirmation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Confirmation – Orateur local",
      desc: "Membre KBV Lyon, pas de logistique",
      body: `Salut cher frère {prenom_orateur},\n\nC'est confirmé pour ton discours le {jour_semaine} {date_visite} à {heure_visite}.\n\nMerci de me confirmer :\n\u{2022} \u{2705} Tout est bon pour cette date ?\n\u{2022} \u{1F4D6} Le thème : {theme_discours} (n°{numero_discours})\n\nFraternellement,\n{ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Konfirmason – Orador lokal",
      desc: "Ménbru KBV Lyon, sen lojístika",
      body: `Olá keridu irmon {prenom_orateur},\n\nKonfirmadu pa bu diskursu na {jour_semaine} {date_visite} na {heure_visite}.\n\nFavor konfirma-m:\n• ✅ Tudu sta dretu pa es data?\n• 📖 Tema: {theme_discours} (nº{numero_discours})\n\nFraternalmenti,\n{ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Confirmação – Orador local",
      desc: "Membro KBV Lyon, sem logística",
      body: `Olá querido irmão {prenom_orateur},\n\nConfirmado para o teu discurso em {jour_semaine} {date_visite} às {heure_visite}.\n\nPor favor confirma:\n• ✅ Está tudo bem para esta data?\n• 📖 Tema: {theme_discours} (nº{numero_discours})\n\nFraternalmente,\n{ton_nom}\n{mon_tel}`,
    },
  },

  preparation_speaker: {
    category: "speaker",
    fr: {
      title: "Préparation – Orateur (Présentiel)",
      desc: "Détails complets de l'organisation",
      body: `{salutation_orateur},\n\nMerci beaucoup pour ta confirmation ! Voici les détails de ta visite et de ton séjour parmi nous :\n\n📅 Dates et heures\n• Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n• Réunion : {jour_visite} {date_visite} à {heure_visite}\n• Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\n{speaker_hebergement_block}{speaker_repas_block}{speaker_visite_lyon_block}{speaker_transport_block}Si tu as la moindre question ou besoin d'ajuster quoi que ce soit, n'hésite surtout pas à m'écrire ou m'appeler au {mon_tel}.\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Preparason – Orador (Prezensial)",
      desc: "Detalhis kompletu di organizason",
      body: `{salutation_orateur},\n\nObrigadu pa bu konfirmason! Li sta planu di bu stadia ku nos:\n\n📅 Datas i óras\n• Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n• Runion: {jour_visite} {date_visite} na {heure_visite}\n• Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\n{speaker_hebergement_block}{speaker_repas_block}{speaker_visite_lyon_block}{speaker_transport_block}Si bu ten kualker pergunta, N sta disponivel na {mon_tel}.\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Preparação – Orador (Presencial)",
      desc: "Detalhes completos de organização",
      body: `{salutation_orateur},\n\nMuito obrigado pela tua confirmação! Aqui está o plano da tua estadia connosco :\n\n📅 Datas e horas\n• Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n• Reunião: {jour_visite} {date_visite} às {heure_visite}\n• Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\n{speaker_hebergement_block}{speaker_repas_block}{speaker_visite_lyon_block}{speaker_transport_block}Se tiveres alguma dúvida, fico disponível em {mon_tel}.\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  preparation_speaker_online: {
    category: "speaker",
    fr: {
      title: "Préparation – Orateur (Zoom/Streaming)",
      desc: "Détails pour la visite en ligne",
      body: `{salutation_orateur},\n\nMerci beaucoup pour ta confirmation ! Voici les détails pour ton discours par visioconférence :\n\n📅 Date et heure\n• {jour_visite} {date_visite} à {heure_visite}\n\n💻 Connexion\n• Plateforme : {visit_channel_label}\n• Lien de connexion : (À insérer ici)\n• ID : (À insérer ici)\n• Code : (À insérer ici)\n\nMerci de te connecter environ 15 minutes à l'avance pour qu'on puisse tester le son et la vidéo.\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Preparason – Orador (Zoom/Streaming)",
      desc: "Detalhis pa vizita online",
      body: `{salutation_orateur},\n\nObrigadu pa bu konfirmason! Li sta detalhis pa bu diskursu online:\n\n📅 Data i óra\n• {jour_visite} {date_visite} na {heure_visite}\n\n💻 Konexon\n• Plataforma: {visit_channel_label}\n• Link di konexon: (Pô li)\n• ID: (Pô li)\n• Kódigu: (Pô li)\n\nFavor, liga uns 15 minutu antis pa nu testa son ku vídiu.\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Preparação – Orador (Zoom/Streaming)",
      desc: "Detalhes para a visita online",
      body: `{salutation_orateur},\n\nObrigado pela tua confirmação! Aqui estão os detalhes para o teu discurso online:\n\n📅 Data e hora\n• {jour_visite} {date_visite} às {heure_visite}\n\n💻 Ligação\n• Plataforma: {visit_channel_label}\n• Link de ligação: (Inserir aqui)\n• ID: (Inserir aqui)\n• Código: (Inserir aqui)\n\nPor favor, liga-te cerca de 15 minutos antes para testarmos o som e vídeo.\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  preparation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Rappel – Orateur local",
      desc: "Court rappel quelques jours avant",
      body: `Salut cher frère {prenom_orateur},\n\nPetit rappel pour ton discours :\n\u{1F4C5} {jour_visite} {date_visite} à {heure_visite}\n\u{1F4D6} Thème : {theme_discours} (n°{numero_discours})\n\nÀ très bientôt ! \u{1F64F}\n{ton_nom}`,
    },
    cv: {
      title: "Lembransa – Orador lokal",
      desc: "Lembransa kurtu uns dia antis",
      body: `Olá keridu irmon {prenom_orateur},\n\nLembransa pa bu diskursu:\n📅 {jour_visite} {date_visite} na {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nTé lógu! 🙏\n{ton_nom}`,
    },
    pt: {
      title: "Lembrete – Orador local",
      desc: "Lembrete curto alguns dias antes",
      body: `Olá querido irmão {prenom_orateur},\n\nUm lembrete para o teu discurso:\n📅 {jour_visite} {date_visite} às {heure_visite}\n📖 Tema: {theme_discours} (nº{numero_discours})\n\nAté breve! 🙏\n{ton_nom}`,
    },
  },

  thanks_speaker: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur",
      desc: "Message après la visite",
      body: `{salutation_orateur},\n\nUn grand merci du fond du cœur pour ta visite (et d'être venus jusqu'à nous) ! Ton discours nous a tous fortifiés. 🙏✨\nCe fut un véritable plaisir de vous accueillir parmi nous au sein du Groupe Kabuverdianu de Lyon.\n\nNous espérons avoir la joie de vous revoir bientôt. Que Jéhovah continue de te donner des forces pour le servir.\n\nSi tu as engagé des frais de déplacement, n'hésite pas à remplir et nous renvoyer le formulaire 3007-f.\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador",
      desc: "Mensajen pós-vizita",
      body: `{salutation_orateur},\n\nNha sinseru obrigadu pa bu presensa i pa diskursu ki fortifika-nu tudu! 🙏✨\nFoi un grandi prazer resebe-dos na nos Grupu Kabuverdianu di Lyon.\n\nNu ta spera torna odja-dos na un otru oportunidadi. Ki Jeová kontínua ta da-u forsa pa sirbi-L.\n\nSi bu tevi dispeza ku transporti, favor preenxe i manda-nu formuláriu 3007-f.\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador",
      desc: "Mensagem pós-visita",
      body: `{salutation_orateur},\n\nO nosso sincero obrigado pela tua presença e pelo discurso que nos fortaleceu a todos! 🙏✨\nFoi um grande prazer receber-vos no Grupo Cabo-verdiano de Lyon.\n\nEsperamos ver-vos em breve. Que Jeová continue a dar-te forças para O servir.\n\nSe tiveste despesas de deslocação, por favor preenche e envia-nos o formulário 3007-f.\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  thanks_speaker_online: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur (Zoom/Streaming)",
      desc: "Message après visite en ligne",
      body: `{salutation_orateur},\n\nMerci du fond du cœur pour le discours que tu as partagé avec nous via {visit_channel_label} ! 🙏💻\nMême à distance, ton message a donné de la force à toute la congrégation.\n\nNous espérons avoir l'opportunité de te/vous voir en personne bientôt. Que Jéhovah continue de bénir ton ministère.\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador (Zoom/Streaming)",
      desc: "Mensajen pós-vizita online",
      body: `{salutation_orateur},\n\nObrigadu di korason pa diskursu partilhadu via {visit_channel_label}! 🙏💻\nMésmu na distansia, bu mensajen da forsa pa kongregason interu.\n\nNu ta spera odja-dos pesoalmenti un dia. Ki Jeová kontínua abensoa bu ministériu.\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador (Zoom/Streaming)",
      desc: "Mensagem pós-visita online",
      body: `{salutation_orateur},\n\nObrigado de coração pelo discurso partilhado via {visit_channel_label}! 🙏💻\nMesmo à distância, a tua mensagem deu força a toda a congregação.\n\nEsperamos ter a oportunidade de vos ver pessoalmente. Que Jeová continue a abençoar o teu ministério.\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  thanks_speaker_local: {
    category: "speaker",
    fr: {
      title: "Remerciements – Orateur local",
      desc: "Message court après le discours",
      body: `Bonjour {prenom_orateur},\n\nMerci pour ton discours, c'était une vraie bénédiction ! 🙏✨\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Agradesimentu – Orador lokal",
      desc: "Mensajen kurtu pós-diskursu",
      body: `Bon dia {prenom_orateur},\n\nObrigadu pa bu diskursu, foi un verdaderu benson! 🙏✨\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Agradecimento – Orador local",
      desc: "Mensagem curta pós-discurso",
      body: `Bom dia {prenom_orateur},\n\nObrigado pelo teu discurso, foi uma verdadeira bênção! 🙏✨\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  // ─── ANNULATION ───
  cancellation_speaker_local: {
    category: "speaker",
    fr: {
      title: "Annulation – Orateur local",
      desc: "Message court pour un membre KBV Lyon",
      body: `Bonjour {prenom_orateur},\n\nPetit message pour t'informer que ton discours du {jour_visite} {date_visite} doit être annulé / reporté. 🙏\n\nOn se recale dès que possible.\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Anulason – Orador lokal",
      desc: "Mensajen kurtu pa ménbru KBV Lyon",
      body: `Bon dia {prenom_orateur},\n\nSô pa informa-u ma bu diskursu di {jour_visite} {date_visite} ten ki ser anuladu / adiadu. 🙏\n\nNu ta volta marka lógu ki da.\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Cancelamento – Orador local",
      desc: "Mensagem curta para membro KBV Lyon",
      body: `Bom dia {prenom_orateur},\n\nSó para te avisar que o teu discurso de {jour_visite} {date_visite} terá de ser cancelado / adiado. 🙏\n\nVoltamos a marcar assim que possível.\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  cancellation_speaker: {
    category: "speaker",
    fr: {
      title: "Annulation / Report – Orateur",
      desc: "Informer l'orateur d'une annulation",
      body: `Bonjour {prenom_orateur} {nom_orateur},\n\nJe vous écris pour vous informer que la visite prévue le {jour_visite} {date_visite} doit être annulée / reportée.\n\nNous reviendrons vers vous très vite pour vous proposer une nouvelle date.\nMerci pour votre compréhension. 🙏\n\nFraternellement,\n{ton_nom}\n{mon_tel}`,
    },
    cv: {
      title: "Anulason / Adiamentu – Orador",
      desc: "Informa orador di un anulason",
      body: `Bon dia {prenom_orateur} {nom_orateur},\n\nN sta skrebe-u pa informa ma vizita previstu pa {jour_visite} {date_visite} ten ki ser anuladu / adiadu.\n\nNu ta volta kontata-u faxi pa propo un nova data.\nObrigadu pa bu konprenson. 🙏\n\nFraternalmenti,\n{ton_nom}\n{mon_tel}`,
    },
    pt: {
      title: "Cancelamento / Adiamento – Orador",
      desc: "Informar orador de um cancelamento",
      body: `Bom dia {prenom_orateur} {nom_orateur},\n\nEscrevo para informar que a visita prevista para {jour_visite} {date_visite} terá de ser cancelada / adiada.\n\nVoltaremos a contactá-lo em breve para propor uma nova data.\nObrigado pela sua compreensão. 🙏\n\nFraternalmente,\n{ton_nom}\n{mon_tel}`,
    },
  },

  cancellation_group: {
    category: "groupe",
    fr: {
      title: "Annulation – Groupe",
      desc: "Informer le groupe d'une annulation",
      body: `Bonjour à tous,\n\nLa visite de {prenom_orateur} {nom_orateur} prévue le {jour_visite} {date_visite} est annulée / reportée.\n\nMerci à ceux qui s'étaient déjà proposés pour aider — on revient vers vous dès qu'une nouvelle date est fixée. 🙏`,
    },
    cv: {
      title: "Anulason – Grupu",
      desc: "Informa grupu di un anulason",
      body: `Bon dia a tudu,\n\nVizita di {prenom_orateur} {nom_orateur} previstu pa {jour_visite} {date_visite} sta anuladu / adiadu.\n\nObrigadu pa kes ki dja propostu pa djuda — nu ta volta lógu ki ten un nova data. 🙏`,
    },
    pt: {
      title: "Cancelamento – Grupo",
      desc: "Informar o grupo de um cancelamento",
      body: `Bom dia a todos,\n\nA visita de {prenom_orateur} {nom_orateur} prevista para {jour_visite} {date_visite} foi cancelada / adiada.\n\nObrigado a quem já se tinha proposto para ajudar — voltaremos assim que houver nova data. 🙏`,
    },
  },

  // ─── LOGISTIQUE ───
  logistique_host: {
    category: "logistique",
    fr: {
      title: "Briefing – Hôte(s)",
      desc: "Message complet pour l'hôte assigné (hébergement, repas, transport)",
      body: `{salutation_hebergeur},\n\nVoici les informations logistiques pour la visite de {orateur_et_epouse_titre} :\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n{repas_label}\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Merci beaucoup pour ton aide précieuse ! Fraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Briefing – Resebedor",
      desc: "Mensajen kompletu pa resebedor atribuidu",
      body: `{salutation_hebergeur},\n\nLi sta informason di lojístika pa vizita di {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Vizitanti\n{composition_visite_block}\n{repas_label}\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Obrigadu pa bu djuda! Fraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Briefing – Anfitriões",
      desc: "Mensagem completa para o anfitrião atribuído",
      body: `{salutation_hebergeur},\n\nAqui estão as informações logísticas para a visita de {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n{repas_label}\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Obrigado pela tua ajuda! Fraternalmente,\n{ton_nom}`,
    },
  },

  reminder_hosts: {
    category: "logistique",
    fr: {
      title: "Relance – Hôtes (J-3)",
      desc: "Petit rappel quelques jours avant la visite",
      body: `{salutation_hebergeur},\n\nPetit rappel amical : la visite de {orateur_et_epouse_titre} approche !\n📅 {jour_visite} {date_visite} à {heure_visite}\n\nPeux-tu simplement me confirmer que tout est ok de ton côté (hébergement / repas / visite de Lyon / transport) ? 🙏\n\nFraternellement,\n{ton_nom}`,
    },
    cv: {
      title: "Lembransa – Resebedor (J-3)",
      desc: "Lembransa uns dia antis di vizita",
      body: `{salutation_hebergeur},\n\nLembransa: vizita di {orateur_et_epouse_titre} ta txiga!\n📅 {jour_visite} {date_visite} na {heure_visite}\n\nFavor konfirma-m si tudu sta dretu di bu ladu (alojamentu / kumida / vizita di Lyon / transporti). 🙏\n\nFraternalmenti,\n{ton_nom}`,
    },
    pt: {
      title: "Lembrete – Anfitriões (J-3)",
      desc: "Pequeno lembrete alguns dias antes",
      body: `{salutation_hebergeur},\n\nLembrete amigável: a visita de {orateur_et_epouse_titre} está a chegar!\n📅 {jour_visite} {date_visite} às {heure_visite}\n\nPor favor, confirma-me se está tudo bem do teu lado (alojamento / refeições / visita de Lyon / transporte). 🙏\n\nFraternalmente,\n{ton_nom}`,
    },
  },

  // ─── GROUPES ───
  volunteers_group: {
    category: "groupe",
    fr: {
      title: "Recherche de volontaires",
      desc: "Message pour le groupe des hôtes",
      body: `Bonjour à tous ! 👋\n\nJe recherche des VOLONTAIRES pour recevoir notre prochain orateur :\n\n🎤 Orateur : {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n\n📅 Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n📅 Réunion : {jour_visite} {date_visite} à {heure_visite}\n📅 Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\nNous avons besoin de :\n{besoins_volontaires_block}{details_allergies_block}
Si vous pouvez aider, merci de me répondre dès que possible.\n\nMerci de tout cœur,\n{ton_nom}`,
    },
    cv: {
      title: "Buska voluntárius",
      desc: "Mensajen pa grupu di resebedors",
      body: `Bon dia a tudu! 👋\n\nN sta buska VOLUNTÁRIU pa resebe nos prósimu orador:\n\n🎤 Orador: {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Vizitanti\n{composition_visite_block}\n\n📅 Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n📅 Runion: {jour_visite} {date_visite} na {heure_visite}\n📅 Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\nNu meste di:\n{besoins_volontaires_block}{details_allergies_block}
Si bu pode djuda, favor responde-m más faxi posível.\n\nObrigadu di korason,\n{ton_nom}`,
    },
    pt: {
      title: "Procura de voluntários",
      desc: "Mensagem para o grupo de anfitriões",
      body: `Bom dia a todos ! 👋\n\nProcuro VOLUNTÁRIOS para receber o nosso próximo orador:\n\n🎤 Orador: {orateur_et_epouse_titre} ({congregation_orateur})\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n\n📅 Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n📅 Reunião: {jour_visite} {date_visite} às {heure_visite}\n📅 Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\nPrecisamos de:\n{besoins_volontaires_block}{details_allergies_block}
Se puderem ajudar, respondam o mais cedo possível.\n\nObrigado de coração,\n{ton_nom}`,
    },
  },

  preparation_group: {
    category: "groupe",
    fr: {
      title: "Préparation – Groupe des Hôtes",
      desc: "Brief complet pour tous les volontaires",
      body: `Bonjour la famille ! 👋\n\nVoici l'organisation pour la visite de {orateur_et_epouse_titre} :\n\n👨‍👩‍👧‍👦 Visiteurs\n{composition_visite_block}\n📅 Dates/Heures\n• Arrivée : {jour_arrivee} {date_arrivee} (vers {heure_arrivee})\n• Réunion : {jour_visite} {date_visite} à {heure_visite}\n• Départ : {jour_depart} {date_depart} (vers {heure_depart})\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Merci à chaque volontaire pour votre aide précieuse ! 🙏✨`,
    },
    cv: {
      title: "Preparason – Grupu di Resebedor",
      desc: "Brefing kompletu pa tudu voluntáriu",
      body: `Bon dia família! 👋\n\nPlanifikason pa vizita di {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Vizitanti\n{composition_visite_block}\n📅 Datas/Óras\n• Txegada: {jour_arrivee} {date_arrivee} (volta di {heure_arrivee})\n• Runion: {jour_visite} {date_visite} na {heure_visite}\n• Partida: {jour_depart} {date_depart} (volta di {heure_depart})\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Obrigadu na kada voluntáriu pa ses dispuzison! 🙏✨`,
    },
    pt: {
      title: "Preparação – Grupo de Anfitriões",
      desc: "Brief completo para todos os voluntários",
      body: `Bom dia família! 👋\n\nAqui está a organização para a visita de {orateur_et_epouse_titre}:\n\n👨‍👩‍👧‍👦 Visitantes\n{composition_visite_block}\n📅 Dates/Horas\n• Chegada: {jour_arrivee} {date_arrivee} (por volta de {heure_arrivee})\n• Reunião: {jour_visite} {date_visite} às {heure_visite}\n• Partida: {jour_depart} {date_depart} (por volta de {heure_depart})\n\n{hebergement_planning_block}{repas_planning_block}{visite_lyon_planning_block}{transport_planning_block}{transport_type_block}{details_allergies_block}Obrigado a cada voluntário pela ajuda preciosa! 🙏✨`,
    },
  },
};
