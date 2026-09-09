import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Organization, OrganizationInsert } from '../types/database'
import Modal from '../components/Modal'
import OrganizationForm from '../components/forms/OrganizationForm'
import { PrimaryButton, DangerLink } from '../components/ui'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ mode: 'create' } | { mode: 'edit'; org: Organization } | null>(
    null
  )

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setOrganizations(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(values: OrganizationInsert) {
    const { error } = await supabase.from('organizations').insert(values)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleUpdate(id: string, values: OrganizationInsert) {
    const { error } = await supabase.from('organizations').update(values).eq('id', id)
    if (error) throw new Error(error.message)
    setModalState(null)
    await load()
  }

  async function handleDelete(org: Organization) {
    if (!confirm(`Delete "${org.name}"? This also deletes its contacts, notes, and pain points.`)) return
    const { error } = await supabase.from('organizations').delete().eq('id', org.id)
    if (error) setError(error.message)
    else await load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Organizations</h1>
        <PrimaryButton onClick={() => setModalState({ mode: 'create' })}>Add organization</PrimaryButton>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Industry</th>
              <th className="px-4 py-2 font-medium">Size</th>
              <th className="px-4 py-2 font-medium">Website</th>
              <th className="px-4 py-2 font-medium">Created</th>
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
            ) : organizations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No organizations yet.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    <Link to={`/organizations/${org.id}`} className="text-indigo-600 hover:underline">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{org.industry ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{org.size ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {org.website ? (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        {org.website}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalState({ mode: 'edit', org })}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        Edit
                      </button>
                      <DangerLink type="button" onClick={() => handleDelete(org)}>
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
          title={modalState.mode === 'create' ? 'Add organization' : 'Edit organization'}
          onClose={() => setModalState(null)}
        >
          <OrganizationForm
            initial={modalState.mode === 'edit' ? modalState.org : undefined}
            onCancel={() => setModalState(null)}
            onSubmit={(values) =>
              modalState.mode === 'create' ? handleCreate(values) : handleUpdate(modalState.org.id, values)
            }
          />
        </Modal>
      )}
    </div>
  )
}
