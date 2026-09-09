import { useMemo, useState, type FormEvent } from 'react'
import type {
  Contact,
  DiscoveryNote,
  Organization,
  PainPoint,
  PainPointInsert,
  Severity,
} from '../../types/database'
import { Field, Input, Select, Textarea, PrimaryButton, SecondaryButton } from '../ui'

const SEVERITY_OPTIONS: Severity[] = ['low', 'medium', 'high', 'critical']

interface Props {
  initial?: PainPoint
  organizations: Organization[]
  contacts: Contact[]
  discoveryNotes: DiscoveryNote[]
  lockedOrganizationId?: string
  onSubmit: (values: PainPointInsert) => Promise<void>
  onCancel: () => void
}

export default function PainPointForm({
  initial,
  organizations,
  contacts,
  discoveryNotes,
  lockedOrganizationId,
  onSubmit,
  onCancel,
}: Props) {
  const [organizationId, setOrganizationId] = useState(
    initial?.organization_id ?? lockedOrganizationId ?? organizations[0]?.id ?? ''
  )
  const [contactId, setContactId] = useState(initial?.contact_id ?? '')
  const [discoveryNoteId, setDiscoveryNoteId] = useState(initial?.discovery_note_id ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [severity, setSeverity] = useState<Severity | ''>(initial?.severity ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contactsForOrg = useMemo(
    () => contacts.filter((c) => c.organization_id === organizationId),
    [contacts, organizationId]
  )
  const notesForOrg = useMemo(
    () => discoveryNotes.filter((n) => n.organization_id === organizationId),
    [discoveryNotes, organizationId]
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!organizationId) {
      setError('Please select an organization.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        organization_id: organizationId,
        contact_id: contactId || null,
        discovery_note_id: discoveryNoteId || null,
        description,
        category: category || null,
        severity: severity || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!lockedOrganizationId && (
        <Field label="Organization">
          <Select
            required
            value={organizationId}
            onChange={(e) => {
              setOrganizationId(e.target.value)
              setContactId('')
              setDiscoveryNoteId('')
            }}
          >
            <option value="" disabled>
              Select an organization…
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Linked discovery note (optional)">
        <Select value={discoveryNoteId ?? ''} onChange={(e) => setDiscoveryNoteId(e.target.value)}>
          <option value="">—</option>
          {notesForOrg.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title || n.content.slice(0, 40)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Contact (optional)">
        <Select value={contactId ?? ''} onChange={(e) => setContactId(e.target.value)}>
          <option value="">—</option>
          {contactsForOrg.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name ?? ''}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description">
        <Textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Input
            placeholder="e.g. budget, technical"
            value={category ?? ''}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Field>
        <Field label="Severity">
          <Select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | '')}>
            <option value="">—</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </PrimaryButton>
      </div>
    </form>
  )
}
