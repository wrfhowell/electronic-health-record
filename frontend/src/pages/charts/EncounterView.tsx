import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  AlignLeft,
  AlignRight,
  Bold,
  ChevronRight,
  Italic,
  List,
  ListOrdered,
  Lock,
  RotateCcw,
  X,
} from 'lucide-react'

import {
  useEncounter,
  useSaveVitals,
  useSignEncounter,
  useUpdateEncounter,
} from '../../api/hooks'
import type { Vitals } from '../../api/types'
import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'
import { fmtDate, fmtDateShort } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

const CDS_NOTIFICATIONS = [
  'Blood Pressure Control: Patient is diagnosed with hypertension and either is due for a blood pressure screening or most recent blood pressure reading is elevated.',
  'Screening: Clinical depression screen indicated (document follow-up plan if positive).',
  'Clinical Documentation: Confirm documentation of current medication list.',
  'Clinical Documentation: Current medication allergies not documented.',
]

const VITAL_ROWS: {
  key: keyof Omit<Vitals, 'id' | 'encounter_id'>
  label: string
  unit: string
  readOnly?: boolean
}[] = [
  { key: 'height_in', label: 'Height', unit: 'in' },
  { key: 'weight_lb', label: 'Weight', unit: 'lb' },
  { key: 'bmi', label: 'BMI', unit: '', readOnly: true },
  { key: 'bp_systolic', label: 'BP Systolic', unit: 'mmHg' },
  { key: 'bp_diastolic', label: 'BP Diastolic', unit: 'mmHg' },
  { key: 'temp_f', label: 'Temperature', unit: '°F' },
  { key: 'pulse', label: 'Pulse', unit: 'bpm' },
  { key: 'resp_rate', label: 'Respiratory rate', unit: 'bpm' },
  { key: 'o2_sat', label: 'O2 Saturation', unit: '%' },
  { key: 'pain', label: 'Pain', unit: '' },
]

function FormatToolbar() {
  const toast = useToast()
  const cosmetic = () => toast('Formatting is cosmetic in this demo')
  return (
    <div className="flex items-center gap-1 border border-gray-300 bg-[#f4f4f4] px-2 py-1">
      <select className="pf-input !py-0.5 text-xxs" onChange={cosmetic}>
        <option>P</option>
        <option>H1</option>
        <option>H2</option>
      </select>
      {[Bold, Italic, List, ListOrdered, AlignLeft, AlignRight, RotateCcw].map(
        (Icon, i) => (
          <button
            key={i}
            className="rounded p-1 text-gray-600 hover:bg-gray-200"
            onClick={cosmetic}
            type="button"
          >
            <Icon size={14} />
          </button>
        ),
      )}
      <button
        type="button"
        className="ml-2 rounded border border-gray-400 bg-white px-2 py-0.5 text-xxs"
        onClick={cosmetic}
      >
        Add patient info ▾
      </button>
    </div>
  )
}

interface SoapSectionProps {
  title: string
  value: string
  onChange: (v: string) => void
  readOnly: boolean
}

function SoapSection({ title, value, onChange, readOnly }: SoapSectionProps) {
  return (
    <section className="pf-card p-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[16px] font-bold">{title}</h3>
        {!readOnly && (
          <>
            <span className="pf-link text-[13px]">View templates</span>
            <span className="pf-link text-[13px]">Import past encounter</span>
          </>
        )}
        <span className="flex-1" />
        <span className="pf-link text-[13px]">Minimize</span>
      </div>
      <div className="mt-2">
        {!readOnly && <FormatToolbar />}
        <textarea
          className={`w-full border border-gray-300 p-3 text-[13px] leading-relaxed focus:outline-none focus:border-pf-blue ${
            readOnly ? 'bg-gray-50 text-gray-700' : 'bg-white'
          }`}
          rows={6}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </section>
  )
}

export default function EncounterView() {
  const { encId } = useParams()
  const encounterId = Number(encId)
  const { summary } = useOutletContext<ChartContext>()
  const { data: enc, isLoading } = useEncounter(encounterId)
  const update = useUpdateEncounter(encounterId)
  const sign = useSignEncounter(encounterId)
  const saveVitals = useSaveVitals(encounterId, summary.patient.id)
  const toast = useToast()

  const [dismissed, setDismissed] = useState<number[]>([])
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan_note: '' })
  const [vitalsDraft, setVitalsDraft] = useState<Record<string, string>>({})
  const [confirmSign, setConfirmSign] = useState(false)

  useEffect(() => {
    if (enc) {
      setChiefComplaint(enc.chief_complaint ?? '')
      setSoap({
        subjective: enc.subjective ?? '',
        objective: enc.objective ?? '',
        assessment: enc.assessment ?? '',
        plan_note: enc.plan_note ?? '',
      })
      const v: Record<string, string> = {}
      for (const row of VITAL_ROWS) {
        const val = enc.vitals?.[row.key]
        v[row.key] = val === null || val === undefined ? '' : String(val)
      }
      setVitalsDraft(v)
    }
  }, [enc])

  // Vitals columns: other encounters' vitals (by date), current encounter last.
  const historyCols = useMemo(
    () =>
      summary.encounters
        .filter((e) => e.id !== encounterId && e.vitals)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [summary.encounters, encounterId],
  )

  if (isLoading || !enc) return <div className="p-8 text-pf-muted">Loading encounter…</div>

  const signed = enc.status === 'Signed'
  const chronic = summary.diagnoses.filter((d) => d.is_chronic)
  const activeMeds = summary.medications.filter((m) => m.status === 'active')

  function saveAll(showToast = true) {
    update.mutate(
      { chief_complaint: chiefComplaint || null, ...soap },
      {
        onSuccess: () => showToast && toast('Encounter saved', 'success'),
        onError: (err) => toast(err.message, 'error'),
      },
    )
    const payload: Record<string, number | null> = {}
    let any = false
    for (const row of VITAL_ROWS) {
      if (row.readOnly) continue
      const raw = vitalsDraft[row.key]
      payload[row.key] = raw === '' || raw === undefined ? null : Number(raw)
      if (payload[row.key] !== null) any = true
    }
    if (any || enc!.vitals) {
      saveVitals.mutate(payload, {
        onError: (err) => toast(`Vitals: ${err.message}`, 'error'),
      })
    }
  }

  function doSign() {
    if (!chiefComplaint.trim()) {
      toast('Chief complaint is required before signing', 'error')
      return
    }
    setConfirmSign(true)
  }

  async function confirmDoSign() {
    setConfirmSign(false)
    // Persist latest edits (note + vitals) before signing locks the encounter.
    try {
      const payload: Record<string, number | null> = {}
      let any = false
      for (const row of VITAL_ROWS) {
        if (row.readOnly) continue
        const raw = vitalsDraft[row.key]
        payload[row.key] = raw === '' || raw === undefined ? null : Number(raw)
        if (payload[row.key] !== null) any = true
      }
      if (any || enc!.vitals) await saveVitals.mutateAsync(payload)
      await update.mutateAsync({ chief_complaint: chiefComplaint || null, ...soap })
      await sign.mutateAsync()
      toast('Encounter signed', 'success')
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  const visibleCds = signed
    ? []
    : CDS_NOTIFICATIONS.filter((_, i) => !dismissed.includes(i))

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <span className="pf-link font-semibold">⚙ Display settings</span>
        <span className="text-xxs uppercase text-gray-500">
          Last refreshed
          <br />
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
        <select className="pf-input w-28" defaultValue="">
          <option value="" disabled>
            Go to...
          </option>
          <option>Vitals</option>
          <option>Note</option>
        </select>
        <div className="flex-1" />
        <button
          className="btn-blue-outline"
          onClick={() => toast('Printing is not available in this demo')}
        >
          Print
        </button>
        {!signed && (
          <>
            <button className="btn-blue-outline" onClick={() => saveAll()}>
              Save
            </button>
            <button className="btn-orange" onClick={doSign} disabled={sign.isPending}>
              Sign
            </button>
          </>
        )}
        {signed && (
          <span className="flex items-center gap-1.5 font-bold text-gray-600">
            <Lock size={14} /> Signed {enc.signed_at ? fmtDate(enc.signed_at.slice(0, 10)) : ''}
          </span>
        )}
      </div>

      {/* CDS banners */}
      {visibleCds.length > 0 && (
        <div className="shrink-0 border-b border-yellow-200 bg-[#fffbe6] px-4 py-1.5 text-[13px]">
          <span className="pf-link">Refresh</span> to update clinical decision support
          (CDS) notifications below.
        </div>
      )}
      {visibleCds.map((text) => {
        const idx = CDS_NOTIFICATIONS.indexOf(text)
        return (
          <div
            key={idx}
            className="flex shrink-0 items-start gap-2 border-b border-yellow-200 bg-[#fdf6d8] px-4 py-2 text-[13px]"
          >
            <ChevronRight size={14} className="mt-0.5 shrink-0 text-gray-500" />
            <span className="flex-1">{text}</span>
            <button
              className="pf-link shrink-0 font-semibold"
              onClick={() => {
                setDismissed((d) => [...d, idx])
                toast('Marked as complete')
              }}
            >
              Mark as complete
            </button>
            <button
              className="shrink-0 text-gray-500 hover:text-gray-800"
              onClick={() => setDismissed((d) => [...d, idx])}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto p-4">
        {/* Left mini column */}
        <div className="hidden w-64 shrink-0 space-y-4 lg:block">
          <section className="pf-card p-4">
            <h3 className="font-bold">Diagnoses ⊕</h3>
            <div className="mt-1 font-bold">Chronic</div>
            <ul className="ml-5 list-disc space-y-1">
              {chronic.map((d) => (
                <li key={d.id}>
                  <span className="pf-link">
                    ({d.icd10}) {d.description}
                  </span>
                </li>
              ))}
              {chronic.length === 0 && (
                <p className="text-pf-muted">No chronic diagnoses</p>
              )}
            </ul>
          </section>
          <section className="pf-card p-4">
            <h3 className="font-bold">Patient risk score ⊕</h3>
            <p className="mt-1 text-pf-muted">No patient risk score recorded</p>
          </section>
          <section className="pf-card p-4">
            <h3 className="font-bold">Social history</h3>
            <div className="mt-1 font-bold">Tobacco use ⊕</div>
            <p className="text-pf-muted">No tobacco use recorded</p>
          </section>
        </div>

        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* Encounter details */}
          <section className="pf-card p-4">
            <h3 className="text-[16px] font-bold">Encounter details</h3>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
              <div>
                <label className="pf-label req">Encounter type</label>
                <select className="pf-input w-full" value={enc.type} disabled={signed}
                  onChange={(e) => update.mutate({ type: e.target.value })}
                >
                  <option>Office Visit</option>
                  <option>Home Visit</option>
                  <option>Telemedicine Visit</option>
                </select>
              </div>
              <div>
                <label className="pf-label req">Note type</label>
                <select className="pf-input w-full" value={enc.note_type} disabled={signed}
                  onChange={(e) => update.mutate({ note_type: e.target.value })}
                >
                  <option>SOAP Note</option>
                  <option>Patient Phone Message</option>
                  <option>Simple Note</option>
                </select>
              </div>
              <div>
                <label className="pf-label req">Date of service</label>
                <input
                  type="date"
                  className="pf-input w-full"
                  value={enc.date}
                  disabled={signed}
                  onChange={(e) => e.target.value && update.mutate({ date: e.target.value })}
                />
              </div>
              <div>
                <label className="pf-label req">Facility</label>
                <select className="pf-input w-full" disabled>
                  <option>Will Demo Pra...</option>
                </select>
              </div>
              <div>
                <label className="pf-label">Status</label>
                <span className={signed ? 'font-bold' : ''}>{enc.status}</span>
              </div>
              <div>
                <label className="pf-label">Self-pay restriction</label>
                <span>
                  Unknown <span className="pf-link">✎ Edit</span>
                </span>
              </div>
              <div className="col-span-2">
                <label className="pf-label">Appointment</label>
                <select className="pf-input w-full" disabled>
                  <option>No qualifying appointment to select</option>
                </select>
              </div>
            </div>
          </section>

          {/* Chief complaint */}
          <section className="pf-card p-4">
            <h3 className="text-[16px] font-bold">Chief complaint</h3>
            <textarea
              className={`mt-2 w-full border border-gray-300 p-2 focus:outline-none focus:border-pf-blue ${
                signed ? 'bg-gray-50' : 'bg-white'
              }`}
              rows={2}
              value={chiefComplaint}
              readOnly={signed}
              onChange={(e) => setChiefComplaint(e.target.value)}
            />
          </section>

          {/* Health concerns */}
          <section className="pf-card p-4">
            <h3 className="flex items-center gap-3 text-[16px] font-bold">
              Health concerns <span className="pf-link text-[13px] font-semibold">⊕ Add</span>
              <span className="flex-1" />
              <span className="pf-link text-[13px] font-semibold">Minimize</span>
            </h3>
            <textarea
              className="mt-2 w-full border border-gray-300 p-2"
              rows={3}
              placeholder="4000 characters maximum"
              readOnly={signed}
            />
          </section>

          {/* Vitals flowsheet */}
          <section className="pf-card p-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold">Flowsheets</h3>
              <span className="pf-link text-[13px] font-semibold">⊕ Add</span>
              <span className="text-[13px] text-pf-muted">US Customary ⓘ</span>
              <span className="pf-link text-[13px]">Show growth charts</span>
              <span className="flex-1" />
              <span className="pf-link text-[13px]">Minimize</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[13px]">
              <span className="font-bold">Vitals</span>
              <span className="pf-link">Add column</span>
              <span className="pf-link">Last 5 encounters or labs ▾</span>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[560px] border border-gray-300">
                <thead>
                  <tr className="bg-[#d9d9d9]">
                    <th className="w-44 border-r border-gray-300 px-3 py-2 text-left">
                      ▾ Vitals
                    </th>
                    {historyCols.map((e) => (
                      <th key={e.id} className="border-r border-gray-300 px-3 py-2 font-bold text-pf-link">
                        {fmtDateShort(e.date)}
                      </th>
                    ))}
                    <th className="border-b-2 border-pf-blue px-3 py-2 font-bold">
                      {fmtDateShort(enc.date)}
                      <div className="text-xxs font-normal text-gray-500">
                        {signed ? 'signed' : 'this visit'}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {VITAL_ROWS.map((row) => (
                    <tr key={row.key} className="border-t border-gray-200">
                      <td className="border-r border-gray-300 px-3 py-1.5">{row.label}</td>
                      {historyCols.map((e) => {
                        const v = e.vitals?.[row.key]
                        return (
                          <td key={e.id} className="border-r border-gray-200 px-3 py-1.5 text-center text-pf-link">
                            {v === null || v === undefined ? '' : `${v} ${row.unit}`.trim()}
                          </td>
                        )
                      })}
                      <td className="px-2 py-1 text-center">
                        {row.readOnly ? (
                          <span>
                            {(() => {
                              const h = Number(vitalsDraft.height_in)
                              const w = Number(vitalsDraft.weight_lb)
                              if (h > 0 && w > 0) return ((703 * w) / (h * h)).toFixed(2)
                              return enc.vitals?.bmi ?? ''
                            })()}
                          </span>
                        ) : signed ? (
                          <span>
                            {vitalsDraft[row.key]
                              ? `${vitalsDraft[row.key]} ${row.unit}`.trim()
                              : ''}
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1">
                            <input
                              className="pf-input w-16 text-center"
                              value={vitalsDraft[row.key] ?? ''}
                              onChange={(e) =>
                                setVitalsDraft((d) => ({ ...d, [row.key]: e.target.value }))
                              }
                            />
                            <span className="text-xxs text-gray-500">{row.unit}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Medications */}
          <section className="pf-card p-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold">Medications</h3>
              <span className="pf-link text-[13px] font-semibold">Record</span>
              <span className="pf-link text-[13px] font-semibold">Prescribe</span>
              <span className="flex-1" />
              <span className="pf-link text-[13px]">Minimize</span>
            </div>
            <div className="mt-2 text-xxs font-bold uppercase text-gray-500">
              Was medication reconciliation completed?
            </div>
            <select className="pf-input mt-1 w-56" disabled={signed}>
              <option>Select...</option>
              <option>Yes</option>
              <option>No</option>
            </select>
            <div className="mt-3 font-bold">Patient Medications ({activeMeds.length})</div>
            <table className="mt-1 w-full">
              <thead>
                <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                  <th className="px-3 py-2">Name ▲</th>
                  <th className="px-3 py-2">Sig</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">Prescriber</th>
                </tr>
              </thead>
              <tbody>
                {activeMeds.map((m) => (
                  <tr key={m.id} className="border-b border-pf-border align-top">
                    <td className="px-3 py-2.5">
                      <span className="pf-link font-semibold">{m.name}</span>
                    </td>
                    <td className="px-3 py-2.5">{m.sig ?? '--'}</td>
                    <td className="px-3 py-2.5">{fmtDateShort(m.start_date)}</td>
                    <td className="px-3 py-2.5">{m.prescriber ?? 'Will Demo'}</td>
                  </tr>
                ))}
                {activeMeds.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-pf-muted">
                      No active medications
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* SOAP note */}
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-bold">Note</h2>
            {!signed && <span className="pf-link">Import past encounter</span>}
          </div>
          <SoapSection
            title="Subjective"
            value={soap.subjective}
            onChange={(v) => setSoap((s) => ({ ...s, subjective: v }))}
            readOnly={signed}
          />
          <SoapSection
            title="Objective"
            value={soap.objective}
            onChange={(v) => setSoap((s) => ({ ...s, objective: v }))}
            readOnly={signed}
          />
          <SoapSection
            title="Assessment"
            value={soap.assessment}
            onChange={(v) => setSoap((s) => ({ ...s, assessment: v }))}
            readOnly={signed}
          />
          <SoapSection
            title="Plan"
            value={soap.plan_note}
            onChange={(v) => setSoap((s) => ({ ...s, plan_note: v }))}
            readOnly={signed}
          />
        </div>
        <AdRail variant="twitter" />
      </div>

      {/* Sign confirmation */}
      {confirmSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[420px] bg-white shadow-2xl">
            <div className="bg-pf-tab px-4 py-2.5 text-[15px] font-bold text-white">
              Sign encounter
            </div>
            <div className="p-5">
              Signing finalizes this encounter and makes the note read-only. Continue?
            </div>
            <div className="flex items-center justify-between border-t-2 border-pf-tab px-4 py-3">
              <button className="btn-blue-outline" onClick={() => setConfirmSign(false)}>
                Cancel
              </button>
              <button className="btn-orange" onClick={confirmDoSign}>
                Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
