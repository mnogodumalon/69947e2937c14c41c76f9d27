// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Gewohnheiten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    gewohnheit_name?: string;
    beschreibung?: string;
    kategorie?: 'gesundheit' | 'fitness' | 'ernaehrung' | 'produktivitaet' | 'persoenliche_entwicklung' | 'soziales' | 'finanzen' | 'sonstiges';
    ziel_haeufigkeit?: 'taeglich' | 'mehrmals_woche' | 'woechentlich' | 'monatlich';
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    aktiv?: boolean;
  };
}

export interface TrackingEintraege {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    gewohnheit?: string; // applookup -> URL zu 'Gewohnheiten' Record
    datum_uhrzeit?: string; // Format: YYYY-MM-DD oder ISO String
    status?: string;
    bewertung?: number;
    notizen?: string;
  };
}

export interface TaeglicherCheckIn {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    checkin_datum?: string; // Format: YYYY-MM-DD oder ISO String
    erledigte_gewohnheiten?: string;
    tagesnotizen?: string;
  };
}

export const APP_IDS = {
  GEWOHNHEITEN: '69947e07b7b8c3499c21cd9b',
  TRACKING_EINTRAEGE: '69947e154f3e4ff52b965f17',
  TAEGLICHER_CHECK_IN: '69947e17c23629598e36e8b1',
} as const;

// Helper Types for creating new records
export type CreateGewohnheiten = Gewohnheiten['fields'];
export type CreateTrackingEintraege = TrackingEintraege['fields'];
export type CreateTaeglicherCheckIn = TaeglicherCheckIn['fields'];