import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import { ChevronDown, MoreHorizontal, User, X } from 'lucide-react'

import { useCreateEncounter, usePatientSummary } from '../../api/hooks'
import type { PatientSummary } from '../../api/types'
import { useToast } from '../../components/Toast'
import { useChartTabs } from '../../lib/chartTabs'
import { ageOf, fmtDate, toISODate } from '../../lib/format'

const TABS = [
  { to: 'summary', label: 'Summary' },
  { to: 'timeline', label: 'Timeline' },
  { to: 'documents', label: 'Documents' },
  { to: 'profile', label: 'Profile' },
  { to: 'payment', label: 'Payment collection' },
  { to: 'ledger', label: 'Patient ledger' },
]

export interface ChartContext {
  summary: PatientSummary
}

export default function ChartLayout() {
  const { id } = useParams()
  const patientId = Number(id)
  const { data: summary, isLoading } = usePatientSummary(patientId)
  const { openTab } = useChartTabs()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const createEncounter = useCreateEncounter()
  const [actionsOpen, setActionsOpen] = useState(false)

  // Encounter "date tabs" opened during this session, newest last.
  const [openEncounters, setOpenEncounters] = useState<number[]>([])
  const encMatch = location.pathname.match(/\/encounter\/(\d+)/)
  const activeEncId = encMatch ? Number(encMatch[1]) : null

  useEffect(() => {
    if (activeEncId && !openEncounters.includes(activeEncId)) {
      setOpenEncounters((prev) => [...prev, activeEncId])
    }
  }, [activeEncId, openEncounters])

  useEffect(() => {
    if (summary) {
      openTab({
        patientId,
        name: `${summary.patient.first_name} ${summary.patient.last_name}`,
      })
    }
  }, [summary, patientId, openTab])

  if (isLoading || !summary) {
    return <div className="p-8 text-pf-muted">Loading chart…</div>
  }

  const p = summary.patient

  function newEncounter() {
    createEncounter.mutate(
      { patient_id: patientId, date: toISODate(new Date()) },
      {
        onSuccess: (enc) => {
          toast('New encounter created', 'success')
          navigate(`/charts/patients/${patientId}/encounter/${enc.id}`)
        },
        onError: (err) => toast(err.message, 'error'),
      },
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chart header */}
      <div className="flex shrink-0 items-center gap-3 bg-pf-band px-4 pt-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-500">
          <User size={24} />
        </span>
        <h1 className="text-[19px] font-bold text-white">
          {p.first_name} {p.last_name}
        </h1>
        <span className="text-white/80">
          <span className="font-bold text-white">PRN:</span> {p.prn}
        </span>
        <span className="border-l border-white/40 pl-3 text-white">
          {ageOf(p.dob)} yrs {p.sex[0]}
        </span>
        <button
          className="text-white/80 hover:text-white"
          onClick={() => toast('No additional info in this demo')}
        >
          <MoreHorizontal size={18} />
        </button>
        <div className="flex-1" />
        <div className="relative pb-1">
          <button
            className="btn-blue-outline flex items-center gap-1 !py-1"
            onClick={() => setActionsOpen((v) => !v)}
          >
            Actions <ChevronDown size={14} />
          </button>
          {actionsOpen && (
            <div className="absolute right-0 top-full z-30 w-48 border border-gray-300 bg-white shadow-lg">
              <button
                className="block w-full px-3 py-2 text-left hover:bg-blue-50"
                onClick={() => {
                  setActionsOpen(false)
                  newEncounter()
                }}
              >
                New encounter
              </button>
              <button
                className="block w-full px-3 py-2 text-left hover:bg-blue-50"
                onClick={() => {
                  setActionsOpen(false)
                  navigate(`/charts/patients/${patientId}/profile`)
                }}
              >
                Edit profile
              </button>
              <button
                className="block w-full px-3 py-2 text-left hover:bg-blue-50"
                onClick={() => {
                  setActionsOpen(false)
                  toast('Printing is not available in this demo')
                }}
              >
                Print chart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Blue tab row */}
      <div className="flex shrink-0 items-end gap-1 bg-pf-band px-4 pt-2">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-1.5 text-[13px] font-bold ${
                isActive
                  ? 'bg-white text-pf-text'
                  : 'bg-pf-tab text-white hover:brightness-110'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
        {openEncounters.map((encId) => {
          const enc = summary.encounters.find((e) => e.id === encId)
          const label = enc ? fmtDate(enc.date) : `#${encId}`
          const active = activeEncId === encId
          return (
            <span
              key={encId}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold ${
                active ? 'bg-white text-pf-text' : 'bg-pf-tab text-white hover:brightness-110'
              }`}
            >
              <NavLink to={`encounter/${encId}`}>{label}</NavLink>
              <button
                aria-label="Close encounter tab"
                onClick={() => {
                  setOpenEncounters((prev) => prev.filter((x) => x !== encId))
                  if (active) navigate(`/charts/patients/${patientId}/summary`)
                }}
              >
                <X size={12} />
              </button>
            </span>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet context={{ summary } satisfies ChartContext} />
      </div>
    </div>
  )
}
