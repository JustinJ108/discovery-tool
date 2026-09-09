import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'

const fieldClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClass} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={fieldClass} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={fieldClass} />
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
    />
  )
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    />
  )
}

export function DangerLink(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className="text-sm text-red-600 hover:underline disabled:opacity-50" />
}
