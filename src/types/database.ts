// Hand-written types mirroring the Supabase schema (organizations, contacts,
// discovery_notes, pain_points). If you change the schema, update this file
// to match, or generate it instead with the Supabase CLI:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type Organization = {
  id: string
  name: string
  industry: string | null
  website: string | null
  size: string | null
  notes: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type Contact = {
  id: string
  organization_id: string
  first_name: string
  last_name: string | null
  title: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type DiscoveryNote = {
  id: string
  organization_id: string
  contact_id: string | null
  title: string | null
  content: string
  meeting_date: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type PainPoint = {
  id: string
  organization_id: string
  contact_id: string | null
  discovery_note_id: string | null
  description: string
  category: string | null
  severity: Severity | null
  owner_id: string
  created_at: string
  updated_at: string
}

type OmittedOnInsert = 'id' | 'owner_id' | 'created_at' | 'updated_at'

export type OrganizationInsert = Omit<Organization, OmittedOnInsert>
export type OrganizationUpdate = Partial<OrganizationInsert>

export type ContactInsert = Omit<Contact, OmittedOnInsert>
export type ContactUpdate = Partial<ContactInsert>

export type DiscoveryNoteInsert = Omit<DiscoveryNote, OmittedOnInsert>
export type DiscoveryNoteUpdate = Partial<DiscoveryNoteInsert>

export type PainPointInsert = Omit<PainPoint, OmittedOnInsert>
export type PainPointUpdate = Partial<PainPointInsert>

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: OrganizationInsert
        Update: OrganizationUpdate
        Relationships: []
      }
      contacts: {
        Row: Contact
        Insert: ContactInsert
        Update: ContactUpdate
        Relationships: []
      }
      discovery_notes: {
        Row: DiscoveryNote
        Insert: DiscoveryNoteInsert
        Update: DiscoveryNoteUpdate
        Relationships: []
      }
      pain_points: {
        Row: PainPoint
        Insert: PainPointInsert
        Update: PainPointUpdate
        Relationships: []
      }
    }
    // Required by the supabase-js Database generic shape even though unused here.
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
