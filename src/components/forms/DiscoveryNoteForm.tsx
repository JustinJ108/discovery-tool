import { useMemo, useState, type FormEvent } from 'react'
import type { Contact, DiscoveryNote, DiscoveryNoteInsert, Organization } from '../../types/database'
import { Field, Input, Select, Textarea, PrimaryButton, SecondaryButton } from '../ui'

interface Props {
  initial?: DiscoveryNote
  organizations: Organization[]
  contacts: Contact[]
  lockedOrganizationId?: string
  onSubmit: (values: DiscoveryNoteInsert) => Promise<void>
  onCancel: () => void
}

export default function DiscoveryNoteForm({
  initial,
  organizations,
  contacts,
  lockedOrganizationId,
  onSubmit,
  onCancel,
}: Props) {
  const [organizationId, setOrganizationId] = useState(
    initial?.organization_id ?? lockedOrganizationId ?? organizations[0]?.id ?? ''
  )
  const [contactId, setContactId] = useState(initial?.contact_id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [meetingDate, setMeetingDate] = useState(initial?.meeting_date ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const contactsForOrg = useMemo(
    () => contacts.filter((c) => c.organization_id === organizationId),
    [contacts, organizationId]
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
        title: title || null,
        content,
        meeting_date: meetingDate || null,
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
      <Field label="Title">
        <Input
          placeholder="e.g. Kickoff call"
          value={title ?? ''}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field label="Meeting date">
        <Input type="date" value={meetingDate ?? ''} onChange={(e) => setMeetingDate(e.target.value)} />
      </Field>
      <Field label="Notes">
        <Textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
      </Field>

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
