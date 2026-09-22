// Domain entities — speakers, hosts, visits and their nested types.
// Settings live separately in `./settingsTypes`.

export type VisitStatus = "scheduled" | "confirmed" | "cancelled" | "completed";
export type LocationType = "kingdom_hall" | "zoom" | "streaming" | "other";
export type VisitHostRole = "hebergement" | "transport" | "repas" | "visite_lyon";

export interface Host {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  adresse?: string;
  notes?: string;
  role?: VisitHostRole;
  photoUrl?: string;
  capacity?: number;
  updatedAt?: string;
}

export interface Companion {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
  notes?: string;
  gender?: string;
  assignedHostId?: string;
  assignedHostName?: string;
  assignedHostRole?: VisitHostRole;
  ageGroup?: "adult" | "child";
  childAge?: string;
  dietary?: string;
  transportType?: "car" | "train" | "plane" | "other" | "with_speaker";
  transportDetails?: string;
  needsHosting?: boolean;
  accompaniedByFamily?: boolean;
  familyDetails?: string;
}

export interface HostAssignment {
  hostId?: string;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  hostAddress?: string;
  hostPhotoUrl?: string;
  role: VisitHostRole;
  day?: string;
  time?: string;
  origin?: string;
  companionId?: string;
  companionName?: string;
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  category?: string;
}

export type GroupMealType = "salle_du_royaume" | "restaurant" | "";

export interface Visit {
  visitId: string;
  nom: string;
  congregation: string;
  visitDate: string;
  heure_visite?: string;
  locationType: LocationType;
  status: VisitStatus;
  isEvent?: boolean;
  eventType?: "event" | "congres" | "assemblee";
  talkNoOrType: string;
  talkTheme?: string;
  hostAssignments?: HostAssignment[];
  speakerPhone?: string;
  notes?: string;
  feedback?: string;
  feedbackRating?: number;
  companions?: Companion[];
  date_arrivee?: string;
  heure_arrivee?: string;
  date_depart?: string;
  heure_depart?: string;
  speakerDietary?: string;
  spouseDietary?: string;
  expenses?: Expense[];
  groupMealType?: GroupMealType;
  transportType?: "car" | "train" | "plane" | "other";
  transportDetails?: string;
  childrenCount?: number;
  childrenAges?: string;
  childrenDietary?: string;
  updatedAt?: string;
  /** If true, this speaker is from the local congregation — no hosting needed */
  localSpeaker?: boolean;
}

export type HouseholdType = "single" | "couple";

export interface Speaker {
  id: string;
  nom: string;
  congregation: string;
  telephone?: string;
  email?: string;
  photoUrl?: string;
  spousePhotoUrl?: string;
  householdType?: HouseholdType;
  spouseName?: string;
  spousePhone?: string;
  theocraticRole?: "ancien" | "serviteur_ministeriel" | "pionnier" | "surveillant_circonscription" | "autre";
  childrenCount?: number;
  childrenAges?: string;
  dietary?: string;
  spouseDietary?: string;
  notes?: string;
  updatedAt?: string;
  /** If true, this speaker is from the local congregation — no hosting needed */
  localSpeaker?: boolean;
}
