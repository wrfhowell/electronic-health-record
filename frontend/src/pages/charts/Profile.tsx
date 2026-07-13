import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { useUpdatePatient } from '../../api/hooks'
import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'
import { fmtDate } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

type SectionKey = 'patient' | 'contact' | 'address' | 'insurance' | 'guarantor'

interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'date' | 'select'
  options?: string[]
}

const SECTIONS: Record<SectionKey, FieldDef[]> = {
  patient: [
    { key: 'first_name', label: 'First name' },
    { key: 'last_name', label: 'Last name' },
    { key: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Unknown'] },
    { key: 'dob', label: 'Date of birth', type: 'date' },
    { key: 'status', label: 'Patient status', type: 'select', options: ['Active', 'Inactive', 'Deceased'] },
  ],
  contact: [
    { key: 'phone_mobile', label: 'Mobile phone' },
    { key: 'phone_home', label: 'Home phone' },
    { key: 'phone_work', label: 'Work phone' },
    { key: 'email', label: 'Email' },
  ],
  address: [
    { key: 'address_street', label: 'Street' },
    { key: 'address_city', label: 'City' },
    { key: 'address_state', label: 'State' },
    { key: 'address_zip', label: 'Zip' },
  ],
  insurance: [
    { key: 'insurance_payer', label: 'Payer' },
    { key: 'insurance_plan', label: 'Plan' },
    { key: 'insurance_member_id', label: 'Member ID' },
    { key: 'insurance_group_id', label: 'Group ID' },
  ],
  guarantor: [{ key: 'guarantor_name', label: 'Guarantor name' }],
}

function EditableSection({
  title,
  section,
  reminders,
}: {
  title: string
  section: SectionKey
  reminders?: boolean
}) {
  const { summary } = useOutletContext<ChartContext>()
  const p = summary.patient as unknown as Record<string, string | null>
  const update = useUpdatePatient(summary.patient.id)
  const toast = useToast()
  const fields = SECTIONS[section]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [emailOn, setEmailOn] = useState(false)
  const [textOn, setTextOn] = useState(false)

  function startEdit() {
    const init: Record<string, string> = {}
    for (const f of fields) init[f.key] = (p[f.key] as string) ?? ''
    setDraft(init)
    setEditing(true)
  }

  function save() {
    const payload: Record<string, string | null> = {}
    for (const f of fields) payload[f.key] = draft[f.key] || null
    if (section === 'patient' && !draft.dob) {
      toast('Date of birth is required', 'error')
      return
    }
    update.mutate(payload, {
      onSuccess: () => {
        toast(`${title} saved`, 'success')
        setEditing(false)
      },
      onError: (err) => toast(err.message, 'error'),
    })
  }

  return (
    <section className="pf-card">
      <div className="flex items-center justify-between border-b border-pf-border px-4 py-3">
        <h2 className="text-[17px] font-bold">{title}</h2>
        {editing ? (
          <span className="space-x-2">
            <button className="btn-blue-outline !py-0.5" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn-orange !py-0.5" onClick={save} disabled={update.isPending}>
              Save
            </button>
          </span>
        ) : (
          <button className="pf-link font-semibold" onClick={startEdit}>
            Edit section
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 px-4 py-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="grid grid-cols-[130px_1fr] items-center gap-2">
            <span className="text-xxs font-bold uppercase text-gray-500">{f.label}</span>
            {editing ? (
              f.type === 'select' ? (
                <select
                  className="pf-input"
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                >
                  {f.options!.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="pf-input"
                  type={f.type ?? 'text'}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              )
            ) : (
              <span>
                {f.type === 'date' ? fmtDate(p[f.key]) : (p[f.key] ?? '--') || '--'}
              </span>
            )}
          </div>
        ))}
        {section === 'patient' && !editing && (
          <div className="grid grid-cols-[130px_1fr] items-center gap-2">
            <span className="text-xxs font-bold uppercase text-gray-500">Record number</span>
            <span>{summary.patient.prn}</span>
          </div>
        )}
      </div>
      {reminders && (
        <div className="border-t border-pf-border px-4 py-4">
          <h3 className="mb-2 font-bold">Appointment reminders and messaging</h3>
          <p className="mb-2 text-pf-muted">
            <span className="text-pf-orange">⚠</span> Practice setting is OFF, Reminders
            will not send.
          </p>
          <label className="flex items-center gap-2 py-1">
            <button
              role="switch"
              aria-checked={emailOn}
              onClick={() => setEmailOn((v) => !v)}
              className={`h-5 w-10 rounded-full px-0.5 text-left transition-colors ${emailOn ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white transition-transform ${emailOn ? 'translate-x-5' : ''}`}
              />
            </button>
            Email reminders and messaging
          </label>
          <label className="flex items-center gap-2 py-1">
            <button
              role="switch"
              aria-checked={textOn}
              onClick={() => setTextOn((v) => !v)}
              className={`h-5 w-10 rounded-full px-0.5 text-left transition-colors ${textOn ? 'bg-green-600' : 'bg-gray-300'}`}
            >
              <span
                className={`block h-4 w-4 rounded-full bg-white transition-transform ${textOn ? 'translate-x-5' : ''}`}
              />
            </button>
            Text / SMS reminders and messaging
          </label>
        </div>
      )}
    </section>
  )
}

export default function Profile() {
  const [notes, setNotes] = useState('')

  return (
    <div className="flex h-full gap-2 overflow-y-auto p-4">
      <div className="flex-1 space-y-4">
        <EditableSection title="Patient" section="patient" />
        <EditableSection title="Contact" section="contact" reminders />
        <EditableSection title="Address" section="address" />
        <EditableSection title="Insurance & eligibility" section="insurance" />
        <EditableSection title="Guarantor" section="guarantor" />
      </div>
      <div className="hidden w-72 shrink-0 lg:block">
        <div className="pf-card p-4">
          <h3 className="font-bold">
            ✦ Pinned note <span className="pf-link">⊕</span>
          </h3>
          <p className="mt-1 text-pf-muted">No pinned note for this patient</p>
          <h3 className="mt-4 font-bold">Notes</h3>
          <textarea
            className="pf-input mt-2 h-64 w-full resize-none"
            maxLength={2000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="text-right text-xxs text-pf-muted">{notes.length}/2000</div>
        </div>
      </div>
      <AdRail variant="imaging" />
    </div>
  )
}
