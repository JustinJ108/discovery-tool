import { useState, type FormEvent } from 'react'
import type { Organization, OrganizationInsert } from '../../types/database'
import { Field, Input, Select, Textarea, PrimaryButton, SecondaryButton } from '../ui'

const SIZE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

interface Props {
  initial?: Organization
  onSubmit: (values: OrganizationInsert) => Promise<void>
  onCancel: () => void
}

export default function OrganizationForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [industry, setIndustry] = useState(initial?.industry ?? '')
  const [website, setWebsite] = useState(initial?.website ?? '')
  const [size, setSize] = useState(initial?.size ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        name,
        industry: industry || null,
        website: website || null,
        size: size || null,
        notes: notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name">
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Industry">
        <Input value={industry ?? ''} onChange={(e) => setIndustry(e.target.value)} />
      </Field>
      <Field label="Website">
        <Input
          type="url"
          placeholder="https://"
          value={website ?? ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </Field>
      <Field label="Size">
        <Select value={size ?? ''} onChange={(e) => setSize(e.target.value)}>
          <option value="">—</option>
          {SIZE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt} employees
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Notes">
        <Textarea rows={3} value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} />
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
