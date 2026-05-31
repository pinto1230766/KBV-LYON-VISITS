import type { TranslationEntry } from "./types";

export const entries: Record<string, TranslationEntry> = {

  // Navigation
  dashboard: { fr: "Tableau de bord", cv: "Painel", pt: "Painel" },
  planning: { fr: "Planning", cv: "Planifikason", pt: "Planeamento" },
  speakers: { fr: "Orateurs", cv: "Irmons", pt: "Oradores" },
  hosts: { fr: "Hôtes", cv: "Resebedor", pt: "Anfitriões" },
  settings: { fr: "Paramètres", cv: "Konfigurasons", pt: "Configurações" },

  // Status
  all: { fr: "Tous", cv: "Tudu", pt: "Todos" },
  upcoming: { fr: "À venir", cv: "Ki sta pa bem", pt: "Próximas" },
  confirmed: { fr: "Confirmé", cv: "Confirmadu", pt: "Confirmado" },
  scheduled: { fr: "Planifié", cv: "Planifikadu", pt: "Planeado" },
  completed: { fr: "Terminé", cv: "Terminadu", pt: "Concluído" },
  cancelled: { fr: "Annulé", cv: "Kanseladu", pt: "Cancelado" },

  // Actions
  add: { fr: "Ajouter", cv: "Ajunta", pt: "Adicionar" },
  edit: { fr: "Modifier", cv: "Modifika", pt: "Editar" },
  delete: { fr: "Supprimer", cv: "Apaga", pt: "Eliminar" },
  save: { fr: "Enregistrer", cv: "Grava", pt: "Guardar" },
  cancel: { fr: "Annuler", cv: "Kansela", pt: "Cancelar" },
  confirm: { fr: "Confirmer", cv: "Konfirma", pt: "Confirmar" },
  close: { fr: "Fermer", cv: "Fexa", pt: "Fechar" },
  search: { fr: "Rechercher...", cv: "Buska...", pt: "Pesquisar..." },

  // Visit form
  add_visit: { fr: "Programmer une visite", cv: "Programa un vizita", pt: "Programar uma visita" },
  edit_visit: { fr: "Modifier la visite", cv: "Modifika vizita", pt: "Editar a visita" },
  speaker_name: { fr: "Nom de l'orateur", cv: "Nomi di orador", pt: "Nome do orador" },
  congregation: { fr: "Congrégation", cv: "Kongregason", pt: "Congregação" },
  visit_date: { fr: "Date de visite", cv: "Data di vizita", pt: "Data da visita" },
  talk_number: { fr: "N° discours", cv: "N° diskursu", pt: "N° discurso" },
  talk_theme: { fr: "Thème", cv: "Tema", pt: "Tema" },
  location: { fr: "Lieu", cv: "Lugar", pt: "Local" },
  kingdom_hall: { fr: "Salle du Royaume", cv: "Sala di Reinu", pt: "Salão do Reino" },
  zoom: { fr: "Zoom", cv: "Zoom", pt: "Zoom" },
  streaming: { fr: "Streaming", cv: "Streaming", pt: "Streaming" },
  other: { fr: "Autre", cv: "Otru", pt: "Outro" },
  notes: { fr: "Notes", cv: "Notas", pt: "Notas" },
  phone: { fr: "Téléphone", cv: "Telefoni", pt: "Telefone" },
  email: { fr: "Email", cv: "Email", pt: "Email" },
  address: { fr: "Adresse", cv: "Enderesu", pt: "Endereço" },
  name: { fr: "Nom", cv: "Nomi", pt: "Nome" },
  status: { fr: "Statut", cv: "Statu", pt: "Estado" },

  // Dashboard
  total_visits: { fr: "Total visites", cv: "Total vizitas", pt: "Total visitas" },
  upcoming_visits: { fr: "Visites à venir", cv: "Vizitas ki sta pa bem", pt: "Próximas visitas" },
  total_speakers: { fr: "Orateurs", cv: "Irmons", pt: "Oradores" },
  total_hosts: { fr: "Hôtes", cv: "Resebedor", pt: "Anfitriões" },
  recent_activity: { fr: "Activité récente", cv: "Atividadi resenti", pt: "Atividade recente" },
  no_visits: { fr: "Aucune visite programmée", cv: "Ninhun vizita programadu", pt: "Nenhuma visita programada" },
  welcome_message: { fr: "Bienvenue dans votre espace de coordination", cv: "Ben-vindu na bu spasu di koordinason", pt: "Bem-vindo ao seu espaço de coordenação" },

  // Settings
  language: { fr: "Langue", cv: "Língua", pt: "Idioma" },
  dark_mode: { fr: "Mode sombre", cv: "Modu skuru", pt: "Modo escuro" },
  notifications_label: { fr: "Notifications", cv: "Notifikasons", pt: "Notificações" },
  remind_7_days: { fr: "Rappel J-7", cv: "Lembra J-7", pt: "Lembrete D-7" },
  remind_2_days: { fr: "Rappel J-2", cv: "Lembra J-2", pt: "Lembrete D-2" },
  general: { fr: "Général", cv: "Jeral", pt: "Geral" },
  appearance: { fr: "Apparence", cv: "Aparénsia", pt: "Aparência" },
  data: { fr: "Données", cv: "Dadus", pt: "Dados" },
  export_data: { fr: "Exporter les données", cv: "Sporta dadus", pt: "Exportar dados" },
  import_data: { fr: "Importer les données", cv: "Inporta dadus", pt: "Importar dados" },
  import_success: { fr: "Import réussi", cv: "Inportason susesu", pt: "Importação com sucesso" },
  import_error: { fr: "Erreur lors de l'import", cv: "Eru na inportason", pt: "Erro na importação" },
  export_success: { fr: "Export réussi", cv: "Sportason susesu", pt: "Exportação com sucesso" },

  // Hosts
  add_host: { fr: "Ajouter un hôte", cv: "Ajunta un resebedor", pt: "Adicionar anfitrião" },
  capacity: { fr: "Capacité", cv: "Kapasidadi", pt: "Capacidade" },
  role: { fr: "Rôle", cv: "Papel", pt: "Função" },
  hebergement: { fr: "Hébergement", cv: "Alojamentu", pt: "Alojamento" },
  transport: { fr: "Transport", cv: "Transporti", pt: "Transporte" },
  repas: { fr: "Repas", cv: "Kumida", pt: "Refeição" },

  // Speakers
  add_speaker: { fr: "Ajouter un orateur", cv: "Ajunta un orador", pt: "Adicionar orador" },

  // Calendar
  today: { fr: "Aujourd'hui", cv: "Oji", pt: "Hoje" },
  no_visits_today: { fr: "Aucune visite aujourd'hui", cv: "Ninhun vizita oji", pt: "Nenhuma visita hoje" },
  mon: { fr: "Lu", cv: "Sg", pt: "Sg" },
  tue: { fr: "Ma", cv: "Te", pt: "Te" },
  wed: { fr: "Me", cv: "Ku", pt: "Qu" },
  thu: { fr: "Je", cv: "Ki", pt: "Qi" },
  fri: { fr: "Ve", cv: "Ss", pt: "Sx" },
  sat: { fr: "Sa", cv: "Sb", pt: "Sb" },
  sun: { fr: "Di", cv: "Dm", pt: "Dm" },

  // Confirmations
  confirm_delete: { fr: "Confirmer la suppression ?", cv: "Konfirma apaga ?", pt: "Confirmar eliminação?" },
  confirm_delete_visit: { fr: "Supprimer cette visite ?", cv: "Apaga es vizita ?", pt: "Eliminar esta visita?" },
  confirm_delete_speaker: { fr: "Supprimer cet orateur ?", cv: "Apaga es orador ?", pt: "Eliminar este orador?" },
  confirm_delete_host: { fr: "Supprimer cet hôte ?", cv: "Apaga es resebedor ?", pt: "Eliminar este anfitrião?" },
  yes_delete: { fr: "Oui, supprimer", cv: "Sin, apaga", pt: "Sim, eliminar" },

  // Misc
  no_results: { fr: "Aucun résultat", cv: "Ninhun rezultadu", pt: "Nenhum resultado" },
  loading: { fr: "Chargement...", cv: "Karregâ...", pt: "A carregar..." },
  version: { fr: "Version", cv: "Verson", pt: "Versão" },
  visits_count: { fr: "visites", cv: "vizitas", pt: "visitas" },
  speakers_count: { fr: "orateurs", cv: "irmons", pt: "oradores" },
  hosts_count: { fr: "hôtes", cv: "resebedor", pt: "anfitriões" },
  visit_added: { fr: "Visite ajoutée", cv: "Vizita ajuntadu", pt: "Visita adicionada" },
  visit_updated: { fr: "Visite modifiée", cv: "Vizita modifikadu", pt: "Visita atualizada" },
  visit_deleted: { fr: "Visite supprimée", cv: "Vizita apagadu", pt: "Visita eliminada" },
  speaker_added: { fr: "Orateur ajouté", cv: "Orador ajuntadu", pt: "Orador adicionado" },
  speaker_updated: { fr: "Orateur modifié", cv: "Orador modifikadu", pt: "Orador atualizado" },
  speaker_deleted: { fr: "Orateur supprimé", cv: "Orador apagadu", pt: "Orador eliminado" },
  host_added: { fr: "Hôte ajouté", cv: "Resebedor ajuntadu", pt: "Anfitrião adicionado" },
  host_updated: { fr: "Hôte modifié", cv: "Resebedor modifikadu", pt: "Anfitrião atualizado" },
  host_deleted: { fr: "Hôte supprimé", cv: "Resebedor apagadu", pt: "Anfitrião eliminado" },
  visit_confirmed: { fr: "Visite confirmée", cv: "Vizita confirmadu", pt: "Visita confirmada" },

  // New — Dashboard
  welcome_back: { fr: "Bon retour ! Voici un aperçu de votre activité.", cv: "Ben-vindu di volta! Kel ki sta kontese.", pt: "Bem-vindo de volta! Aqui está um resumo da sua atividade." },
  confirmed_count: { fr: "Confirmées", cv: "Confirmadus", pt: "Confirmadas" },
  this_month: { fr: "Ce mois-ci", cv: "Es mes li", pt: "Este mês" },
  recent_activities: { fr: "Activités récentes", cv: "Atividadis resentis", pt: "Atividades recentes" },
  see_all: { fr: "Voir tout", cv: "Odja tudu", pt: "Ver tudo" },
  backup: { fr: "Backup", cv: "Backup", pt: "Backup" },
  in_person: { fr: "Présentiel", cv: "Prezensial", pt: "Presencial" },
  archived: { fr: "Archivées", cv: "Arkivadus", pt: "Arquivadas" },
  schedule: { fr: "Programmer", cv: "Programa", pt: "Programar" },
  view: { fr: "Voir", cv: "Odja", pt: "Ver" },
  repertoire: { fr: "Répertoire", cv: "Ripertóriu", pt: "Repertório" },
  global_repertoire: { fr: "Répertoire global", cv: "Ripertóriu global", pt: "Repertório global" },
  search_speaker: { fr: "Rechercher un orateur...", cv: "Buska un orador...", pt: "Pesquisar um orador..." },
  search_host: { fr: "Chercher un hôte...", cv: "Buska un resebedor...", pt: "Pesquisar um anfitrião..." },

  // Settings tabs
  congregation_profile: { fr: "Profil du groupe ou congrégation", cv: "Perfil di grupu ô kongregason", pt: "Perfil do grupo ou congregação" },
  congregation_name: { fr: "Nom", cv: "Nomi", pt: "Nome" },
  city: { fr: "Ville", cv: "Sidadi", pt: "Cidade" },
  day: { fr: "Jour", cv: "Dia", pt: "Dia" },
  time: { fr: "Heure", cv: "Ora", pt: "Hora" },
  kingdom_hall_address: { fr: "Adresse de la Salle du Royaume", cv: "Inderesu di Sala di Reinu", pt: "Endereço do Salão do Reino" },
  reception_manager: { fr: "Responsable Accueil", cv: "Responsável Akolhimentu", pt: "Responsável Acolhimento" },
  full_name: { fr: "Nom complet", cv: "Nomi kompletu", pt: "Nome completo" },
  whatsapp_group: { fr: "Groupe WhatsApp (Hôtes)", cv: "Grupu WhatsApp (Resebedor)", pt: "Grupo WhatsApp (Anfitriões)" },
  whatsapp_invite_id: { fr: "Invite ID (Groupe WhatsApp)", cv: "Invite ID (Grupu WhatsApp)", pt: "Invite ID (Grupo WhatsApp)" },
  developer: { fr: "Développeur", cv: "Dizenvolvedor", pt: "Desenvolvedor" },
  last_update: { fr: "Dernière mise à jour", cv: "Última atualizason", pt: "Última atualização" },
  app_description: { fr: "Application de gestion des orateurs visiteurs pour la congrégation.", cv: "Aplikason di jeston di irmons vizitanti pa kongregason.", pt: "Aplicação de gestão de oradores visitantes para a congregação." },

  // Appearance
  theme: { fr: "Thème", cv: "Tema", pt: "Tema" },
  light: { fr: "Clair", cv: "Klaru", pt: "Claro" },
  light_desc: { fr: "Interface lumineuse", cv: "Interfasi klaru", pt: "Interface luminosa" },
  dark: { fr: "Sombre", cv: "Skuru", pt: "Escuro" },
  dark_desc: { fr: "Mode nuit", cv: "Modu noiti", pt: "Modo noite" },
  system: { fr: "Système", cv: "Sistema", pt: "Sistema" },
  system_desc: { fr: "Synchronisé OS", cv: "Sinkronizadu OS", pt: "Sincronizado OS" },
  display_language: { fr: "Langue d'affichage", cv: "Lingua di afixason", pt: "Idioma de exibição" },

  // Notifications
  notifications_and_reminders: { fr: "Notifications & Rappels", cv: "Notifikasons i lembransas", pt: "Notificações & Lembretes" },
  notifications_desc: { fr: "Autoriser l'application à envoyer des rappels système.", cv: "Autoriza aplikason pa manda lembransas sistema.", pt: "Autorizar a aplicação a enviar lembretes do sistema." },
  remind_j7_title: { fr: "Rappel J-7 : contacter l'orateur / obtenir confirmation", cv: "Lembra J-7 : kontakta orador / obte konfirmason", pt: "Lembrete D-7 : contactar o orador / obter confirmação" },
  remind_j7_desc: { fr: "Notification une semaine avant la visite pour vérifier que l'orateur a été contacté et confirmé.", cv: "Notifikason un simana antis di vizita pa verifika si orador dja kontaktadu i konfirmadu.", pt: "Notificação uma semana antes da visita para verificar que o orador foi contactado e confirmado." },
  remind_j2_title: { fr: "Rappel J-2 : infos hôtes (après confirmation)", cv: "Lembra J-2 : informasons di resebedor (dipôs di konfirmason)", pt: "Lembrete D-2 : infos anfitriões (após configuração)" },
  remind_j2_desc: { fr: "Une fois la visite confirmée, rappeler de collecter toutes les infos des hôtes (hébergement, transport, repas).", cv: "Asin ki vizita konfirmadu, lembra di koleta tudu informason di resebedor.", pt: "Uma vez a visita confirmada, lembrar de recolher todas as infos dos anfitriões." },
  sounds: { fr: "Sons", cv: "Sons", pt: "Sons" },
  vibration: { fr: "Vibreur", cv: "Vibrador", pt: "Vibração" },

  // Data / Import-Export
  import_export: { fr: "Import / Export", cv: "Inporta / Sporta", pt: "Importar / Exportar" },
  import_json: { fr: "Importer JSON", cv: "Inporta JSON", pt: "Importar JSON" },
  full_backup: { fr: "Sauvegarde complète", cv: "Backup kompletu", pt: "Backup completo" },
  repertoire_speakers_hosts: { fr: "Répertoire Orateurs/Hôtes", cv: "Ripertóriu Irmons/Resebedor", pt: "Repertório Oradores/Anfitriões" },
  last_sync: { fr: "Dernière synchro", cv: "Última sinkro", pt: "Última sincro" },
  export_hint: { fr: "Exportez d'abord le répertoire propre, chargez-le sur les nouvelles installations, puis utilisez Google Sheet uniquement pour les visites.", cv: "Sporta primeru ripertóriu limpu, karga na instalasons novu, dipôs uza Google Sheet sô pa vizitas.", pt: "Exporte primeiro o repertório limpo, carregue nas novas instalações, depois use Google Sheet apenas para as visitas." },
  quick_access: { fr: "Accès rapide", cv: "Asesu rápidu", pt: "Acesso rápido" },
  quick_access_desc: { fr: "Rouvre instantanément les ressources partagées avec la congrégation.", cv: "Ta rabri lógiku kes rekursu partilhadu ku kongregason.", pt: "Reabra instantaneamente os recursos partilhados com a congregação." },
  duplicate_detection: { fr: "Détection des doublons", cv: "Deteson di doblons", pt: "Deteção de duplicados" },
  duplicate_desc: { fr: "Identifie les orateurs et hôtes avec les mêmes coordonnées pour nettoyer la base.", cv: "Ta identifika irmons i resebedor ku mesmu informasons pa limpa bazi.", pt: "Identifica os oradores e anfitriões com as mesmas coordenadas para limpar a base." },
  search_duplicates: { fr: "Rechercher les doublons", cv: "Buska doblons", pt: "Pesquisar duplicados" },
  no_duplicates: { fr: "Aucun doublon trouvé", cv: "Ninhun doblon atxadu", pt: "Nenhum duplicado encontrado" },
  duplicates_found: { fr: "doublons trouvés", cv: "doblons atxadu", pt: "duplicados encontrados" },
  duplicates_deleted: { fr: "Doublons supprimés", cv: "Doblons apagadu", pt: "Duplicados eliminados" },
  no_selection: { fr: "Aucune sélection", cv: "Ninhun seleson", pt: "Nenhuma seleção" },
  selected: { fr: "sélectionné(s)", cv: "selesionadu", pt: "selecionado(s)" },
  delete_selection: { fr: "Supprimer la sélection", cv: "Apaga seleson", pt: "Eliminar seleção" },

  // Sidebar
  program_today: { fr: "Programme du jour", cv: "Programa di oji", pt: "Programa do dia" },
  messages_today: { fr: "Messages du jour", cv: "Mensajens di oji", pt: "Mensagens do dia" },
  upcoming_reminders: { fr: "Rappels à venir", cv: "Lembranças ki sta pa bem", pt: "Lembretes a vir" },

};