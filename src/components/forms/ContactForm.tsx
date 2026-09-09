import { useState, type FormEvent } from 'react'
import type { Contact, ContactInsert, Organization } from '../../types/database'
import { Field, Input, Select, PrimaryButton, SecondaryButton } from '../ui'

interface Props {
  initial?: Contact
  organizations: Organization[]
  /** Lock the organization to this id and hide the picker (used from an org's detail page). */
  lockedOrganizationId?: string
  onSubmit: (values: ContactInsert) => Promise<void>
  onCancel: () => void
}

export default function ContactForm({ initial, organizations, lockedOrganizationId, onSubmit, onCancel }: Props) {
  const [organizationId, setOrganizationId] = useState(
    initial?.organization_id ?? lockedOrganizationId ?? organizations[0]?.id ?? ''
  )
  const [firstName, setFirstName] = useState(initial?.first_name ?? '')
  const [lastName, setLastName] = useState(initial?.last_name ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedin_url ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        first_name: firstName,
        last_name: lastName || null,
        title: title || null,
        email: email || null,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
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
          <Select required value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </Field>
        <Field label="Last name">
          <Input value={lastName ?? ''} onChange={(e) => setLastName(e.target.value)} />
        </Field>
      </div>
      <Field label="Title">
        <Input value={title ?? ''} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Phone">
        <Input type="tel" value={phone ?? ''} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="LinkedIn URL">
        <Input
          type="url"
          placeholder="https://linkedin.com/in/…"
          value={linkedinUrl ?? ''}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
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
