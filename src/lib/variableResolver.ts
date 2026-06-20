import type { Visit, HostAssignment, Speaker, CongregationProfile } from "../store/visitTypes";

type Lang = "fr" | "cv" | "pt";
type Translator = (key: string) => string;

interface ResolveCtx {
  viewVisit: Visit;
  detailForm: Partial<Visit>;
  templateLang: Lang;
  speakers: Speaker[];
  congregation: CongregationProfile;
  formatDateFull: (s?: string, locale?: string) => string;
  formatDayOnly: (s?: string, locale?: string) => string;
  t: Translator;
}

export function resolveVariables(text: string, ctx: ResolveCtx): string {
  const { viewVisit, detailForm, templateLang, speakers, congregation, formatDateFull, formatDayOnly, t } = ctx;

  const mapsLabel = templateLang === "cv"
    ? "Raccourci Google Maps"
    : templateLang === "pt"
      ? "Raccourci Google Maps"
      : "Raccourci Google Maps";

  const hostsByRole = (role: string) =>
    (detailForm.hostAssignments || [])
      .filter((ha) => ha.role === role)
      .slice()
      .sort((a, b) => {
        const da = (a.day || "9999-12-31") + " " + (a.time || "99:99");
        const db = (b.day || "9999-12-31") + " " + (b.time || "99:99");
        return da.localeCompare(db);
      });
  const hebergementHosts = hostsByRole("hebergement");
  const repasHosts = hostsByRole("repas");
  const transportHosts = hostsByRole("transport");

  const targetLocale = templateLang === "pt" ? "pt-PT" : templateLang === "cv" ? "pt-CV" : "fr-FR";

  const L = {
    orateur: templateLang === "cv" ? "Orador" : templateLang === "pt" ? "Orador" : "Orateur",
    epouse: templateLang === "cv" ? "Spóza" : templateLang === "pt" ? "Esposa" : "Épouse",
    enfants: templateLang === "cv" ? "Fidjos" : templateLang === "pt" ? "Crianças" : "Enfants",
    accompagnants: templateLang === "cv" ? "Akonpanhantis" : templateLang === "pt" ? "Acompanhantes" : "Accompagnants",
    allergies: templateLang === "cv" ? "Alerjias" : templateLang === "pt" ? "Alergias" : "Allergies",
    mode_voyage: templateLang === "cv" ? "Modi ki ta bem" : templateLang === "pt" ? "Modo de viagem" : "Mode de voyage",
    hebergement: templateLang === "cv" ? "ALOJAMENTU" : templateLang === "pt" ? "ALOJAMENTO" : "HÉBERGEMENT",
    repas: templateLang === "cv" ? "KUMIDA" : templateLang === "pt" ? "REFEIÇÕES" : "REPAS",
    transport: templateLang === "cv" ? "TRANSPORTI" : templateLang === "pt" ? "TRANSPORTE" : "TRANSPORT",
    aucun: templateLang === "cv" ? "Ninhun" : templateLang === "pt" ? "Nenhuma" : "Aucune",
    non_defini: templateLang === "cv" ? "Ka sta definidu" : templateLang === "pt" ? "Não definido" : "Non défini",
    tel_label: templateLang === "cv" ? "Tél" : templateLang === "pt" ? "Tel" : "Tél",
    avec: templateLang === "cv" ? "ku" : templateLang === "pt" ? "com" : "avec",
  };

  const buildHostSection = (hosts: HostAssignment[], showDetails: boolean = true) => {
    if (hosts.length === 0) return L.non_defini;
    return hosts.map((h) => {
      const day = h.day ? formatDateFull(h.day, targetLocale) : "";
      const time = h.time || "";
      let address = h.hostAddress || "";

      // Auto-fill address for Kingdom Hall if name/origin matches and address is empty
      const isKH = h.origin === "kingdom_hall" || (h.hostName && (
        h.hostName.toLowerCase().includes("salle du royaume") ||
        h.hostName.toLowerCase().includes("salon di reinu") ||
        h.hostName.toLowerCase().includes("salão do reino")
      ));
      if (isKH && !address && congregation.kingdomHallAddress) {
        address = congregation.kingdomHallAddress;
      }

      // Translate the name of Kingdom Hall meal assignments to chosen language
      let hostName = h.hostName || "";
      if (h.origin === "kingdom_hall" || hostName === "Repas Salle du Royaume") {
        if (templateLang === "cv") {
          hostName = "Kumida na Salon di Reinu";
        } else if (templateLang === "pt") {
          hostName = "Refeição no Salão do Reino";
        } else {
          hostName = "Repas Salle du Royaume";
        }
      }

      const phone = h.hostPhone || "";
      const mapsUrl = address ? `maps.google.com/?q=${encodeURI(address).replace(/%20/g, "+")}` : "";
      const at = templateLang === "cv" ? " na " : templateLang === "pt" ? " às " : " à ";
      let section = `${hostName}${day ? " – " + day : ""}${time ? at + time : ""}`;
      if (showDetails) {
        if (phone) section += `\n\u{1F4DE} ${L.tel_label} : ${phone}`;
        if (address) section += `\n\u{1F4CD} ${address}`;
        if (mapsUrl) section += `\n\u{1F5FA} ${mapsLabel} : ${mapsUrl}`;
      }
      return section;
    }).join("\n\n");
  };

  const nameParts = viewVisit.nom.split(" ");
  const prenom = nameParts[0];
  const nom = nameParts.slice(1).join(" ");
  const speaker = speakers.find((s) => s.nom === viewVisit.nom);

  let salutationOrateur = "";
  if (templateLang === "cv") {
    salutationOrateur = `Kridu irmon ${prenom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      const spousePrenom = speaker.spouseName.split(" ")[0] || speaker.spouseName;
      salutationOrateur += ` i irmon-fema ${spousePrenom}`;
    }
  } else if (templateLang === "pt") {
    salutationOrateur = `Querido irmão ${prenom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      const spousePrenom = speaker.spouseName.split(" ")[0] || speaker.spouseName;
      salutationOrateur += ` e irmã ${spousePrenom}`;
    }
  } else {
    // Default to French
    salutationOrateur = `Cher frère ${prenom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      const spousePrenom = speaker.spouseName.split(" ")[0] || speaker.spouseName;
      salutationOrateur += ` et sœur ${spousePrenom}`;
    }
  }

  let orateurEtEpouse = "";
  let orateurEtEpouseTitre = "";
  if (templateLang === "cv") {
    orateurEtEpouse = `irmon ${prenom} ${nom}`;
    orateurEtEpouseTitre = `Irmon ${prenom} ${nom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      orateurEtEpouse += ` i irmon-fema ${speaker.spouseName}`;
      orateurEtEpouseTitre += ` i irmon-fema ${speaker.spouseName}`;
    }
  } else if (templateLang === "pt") {
    orateurEtEpouse = `irmão ${prenom} ${nom}`;
    orateurEtEpouseTitre = `Irmão ${prenom} ${nom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      orateurEtEpouse += ` e irmã ${speaker.spouseName}`;
      orateurEtEpouseTitre += ` e irmã ${speaker.spouseName}`;
    }
  } else {
    orateurEtEpouse = `frère ${prenom} ${nom}`;
    orateurEtEpouseTitre = `Frère ${prenom} ${nom}`;
    if (speaker?.householdType === "couple" && speaker.spouseName) {
      orateurEtEpouse += ` et sœur ${speaker.spouseName}`;
      orateurEtEpouseTitre += ` et sœur ${speaker.spouseName}`;
    }
  }

  const firstHostName = hebergementHosts[0]?.hostName || repasHosts[0]?.hostName || transportHosts[0]?.hostName || "";
  const hostPrenom = firstHostName.split(" ")[0] || "";
  const salutationHebergeur = hostPrenom
    ? (templateLang === "cv" ? `Olá ${hostPrenom}` : templateLang === "pt" ? `Olá ${hostPrenom}` : `Salut ${hostPrenom}`)
    : (templateLang === "cv" ? "Olá" : templateLang === "pt" ? "Olá" : "Salut");
  const childrenCount = speaker?.childrenCount ?? 0;
  const nbAccompagnants = (detailForm.companions || []).length;
  const nomsAccompagnants = (detailForm.companions || []).map((c) => c.nom).join(", ") || L.aucun;
  const totalPeople = 1 + (speaker?.householdType === "couple" ? 1 : 0) + childrenCount + nbAccompagnants;
  const accompagnantsDetails = nbAccompagnants > 0
    ? `👥 ${L.accompagnants} (${nbAccompagnants}) :\n${(detailForm.companions || []).map((c) => {
        const isChild = c.ageGroup === "child";
        const typeLabel = isChild
          ? (templateLang === "cv" ? "fidju" : templateLang === "pt" ? "criança" : "enfant")
          : (templateLang === "cv" ? "adulte" : templateLang === "pt" ? "adulto" : "adulte");
        // Include child age if available
        const ageSuffix = isChild && c.childAge
          ? `, ${c.childAge}`
          : "";
        const line = `  - ${c.nom} (${typeLabel}${ageSuffix}`;
        const extra: string[] = [];
        if (c.dietary) extra.push(`${L.allergies} : ${c.dietary}`);
        if (c.transportType) {
          const transKey = c.transportType === "other" ? "other_transport" : c.transportType;
          let transportLabel = t(transKey);
          if (c.transportDetails) {
            transportLabel += ` (${c.transportDetails})`;
          }
          const transWord = templateLang === "cv" ? "Transporti" : templateLang === "pt" ? "Transporte" : "Transport";
          extra.push(`${transWord} : ${transportLabel}`);
        }
        if (c.notes) {
          const notesWord = templateLang === "cv" ? "Meste" : templateLang === "pt" ? "Necessidades" : "Besoins";
          extra.push(`${notesWord} : ${c.notes}`);
        }
        if (c.accompaniedByFamily && c.familyDetails) {
          const familyWord = templateLang === "cv" ? "Família" : templateLang === "pt" ? "Família" : "Famille";
          extra.push(`${familyWord} : ${c.familyDetails}`);
        }
        return line + (extra.length > 0 ? `, ${extra.join(", ")}` : "") + ")";
      }).join("\n")}\n\n`
    : "";

  const allergiesSpeaker = detailForm.speakerDietary || L.aucun;
  const allergiesSpouse = detailForm.spouseDietary || "";
  const compAllergies = (detailForm.companions || []).map((c) => c.dietary).filter(Boolean);
  let detailsAllergies = allergiesSpouse ? `${allergiesSpeaker} / ${allergiesSpouse}` : allergiesSpeaker;
  if (compAllergies.length > 0) {
    detailsAllergies += ` (Accompagnants : ${compAllergies.join(", ")})`;
  }

  const childrenAges = speaker?.childrenAges || "";
  const enfantsDetails = childrenCount > 0
    ? `${childrenCount} ${L.enfants.toLowerCase()}${childrenAges ? ` (${childrenAges})` : ""}`
    : L.aucun;

  const visitorParts = [`• ${L.orateur} : ${prenom} ${nom}`];
  if (speaker?.householdType === "couple" && speaker.spouseName) {
    visitorParts.push(`• ${L.epouse} : ${speaker.spouseName}`);
  }
  if (childrenCount > 0) {
    visitorParts.push(`• ${L.enfants} : ${enfantsDetails}`);
  }
  if (nbAccompagnants > 0) {
    visitorParts.push(`• ${L.accompagnants} (${nbAccompagnants}) : ${nomsAccompagnants}`);
  }
  const compositionBlock = visitorParts.join("\n") + "\n";

  const channelLabel = detailForm.locationType === "zoom" ? "Zoom" : detailForm.locationType === "streaming" ? "Streaming" : "";
  const firstRepas = repasHosts[0];
  const firstTransport = transportHosts[0];

  const kingdomHallAddress = congregation.kingdomHallAddress
    ? (templateLang === "cv" ? "Salon di Reinu, " : templateLang === "pt" ? "Salão do Reino, " : "Salle du Royaume, ") + congregation.kingdomHallAddress
    : (templateLang === "cv" ? "Salon di Reinu" : templateLang === "pt" ? "Salão do Reino" : "Salle du Royaume");
  const repasTitle = templateLang === "cv"
    ? "Kumida"
    : templateLang === "pt"
      ? "Refeições"
      : "Repas";

  const vars: Record<string, string> = {
    "{salutation_orateur}": salutationOrateur,
    "{salutation_hebergeur}": salutationHebergeur,
    "{prenom_orateur}": prenom,
    "{nom_orateur}": nom,
    "{orateur_et_epouse}": orateurEtEpouse,
    "{orateur_et_epouse_titre}": orateurEtEpouseTitre,
    "{congregation_orateur}": viewVisit.congregation || "",
    "{tel_orateur}": detailForm.speakerPhone || "",
    "{speakerName}": viewVisit.nom || "",
    "{congregation}": viewVisit.congregation || "",
    "{date_visite}": formatDateFull(viewVisit.visitDate, targetLocale),
    "{jour_semaine}": formatDayOnly(viewVisit.visitDate, targetLocale),
    "{heure_visite}": detailForm.heure_visite || congregation.time || "11:30",
    "{theme_discours}": detailForm.talkTheme || "",
    "{numero_discours}": detailForm.talkNoOrType || "",
    "{talkTitle}": detailForm.talkTheme || "",
    "{visitDate}": formatDateFull(viewVisit.visitDate, targetLocale),
    "{visitTime}": detailForm.heure_visite || "",
    "{location}": detailForm.locationType === "kingdom_hall" ? (templateLang === "cv" ? "Salon di Reinu" : templateLang === "pt" ? "Salão do Reino" : "Salle du Royaume") : channelLabel || (templateLang === "cv" ? "Otu" : templateLang === "pt" ? "Outro" : "Autre"),
    "{date_arrivee}": formatDateFull(detailForm.date_arrivee, targetLocale),
    "{jour_arrivee}": formatDayOnly(detailForm.date_arrivee, targetLocale),
    "{heure_arrivee}": detailForm.heure_arrivee || "___",
    "{date_depart}": formatDateFull(detailForm.date_depart, targetLocale),
    "{jour_depart}": formatDayOnly(detailForm.date_depart, targetLocale),
    "{heure_depart}": detailForm.heure_depart || "___",
    "{jour_visite}": formatDayOnly(viewVisit.visitDate, targetLocale),
    "{hebergement_details}": buildHostSection(hebergementHosts, true),
    "{hebergement_planning}": buildHostSection(hebergementHosts, false),
    "{nom_hebergeur}": hebergementHosts[0]?.hostName || "___",
    "{prenom_hotesse}": hebergementHosts[0]?.hostName?.split(" ")[0] || "___",
    "{adresse_hebergeur}": hebergementHosts[0]?.hostAddress || "___",
    "{tel_hebergeur}": hebergementHosts[0]?.hostPhone || "___",
    "{repas_details}": buildHostSection(repasHosts, true),
    "{repas_planning}": buildHostSection(repasHosts, false),
    "{nom_responsable_repas}": firstRepas?.hostName || "___",
    "{prenom_responsable_repas}": firstRepas?.hostName?.split(" ")[0] || "___",
    "{tel_responsable_repas}": firstRepas?.hostPhone || "___",
    "{date_repas}": firstRepas?.day ? formatDateFull(firstRepas.day, targetLocale) : "___",
    "{jour_repas}": firstRepas?.day ? formatDayOnly(firstRepas.day, targetLocale) : "___",
    "{heure_repas}": firstRepas?.time || "___",
    "{adresse_repas}": firstRepas?.hostAddress || "___",
    "{transport_details}": buildHostSection(transportHosts, true),
    "{transport_planning}": buildHostSection(transportHosts, false),
    "{nom_chauffeur}": firstTransport?.hostName || "___",
    "{prenom_chauffeur}": firstTransport?.hostName?.split(" ")[0] || "___",
    "{tel_chauffeur}": firstTransport?.hostPhone || "___",
    "{date_transport}": firstTransport?.day ? formatDateFull(firstTransport.day, targetLocale) : "___",
    "{heure_transport}": firstTransport?.time || "___",
    "{lieu_depart}": "___",
    "{lieu_arrivee}": kingdomHallAddress,
    "{kingdom_hall_address}": kingdomHallAddress,
    "{kingdom_hall_name}": templateLang === "cv" ? "Salon di Reinu" : templateLang === "pt" ? "Salão do Reino" : "Salle du Royaume",
    "{nb_accompagnants}": String(nbAccompagnants),
    "{noms_accompagnants}": nomsAccompagnants,
    "{nb_total_personnes}": String(totalPeople),
    "{nb_total_repas}": String(totalPeople),
    "{repas_label}": templateLang === "cv" ? `\u{1F37D} ${totalPeople} pratu di kumida` : templateLang === "pt" ? `\u{1F37D} ${totalPeople} refeições` : `\u{1F37D} ${totalPeople} repas au total`,
    "{allergies_orateur}": allergiesSpeaker,
    "{allergies_orateur_et_accompagnants}": detailsAllergies,
    "{details_allergies}": detailsAllergies,
    "{accompagnants_details}": accompagnantsDetails,
    "{enfants_details}": enfantsDetails,
    "{nb_enfants}": String(childrenCount),
    "{ages_enfants}": childrenAges,
    "{ton_nom}": congregation.responsableName || "___",
    "{mon_tel}": congregation.responsablePhone || "___",
    "{hospitalityOverseer}": congregation.responsableName || "___",
    "{hospitalityOverseerPhone}": congregation.responsablePhone || "___",
    "{ta_tache}": templateLang === "cv" ? "Enkaregadu di resebe vizitantis" : templateLang === "pt" ? "Responsável pelo acolhimento" : "Responsable accueil",
    "{visit_channel_label}": channelLabel || "___",
    "{type_transport}": detailForm.transportType ? t(detailForm.transportType) : "___",
    "{details_allergies_block}": (detailsAllergies && detailsAllergies !== L.aucun) ? `⚠️ ${L.allergies} : ${detailsAllergies}\n` : "",
    "{transport_type_block}": (detailForm.transportType && detailForm.transportType !== "car") ? `🚗 ${L.mode_voyage} : ${t(detailForm.transportType)}${detailForm.transportDetails ? ` (${detailForm.transportDetails})` : ""}\n` : "",
    "{hebergement_planning_block}": hebergementHosts.length > 0 ? `${L.hebergement}\n${buildHostSection(hebergementHosts, false)}\n\n` : "",
    "{repas_planning_block}": repasHosts.length > 0 ? `${repasTitle}\n${buildHostSection(repasHosts, false)}\n\n` : "",
    "{transport_planning_block}": transportHosts.length > 0 ? `${L.transport}\n${buildHostSection(transportHosts, false)}\n\n` : "",
    "{composition_visite_block}": compositionBlock,
    "{question_enfants_block}": childrenCount === 0 ? (templateLang === "cv" ? "• 🧒 Bu ta bem ku fidjos? Si sim, kantu i ki idad?\n" : templateLang === "pt" ? "• 🧒 Vem acompanhado de crianças? Se sim, quantas e que idades?\n" : "• 🧒 Êtes-vous accompagné(e) d'enfants ? Si oui, combien et quel âge ?\n") : "",
    "{question_accompagnants_block}": nbAccompagnants === 0 ? (templateLang === "cv" ? "• 👥 Bu ta bem ku otus pesoas?\n" : templateLang === "pt" ? "• 👥 Vem acompanhado de outras pessoas?\n" : "• 👥 Serez-vous accompagné d'autres personnes (amis, famille) ?\n") : "",
    "{besoins_volontaires_block}": [
      hebergementHosts.length === 0 ? (templateLang === "cv" ? "• 🏠 Alojamentu (lugar pa fika + kafé di manha)" : templateLang === "pt" ? "• 🏠 Alojamento" : "• 🏠 Hébergement (logement + petit-déjeuner)") : null,
      repasHosts.length === 0 ? (templateLang === "cv" ? "• 🍽️ Kumida (almosu / janta)" : templateLang === "pt" ? "• 🍽️ Refeições" : "• 🍽️ Repas (déjeuner / dîner)") : null,
      (!detailForm.transportType || detailForm.transportType !== "car") && transportHosts.length === 0 ? (templateLang === "cv" ? "• 🚗 Transporti (stason / aeroportu ⇄ Salon di Reinu)" : templateLang === "pt" ? "• 🚗 Transporte" : "• 🚗 Transport (gare / aéroport ⇄ Salle du Royaume)") : null
    ].filter(Boolean).join("\n") + "\n",
    "{speaker_transport_block}": (detailForm.transportType === "car") ? "" : (transportHosts.length > 0 ? `🚗 ${L.transport}\n${buildHostSection(transportHosts, true)}\n\n` : ""),
    "{speaker_hebergement_block}": hebergementHosts.length > 0 ? `🏠 ${L.hebergement.charAt(0) + L.hebergement.slice(1).toLowerCase()}\n${buildHostSection(hebergementHosts, true)}\n\n` : "",
    "{speaker_repas_block}": repasHosts.length > 0 ? `🍽️ ${repasTitle}\n${buildHostSection(repasHosts, true)}\n\n` : "",
  };

  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(key).join(value);
  }
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}
