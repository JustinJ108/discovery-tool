import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Contact, ContactInsert, Organization } from '../types/database'
import Modal from '../components/Modal'
import ContactForm from '../components/forms/ContactForm'
import { PrimaryButton, DangerLink } from '../components/ui'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ mode: 'create' } | { mode: 'edit'; contact: Contact } | null>(
    null
  )

  async function load() {
    setLoading(true)
    const [contactsRes, orgsRes] = await Promise.all([
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('name'),
    ])
    if (contactsRes.error) setError(contactsRes.error.message)
    else setContacts(contactsRes.data ?? [])
    setOrganizations(orgsRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function orgName(orgId: string) {
    return organizations.find((o) => o.id === orgId)?.name ?? '—'
  }

  async function handleCreate(values: ContactInsert) {
    const { error } = await supabase.from('contacts').insert(values)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleUpdate(id: string, values: ContactInsert) {
    const { error } = await supabase.from('contacts').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleDelete(contact: Contact) {
    if (!confirm(`Delete contact "${contact.first_name} ${contact.last_name ?? ''}"?`)) return
    const { error } = await supabase.from('contacts').delete().eq('id', contact.id)
    if (error) setError(error.message)
    else await load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Contacts</h1>
        <PrimaryButton
          onClick={() => setModalState({ mode: 'create' })}
          disabled={organizations.length === 0}
          title={organizations.length === 0 ? 'Add an organization first' : undefined}
        >
          Add contact
        </PrimaryButton>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {organizations.length === 0 && !loading && (
        <p className="mb-4 text-sm text-slate-500">
          You need at least one organization before adding contacts.{' '}
          <Link to="/" className="text-indigo-600 hover:underline">
            Add one here.
          </Link>
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Organization</th>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No contacts yet.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {c.first_name} {c.last_name ?? ''}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <Link to={`/organizations/${c.organization_id}`} className="text-indigo-600 hover:underline">
                      {orgName(c.organization_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{c.title ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{c.phone ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: 'edit', contact: c })}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        Edit
                      </button>
                      <DangerLink type="button" onClick={() => handleDelete(c)}>
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
          title={modalState.mode === 'create' ? 'Add contact' : 'Edit contact'}
          onClose={() => setModalState(null)}
        >
          <ContactForm
            initial={modalState.mode === 'edit' ? modalState.contact : undefined}
            organizations={organizations}
            onCancel={() => setModalState(null)}
            onSubmit={(values) =>
              modalState.mode === 'create' ? handleCreate(values) : handleUpdate(modalState.contact.id, values)
            }
          />
        </Modal>
      )}
    </div>
  )
}
