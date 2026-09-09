import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type {
  Contact,
  ContactInsert,
  DiscoveryNote,
  DiscoveryNoteInsert,
  Organization,
  PainPoint,
  PainPointInsert,
} from '../types/database'
import Modal from '../components/Modal'
import ContactForm from '../components/forms/ContactForm'
import DiscoveryNoteForm from '../components/forms/DiscoveryNoteForm'
import PainPointForm from '../components/forms/PainPointForm'
import SeverityBadge from '../components/SeverityBadge'
import { PrimaryButton, DangerLink } from '../components/ui'

type ModalKind = 'contact' | 'note' | 'painPoint' | null

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [org, setOrg] = useState<Organization | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [notes, setNotes] = useState<DiscoveryNote[]>([])
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalKind>(null)

  async function load() {
    if (!id) return
    setLoading(true)
    const [orgRes, contactsRes, notesRes, painPointsRes] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', id).single(),
      supabase.from('contacts').select('*').eq('organization_id', id).order('created_at', { ascending: false }),
      supabase
        .from('discovery_notes')
        .select('*')
        .eq('organization_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('pain_points')
        .select('*')
        .eq('organization_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (orgRes.error) setError(orgRes.error.message)
    else setOrg(orgRes.data)
    setContacts(contactsRes.data ?? [])
    setNotes(notesRes.data ?? [])
    setPainPoints(painPointsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleDeleteOrg() {
    if (!org) return
    if (!confirm(`Delete "${org.name}"? This also deletes its contacts, notes, and pain points.`)) return
    const { error } = await supabase.from('organizations').delete().eq('id', org.id)
    if (error) setError(error.message)
    else navigate('/')
  }

  async function handleCreateContact(values: ContactInsert) {
    const { error } = await supabase.from('contacts').insert(values)
    if (error) throw new Error(error.message)
    setModal(null)
    await load()
  }

  async function handleDeleteContact(contact: Contact) {
    if (!confirm(`Delete contact "${contact.first_name} ${contact.last_name ?? ''}"?`)) return
    const { error } = await supabase.from('contacts').delete().eq('id', contact.id)
    if (error) setError(error.message)
    else await load()
  }

  async function handleCreateNote(values: DiscoveryNoteInsert) {
    const { error } = await supabase.from('discovery_notes').insert(values)
    if (error) throw new Error(error.message)
    setModal(null)
    await load()
  }

  async function handleDeleteNote(note: DiscoveryNote) {
    if (!confirm('Delete this discovery note?')) return
    const { error } = await supabase.from('discovery_notes').delete().eq('id', note.id)
    if (error) setError(error.message)
    else await load()
  }

  async function handleCreatePainPoint(values: PainPointInsert) {
    const { error } = await supabase.from('pain_points').insert(values)
    if (error) throw new Error(error.message)
    setModal(null)
    await load()
  }

  async function handleDeletePainPoint(painPoint: PainPoint) {
    if (!confirm('Delete this pain point?')) return
    const { error } = await supabase.from('pain_points').delete().eq('id', painPoint.id)
    if (error) setError(error.message)
    else await load()
  }

  function contactName(contactId: string | null) {
    if (!contactId) return '—'
    const c = contacts.find((c) => c.id === contactId)
    return c ? `${c.first_name} ${c.last_name ?? ''}`.trim() : '—'
  }

  if (loading) return <p className="text-slate-400">Loading…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!org) return <p className="text-slate-400">Organization not found.</p>

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← All organizations
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{org.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {[org.industry, org.size ? `${org.size} employees` : null].filter(Boolean).join(' · ') || '—'}
            </p>
            {org.website && (
              <a href={org.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">
                {org.website}
              </a>
            )}
            {org.notes && <p className="mt-2 max-w-2xl text-sm text-slate-600">{org.notes}</p>}
          </div>
          <DangerLink type="button" onClick={handleDeleteOrg}>
            Delete organization
          </DangerLink>
        </div>
      </div>

      {/* Contacts */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Contacts</h2>
          <PrimaryButton onClick={() => setModal('contact')}>Add contact</PrimaryButton>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No contacts yet.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {c.first_name} {c.last_name ?? ''}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{c.title ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{c.email ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{c.phone ?? '—'}</td>
                    <td className="px-4 py-2 text-right">
                      <DangerLink type="button" onClick={() => handleDeleteContact(c)}>
                        Delete
                      </DangerLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Discovery Notes */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Discovery Notes</h2>
          <PrimaryButton onClick={() => setModal('note')}>Add note</PrimaryButton>
        </div>
        <div className="space-y-3">
          {notes.length === 0 ? (
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
                      {note.meeting_date ? new Date(note.meeting_date).toLocaleDateString() : ''}
                      {note.contact_id ? ` · ${contactName(note.contact_id)}` : ''}
                    </p>
                  </div>
                  <DangerLink type="button" onClick={() => handleDeleteNote(note)}>
                    Delete
                  </DangerLink>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Pain Points */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pain Points</h2>
          <PrimaryButton onClick={() => setModal('painPoint')}>Add pain point</PrimaryButton>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Contact</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {painPoints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No pain points yet.
                  </td>
                </tr>
              ) : (
                painPoints.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="max-w-md px-4 py-2 text-slate-900">{p.description}</td>
                    <td className="px-4 py-2 text-slate-600">{p.category ?? '—'}</td>
                    <td className="px-4 py-2">
                      <SeverityBadge severity={p.severity} />
                    </td>
                    <td className="px-4 py-2 text-slate-600">{contactName(p.contact_id)}</td>
                    <td className="px-4 py-2 text-right">
                      <DangerLink type="button" onClick={() => handleDeletePainPoint(p)}>
                        Delete
                      </DangerLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal === 'contact' && (
        <Modal title="Add contact" onClose={() => setModal(null)}>
          <ContactForm
            organizations={[org]}
            lockedOrganizationId={org.id}
            onCancel={() => setModal(null)}
            onSubmit={handleCreateContact}
          />
        </Modal>
      )}
      {modal === 'note' && (
        <Modal title="Add discovery note" onClose={() => setModal(null)}>
          <DiscoveryNoteForm
            organizations={[org]}
            contacts={contacts}
            lockedOrganizationId={org.id}
            onCancel={() => setModal(null)}
            onSubmit={handleCreateNote}
          />
        </Modal>
      )}
      {modal === 'painPoint' && (
        <Modal title="Add pain point" onClose={() => setModal(null)}>
          <PainPointForm
            organizations={[org]}
            contacts={contacts}
            discoveryNotes={notes}
            lockedOrganizationId={org.id}
            onCancel={() => setModal(null)}
            onSubmit={handleCreatePainPoint}
          />
        </Modal>
      )}
    </div>
  )
}
