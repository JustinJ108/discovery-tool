import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Contact, DiscoveryNote, DiscoveryNoteInsert, Organization } from '../types/database'
import Modal from '../components/Modal'
import DiscoveryNoteForm from '../components/forms/DiscoveryNoteForm'
import { PrimaryButton, DangerLink } from '../components/ui'

export default function DiscoveryNotesPage() {
  const [notes, setNotes] = useState<DiscoveryNote[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ mode: 'create' } | { mode: 'edit'; note: DiscoveryNote } | null>(
    null
  )

  async function load() {
    setLoading(true)
    const [notesRes, orgsRes, contactsRes] = await Promise.all([
      supabase.from('discovery_notes').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('name'),
      supabase.from('contacts').select('*'),
    ])
    if (notesRes.error) setError(notesRes.error.message)
    else setNotes(notesRes.data ?? [])
    setOrganizations(orgsRes.data ?? [])
    setContacts(contactsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function orgName(orgId: string) {
    return organizations.find((o) => o.id === orgId)?.name ?? '—'
  }
  function contactName(contactId: string | null) {
    if (!contactId) return null
    const c = contacts.find((c) => c.id === contactId)
    return c ? `${c.first_name} ${c.last_name ?? ''}`.trim() : null
  }

  async function handleCreate(values: DiscoveryNoteInsert) {
    const { error } = await supabase.from('discovery_notes').insert(values)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleUpdate(id: string, values: DiscoveryNoteInsert) {
    const { error } = await supabase.from('discovery_notes').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleDelete(note: DiscoveryNote) {
    if (!confirm('Delete this discovery note? Any pain points linked to it will keep their record but lose the link.')) return
    const { error } = await supabase.from('discovery_notes').delete().eq('id', note.id)
    if (error) setError(error.message)
    else await load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Discovery Notes</h1>
        <PrimaryButton
          onClick={() => setModalState({ mode: 'create' })}
          disabled={organizations.length === 0}
          title={organizations.length === 0 ? 'Add an organization first' : undefined}
        >
          Add note
        </PrimaryButton>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {organizations.length === 0 && !loading && (
        <p className="mb-4 text-sm text-slate-500">
          You need at least one organization before adding notes.{' '}
          <Link to="/" className="text-indigo-600 hover:underline">
            Add one here.
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-slate-400">
            No discovery notes yet.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{note.title || 'Untitled note'}</p>
                  <p className="text-xs text-slate-500">
                    <Link to={`/organizations/${note.organization_id}`} className="text-indigo-600 hover:underline">
                      {orgName(note.organization_id)}
                    </Link>
                    {contactName(note.contact_id) ? ` · ${contactName(note.contact_id)}` : ''}
                    {note.meeting_date ? ` · ${new Date(note.meeting_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalState({ mode: 'edit', note })}
                    className="text-sm text-slate-600 hover:underline"
                  >
                    Edit
                  </button>
                  <DangerLink type="button" onClick={() => handleDelete(note)}>
                    Delete
                  </DangerLink>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
            </div>
          ))
        )}
      </div>

      {modalState && (
        <Modal
          title={modalState.mode === 'create' ? 'Add discovery note' : 'Edit discovery note'}
          onClose={() => setModalState(null)}
        >
          <DiscoveryNoteForm
            initial={modalState.mode === 'edit' ? modalState.note : undefined}
            organizations={organizations}
            contacts={contacts}
            onCancel={() => setModalState(null)}
            onSubmit={(values) =>
              modalState.mode === 'create' ? handleCreate(values) : handleUpdate(modalState.note.id, values)
            }
          />
        </Modal>
      )}
    </div>
  )
}
