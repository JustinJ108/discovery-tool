import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Contact, DiscoveryNote, Organization, PainPoint, PainPointInsert } from '../types/database'
import Modal from '../components/Modal'
import PainPointForm from '../components/forms/PainPointForm'
import SeverityBadge from '../components/SeverityBadge'
import { PrimaryButton, DangerLink } from '../components/ui'

export default function PainPointsPage() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [discoveryNotes, setDiscoveryNotes] = useState<DiscoveryNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ mode: 'create' } | { mode: 'edit'; painPoint: PainPoint } | null>(
    null
  )

  async function load() {
    setLoading(true)
    const [ppRes, orgsRes, contactsRes, notesRes] = await Promise.all([
      supabase.from('pain_points').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('name'),
      supabase.from('contacts').select('*'),
      supabase.from('discovery_notes').select('*'),
    ])
    if (ppRes.error) setError(ppRes.error.message)
    else setPainPoints(ppRes.data ?? [])
    setOrganizations(orgsRes.data ?? [])
    setContacts(contactsRes.data ?? [])
    setDiscoveryNotes(notesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function orgName(orgId: string) {
    return organizations.find((o) => o.id === orgId)?.name ?? '—'
  }
  function contactName(contactId: string | null) {
    if (!contactId) return '—'
    const c = contacts.find((c) => c.id === contactId)
    return c ? `${c.first_name} ${c.last_name ?? ''}`.trim() : '—'
  }
  function noteLabel(noteId: string | null) {
    if (!noteId) return '—'
    const n = discoveryNotes.find((n) => n.id === noteId)
    return n ? n.title || n.content.slice(0, 30) + '…' : '—'
  }

  async function handleCreate(values: PainPointInsert) {
    const { error } = await supabase.from('pain_points').insert(values)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleUpdate(id: string, values: PainPointInsert) {
    const { error } = await supabase.from('pain_points').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleDelete(painPoint: PainPoint) {
    if (!confirm('Delete this pain point?')) return
    const { error } = await supabase.from('pain_points').delete().eq('id', painPoint.id)
    if (error) setError(error.message)
    else await load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Pain Points</h1>
        <PrimaryButton
          onClick={() => setModalState({ mode: 'create' })}
          disabled={organizations.length === 0}
          title={organizations.length === 0 ? 'Add an organization first' : undefined}
        >
          Add pain point
        </PrimaryButton>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {organizations.length === 0 && !loading && (
        <p className="mb-4 text-sm text-slate-500">
          You need at least one organization before adding pain points.{' '}
          <Link to="/" className="text-indigo-600 hover:underline">
            Add one here.
          </Link>
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Description</th>
              <th className="px-4 py-2 font-medium">Organization</th>
              <th className="px-4 py-2 font-medium">Contact</th>
              <th className="px-4 py-2 font-medium">Discovery note</th>
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Severity</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : painPoints.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  No pain points yet.
                </td>
              </tr>
            ) : (
              painPoints.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="max-w-xs px-4 py-2 text-slate-900">{p.description}</td>
                  <td className="px-4 py-2 text-slate-600">
                    <Link to={`/organizations/${p.organization_id}`} className="text-indigo-600 hover:underline">
                      {orgName(p.organization_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{contactName(p.contact_id)}</td>
                  <td className="px-4 py-2 text-slate-600">{noteLabel(p.discovery_note_id)}</td>
                  <td className="px-4 py-2 text-slate-600">{p.category ?? '—'}</td>
                  <td className="px-4 py-2">
                    <SeverityBadge severity={p.severity} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: 'edit', painPoint: p })}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        Edit
                      </button>
                      <DangerLink type="button" onClick={() => handleDelete(p)}>
                        Delete
                      </DangerLink>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalState && (
        <Modal
          title={modalState.mode === 'create' ? 'Add pain point' : 'Edit pain point'}
          onClose={() => setModalState(null)}
        >
          <PainPointForm
            initial={modalState.mode === 'edit' ? modalState.painPoint : undefined}
            organizations={organizations}
            contacts={contacts}
            discoveryNotes={discoveryNotes}
            onCancel={() => setModalState(null)}
            onSubmit={(values) =>
              modalState.mode === 'create' ? handleCreate(values) : handleUpdate(modalState.painPoint.id, values)
            }
          />
        </Modal>
      )}
    </div>
  )
}
