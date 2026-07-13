import { useNavigate, useOutletContext } from 'react-router-dom'
import { ChevronDown, Lock, PlusCircle, Printer } from 'lucide-react'

import { useCreateEncounter } from '../../api/hooks'
import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'
import { fmtDate, fmtDateShort, toISODate } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

function Card({
  title,
  children,
  printable = true,
  addable = false,
}: {
  title: string
  children: React.ReactNode
  printable?: boolean
  addable?: boolean
}) {
  const toast = useToast()
  return (
    <section className="pf-card p-4">
      <h2 className="mb-2 flex items-center gap-2 text-[16px] font-bold">
        {title}
        {addable && (
          <button
            className="text-pf-link"
            onClick={() => toast('Adding records is not part of this demo')}
            aria-label={`Add to ${title}`}
          >
            <PlusCircle size={15} />
          </button>
        )}
        {printable && (
          <button
            className="text-pf-link"
            onClick={() => toast('Printing is not available in this demo')}
            aria-label={`Print ${title}`}
          >
            <Printer size={15} />
          </button>
        )}
      </h2>
      {children}
    </section>
  )
}

export default function Summary() {
  const { summary } = useOutletContext<ChartContext>()
  const navigate = useNavigate()
  const toast = useToast()
  const createEncounter = useCreateEncounter()

  const p = summary.patient
  const chronic = summary.diagnoses.filter((d) => d.is_chronic)
  const other = summary.diagnoses.filter((d) => !d.is_chronic)
  const activeMeds = summary.medications.filter((m) => m.status === 'active')
  const historicalMeds = summary.medications.filter((m) => m.status !== 'active')
  const drugAllergies = summary.allergies.filter((a) => a.category === 'drug')
  const foodAllergies = summary.allergies.filter((a) => a.category === 'food')
  const envAllergies = summary.allergies.filter((a) => a.category === 'environmental')

  function newEncounter() {
    createEncounter.mutate(
      { patient_id: p.id, date: toISODate(new Date()) },
      {
        onSuccess: (enc) => {
          toast('New encounter created', 'success')
          navigate(`/charts/patients/${p.id}/encounter/${enc.id}`)
        },
        onError: (err) => toast(err.message, 'error'),
      },
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar under tabs */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <button
          className="pf-link flex items-center gap-1 font-semibold"
          onClick={() => toast('Display settings are not part of this demo')}
        >
          ⚙ Display settings
        </button>
        <select className="pf-input w-40" defaultValue="">
          <option value="" disabled>
            Go to...
          </option>
          <option>Diagnoses</option>
          <option>Medications</option>
          <option>Allergies</option>
          <option>Encounters</option>
        </select>
        <div className="flex-1" />
        <button
          className="btn-blue-outline"
          onClick={() => toast('Printing is not available in this demo')}
        >
          Print chart
        </button>
        <span className="flex">
          <button className="btn-orange rounded-r-none" onClick={newEncounter}>
            New encounter
          </button>
          <button
            className="btn-orange rounded-l-none border-l border-white/40 !px-2"
            onClick={newEncounter}
            aria-label="New encounter options"
          >
            <ChevronDown size={14} />
          </button>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto p-4">
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-4">
            <Card title="Flowsheets" addable>
              <div className="font-bold">Practice</div>
              <ul className="ml-5 list-disc">
                <li>
                  <span className="pf-link">Vitals</span>
                </li>
              </ul>
            </Card>
            <Card title="Launch SMART app" printable={false}>
              <p>
                <span className="pf-link">Go to the app marketplace</span> to enable
                more applications for SMART launch.
              </p>
            </Card>
            <Card title="Diagnoses" addable>
              {chronic.length > 0 && (
                <>
                  <div className="font-bold">Chronic</div>
                  <ul className="ml-5 list-disc space-y-1">
                    {chronic.map((d) => (
                      <li key={d.id}>
                        <span className="pf-link">
                          ({d.icd10}) {d.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {other.length > 0 && (
                <>
                  <div className="mt-2 font-bold">Other</div>
                  <ul className="ml-5 list-disc space-y-1">
                    {other.map((d) => (
                      <li key={d.id}>
                        <span className="pf-link">
                          ({d.icd10}) {d.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {summary.diagnoses.length === 0 && (
                <p className="text-pf-muted">No diagnoses recorded</p>
              )}
            </Card>
            <Card title="Patient risk score" addable>
              <p className="text-pf-muted">No patient risk score recorded</p>
            </Card>
            <Card title="Social history">
              <div className="font-bold">Tobacco use</div>
              <p className="text-pf-muted">No tobacco use recorded</p>
              <div className="mt-2 font-bold">Social history (free text)</div>
              <p className="text-pf-muted">No social history recorded</p>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <Card title="Allergies" addable>
              <div className="font-bold">Drug</div>
              {drugAllergies.length === 0 ? (
                <label className="flex items-center gap-2">
                  <input type="checkbox" readOnly checked={false} />
                  Patient has no known drug allergies
                </label>
              ) : (
                <ul className="ml-5 list-disc">
                  {drugAllergies.map((a) => (
                    <li key={a.id}>
                      <span className="pf-link">{a.substance}</span>
                      {a.reaction ? ` — ${a.reaction}` : ''}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 font-bold">Food</div>
              {foodAllergies.length === 0 ? (
                <p className="text-pf-muted">No food allergies recorded</p>
              ) : (
                <ul className="ml-5 list-disc">
                  {foodAllergies.map((a) => (
                    <li key={a.id}>
                      {a.substance}
                      {a.reaction ? ` — ${a.reaction}` : ''}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 font-bold">Environmental</div>
              {envAllergies.length === 0 ? (
                <p className="text-pf-muted">No environmental allergies recorded</p>
              ) : (
                <ul className="ml-5 list-disc">
                  {envAllergies.map((a) => (
                    <li key={a.id}>
                      {a.substance}
                      {a.reaction ? ` — ${a.reaction}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Medications" printable={false}>
              <div className="-mt-1 mb-2 space-x-3 text-[13px]">
                <span className="pf-link font-semibold">Record</span>
                <span className="pf-link font-semibold">Prescribe</span>
              </div>
              <div className="font-bold">
                Patient Medications ({activeMeds.length})
              </div>
              <ul className="ml-5 list-disc space-y-2">
                {activeMeds.map((m) => (
                  <li key={m.id}>
                    <span className="pf-link">{m.name}</span>
                    {m.start_date && (
                      <div className="text-pf-muted">Start: {fmtDate(m.start_date)}</div>
                    )}
                  </li>
                ))}
              </ul>
              {activeMeds.length === 0 && (
                <p className="text-pf-muted">No active medications</p>
              )}
              {historicalMeds.length > 0 && (
                <p className="pf-link mt-2">Show historical ({historicalMeds.length})</p>
              )}
            </Card>
            <Card title="Screenings/ Interventions/ Assessments">
              <p className="text-pf-muted">
                No screening/interventions/assessments on signed encounters for this
                patient. <span className="pf-link">Learn more</span>
              </p>
            </Card>
            <Card title="Implantable devices" addable>
              <label className="flex items-center gap-2">
                <input type="checkbox" readOnly checked={false} />
                Patient has no implantable device
              </label>
            </Card>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <Card title="Health concerns" addable>
              <p className="pf-link">⊕ Add a health concern note</p>
              <label className="mt-1 flex items-center gap-2">
                <input type="checkbox" readOnly checked={false} />
                Patient has no health concerns
              </label>
            </Card>
            <Card title="Goals" addable>
              <p className="text-pf-muted">No patient goals recorded</p>
            </Card>
            <Card title="Encounters" printable={false}>
              <ul className="space-y-3">
                {summary.encounters.map((e) => (
                  <li key={e.id} className="ml-5 list-disc">
                    <button
                      className="pf-link font-semibold"
                      onClick={() =>
                        navigate(`/charts/patients/${p.id}/encounter/${e.id}`)
                      }
                    >
                      {fmtDate(e.date)}
                    </button>
                    <span className="ml-2 font-bold">185349003 (SNOMED-CT)</span>
                    <div>
                      {e.type} ({e.note_type}){' '}
                      {e.status === 'Signed' && (
                        <Lock size={12} className="inline text-pf-link" />
                      )}
                    </div>
                    <div>CC: {e.chief_complaint || '--'}</div>
                  </li>
                ))}
                {summary.encounters.length === 0 && (
                  <p className="text-pf-muted">No encounters recorded</p>
                )}
              </ul>
            </Card>
            <Card title="Documents" printable={false}>
              {summary.documents.length === 0 ? (
                <p className="text-pf-muted">No documents</p>
              ) : (
                <ul className="ml-5 list-disc space-y-1">
                  {summary.documents.slice(0, 5).map((d) => (
                    <li key={d.id}>
                      <span className="pf-link">{d.title}</span>{' '}
                      <span className="text-pf-muted">{fmtDateShort(d.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
        <AdRail variant="imaging" />
      </div>
    </div>
  )
}
