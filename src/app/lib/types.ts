// ─── Page Gallery Garden — Core Types ───────────────────────────────────────

// Legacy typing-session types (kept for WritingSurface compatibility)
export interface TypingEvent {
  t: number;
  type: 'insert' | 'delete';
  char?: string;
  pos: number;
  iki: number;
  burst: number;
  pause: number;
  confidence: number;
  hesitation: number;
}

export interface Session {
  startedAt: number;
  events: TypingEvent[];
  finalText: string;
}

export interface Burst {
  id: string;
  chars: string[];
  confidence: number;
  hesitation: number;
  pauseBefore: number;
  ikis: number[];
}

export interface DisplayToken {
  id: string;
  char: string;
  confidence: number;
  hesitation: number;
  pause: number;
  isGhost: boolean;
  createdAt: number;
}

// ─── Supabase Profiles ────────────────────────────────────────────────────────

/** Mirrors the public.profiles table in Supabase. */
export interface Profile {
  id: string;
  display_name: string | null;
  slug: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  full_bio: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  genres: string[];
  themes: string[];
  publication_history: string | null;
  is_public: boolean;
  role: 'writer' | 'editor' | 'journal' | 'admin';
  created_at: string;
  updated_at: string;
}

// ─── Garden / Institution Types ───────────────────────────────────────────────

export type WriterStatus = 'active' | 'seeking' | 'closed';
export type JournalStatus = 'open' | 'closed' | 'rolling';
export type ResidencyStatus = 'open' | 'current' | 'completed';
export type EditionStatus = 'forthcoming' | 'available' | 'sold_out';

export interface WriterProfile {
  id: string;
  name: string;
  slug: string;
  location?: string;
  bio: string;
  forms: string[];          // e.g. ['poetry', 'essay', 'fiction']
  themes: string[];         // e.g. ['grief', 'migration', 'queerness']
  status: WriterStatus;
  gardenMember: boolean;
  publications?: string[];
  website?: string;
  joinedAt: string;         // ISO date
  featuredInEditions?: string[]; // Edition IDs
}

export interface JournalProfile {
  id: string;
  name: string;
  slug: string;
  editors: string[];
  location?: string;
  founded?: string;
  mission: string;
  forms: string[];          // what they publish
  themes: string[];
  status: JournalStatus;
  pays: boolean;
  payNote?: string;
  readingPeriods?: ReadingPeriod[];
  website?: string;
  gardenPartner: boolean;
  residencyAlumnus: boolean;
  pageGalleryImprint: boolean;
  joinedAt: string;
}

export interface ReadingPeriod {
  opens: string;   // ISO date
  closes: string;  // ISO date
  note?: string;
}

export interface ResidencyApplication {
  id: string;
  journalId: string;
  journalName: string;
  contact: string;
  email: string;
  missionStatement: string;
  sampleIssueUrl?: string;
  whyNow: string;
  submittedAt: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'declined';
}

export interface Residency {
  id: string;
  journal: JournalProfile;
  cohort: string;           // e.g. '2025–26'
  status: ResidencyStatus;
  mentorNote?: string;      // editorial note visible to public
  absorptionPathway: boolean;
}

export interface Edition {
  id: string;
  title: string;
  slug: string;
  author: WriterProfile;
  illustrator?: string;
  forewordBy?: string;
  dateWrittenStart: string; // ISO date
  dateWrittenEnd: string;   // ISO date
  published: string;        // ISO date
  status: EditionStatus;
  coverImage?: string;
  description: string;
  pages: number;
  printRun: number;
  priceChapbook: number;
  priceGiclée?: number;
  priceOriginal?: number;
  isbn?: string;
  contextSummary: string;   // editorial record of the period
}

export interface GardenCallout {
  id: string;
  type: 'open_call' | 'residency' | 'announcement' | 'edition';
  title: string;
  body: string;
  date: string;
  link?: string;
  urgent: boolean;
}

export interface PrintPartner {
  id: string;
  name: string;
  location: string;
  specialisms: string[];    // e.g. ['risograph', 'letterpress', 'short-run offset']
  minRun: number;
  website?: string;
  gardenPartner: boolean;
}
