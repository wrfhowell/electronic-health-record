import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User } from 'lucide-react'

import { usePatients, useCreatePatient, useAppointments } from '../../api/hooks'
import type { Patient } from '../../api/types'
import AdRail from '../../components/AdRail'
import Modal from '../../components/Modal'
import { useToast } from '../../components/Toast'
import { useChartTabs } from '../../lib/chartTabs'
import { fmtAccessed, fmtDob, toISODate } from '../../lib/format'

type SortKey = 'first' | 'last' | 'dob' | 'accessed'

function AddPatientModal({ onClose }: { onClose: () => void }) {
  const create = useCreatePatient()
  const toast = useToast()
  const navigate = useNavigate()
  const { openTab } = useChartTabs()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    sex: 'Male',
    phone_mobile: '',
    email: '',
  })
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim() || !form.dob) {
      setError('First name, last name and date of birth are required.')
      return
    }
    create.mutate(
      { ...form },
      {
        onSuccess: (p) => {
          toast(`Patient ${p.first_name} ${p.last_name} added`, 'success')
          openTab({ patientId: p.id, name: `${p.first_name} ${p.last_name}` })
          onClose()
          navigate(`/charts/patients/${p.id}/summary`)
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <Modal
      title="Add patient"
      onClose={onClose}
      footer={
        <>
          <button className="btn-blue-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-orange" form="add-patient-form" type="submit">
            Save
          </button>
        </>
      }
    >
      <form id="add-patient-form" onSubmit={submit} className="space-y-4 p-4">
        {error && (
          <div className="border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="pf-label req">First name</label>
            <input
              className="pf-input w-full"
              value={form.first_name}
              onChange={(e) => set('first_name', e.target.value)}
            />
          </div>
          <div>
            <label className="pf-label req">Last name</label>
            <input
              className="pf-input w-full"
              value={form.last_name}
              onChange={(e) => set('last_name', e.target.value)}
            />
          </div>
          <div>
            <label className="pf-label req">Date of birth</label>
            <input
              type="date"
              className="pf-input w-full"
              value={form.dob}
              onChange={(e) => set('dob', e.target.value)}
            />
          </div>
          <div>
            <label className="pf-label req">Sex</label>
            <select
              className="pf-input w-full"
              value={form.sex}
              onChange={(e) => set('sex', e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Unknown</option>
            </select>
          </div>
          <div>
            <label className="pf-label">Mobile phone</label>
            <input
              className="pf-input w-full"
              value={form.phone_mobile}
              onChange={(e) => set('phone_mobile', e.target.value)}
            />
          </div>
          <div>
            <label className="pf-label">Email</label>
            <input
              className="pf-input w-full"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default function PatientLists() {
  const [mode, setMode] = useState<'recent' | 'scheduled'>('recent')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('accessed')
  const [sortAsc, setSortAsc] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const navigate = useNavigate()
  const { openTab } = useChartTabs()

  const { data: patients, isLoading } = usePatients(search || undefined)
  const today = toISODate(new Date())
  const { data: todaysAppts } = useAppointments(today, today)

  const sorted = useMemo(() => {
    const list = [...(patients ?? [])]
    const dir = sortAsc ? 1 : -1
    list.sort((a, b) => {
      switch (sortKey) {
        case 'first':
          return dir * a.first_name.localeCompare(b.first_name)
        case 'last':
          return dir * a.last_name.localeCompare(b.last_name)
        case 'dob':
          return dir * a.dob.localeCompare(b.dob)
        default:
          return dir * (a.last_accessed_at ?? '').localeCompare(b.last_accessed_at ?? '')
      }
    })
    return list
  }, [patients, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  function openChart(p: Patient) {
    openTab({ patientId: p.id, name: `${p.first_name} ${p.last_name}` })
    navigate(`/charts/patients/${p.id}/summary`)
  }

  const scheduled = (todaysAppts ?? []).filter((a) => !a.is_block && a.patient)

  const title =
    mode === 'recent'
      ? `${sorted.length} recent patient${sorted.length === 1 ? '' : 's'}`
      : new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : ''

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 bg-pf-band px-5 py-4">
        <h1 className="text-[26px] font-light text-white">{title}</h1>
      </div>

      {/* Filter row */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <div className="flex w-48 items-center rounded-sm border border-gray-400">
          <input className="min-w-0 flex-1 px-2 py-1 focus:outline-none" placeholder="All providers" />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>
        <div className="flex overflow-hidden rounded-sm border border-pf-link">
          <button
            className={`px-3 py-1 font-bold ${mode === 'scheduled' ? 'bg-white text-pf-link' : 'bg-white text-pf-link/70'} ${mode === 'scheduled' ? 'bg-blue-50' : ''}`}
            onClick={() => setMode('scheduled')}
          >
            Scheduled
          </button>
          <button
            className={`border-l border-pf-link px-3 py-1 font-bold ${mode === 'recent' ? 'bg-blue-100 text-pf-link' : 'text-pf-link/70'}`}
            onClick={() => setMode('recent')}
          >
            Recent
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-[13px]">
          <input type="checkbox" /> Show inactive
        </label>
        <div className="relative w-64">
          <div className="flex items-center rounded-sm border border-gray-400">
            <input
              className="min-w-0 flex-1 px-2 py-1 focus:outline-none"
              placeholder="Search all patients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            />
            <Search size={14} className="mx-2 text-gray-500" />
          </div>
          {searchFocused && !search && (
            <div className="absolute left-0 top-full z-20 w-56 border border-gray-300 bg-white shadow-lg">
              <div className="grid grid-cols-[86px_1fr] gap-y-2 px-3 py-3 text-[13px]">
                <span className="pr-2 text-right text-gray-600">Name:</span>
                <span>First Last</span>
                <span className="pr-2 text-right text-gray-600">Phone:</span>
                <span>123-456-7890</span>
                <span className="pr-2 text-right text-gray-600">DOB:</span>
                <span>MM/DD/YYYY</span>
                <span className="pr-2 text-right text-gray-600">Last 4 SSN:</span>
                <span className="text-gray-400">###-## ####</span>
                <span className="pr-2 text-right text-gray-600">PRN:</span>
                <span>AA123456</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button className="btn-orange" onClick={() => setShowAdd(true)}>
          Add patient
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto">
        <div className="flex-1">
          {mode === 'recent' ? (
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                  <th className="w-12 px-3 py-2" />
                  <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('first')}>
                    First{arrow('first')}
                  </th>
                  <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('last')}>
                    Last{arrow('last')}
                  </th>
                  <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('dob')}>
                    DOB{arrow('dob')}
                  </th>
                  <th className="px-3 py-2">Contact info</th>
                  <th className="cursor-pointer px-3 py-2" onClick={() => toggleSort('accessed')}>
                    Accessed{arrow('accessed')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer border-b border-pf-border hover:bg-blue-50"
                    onClick={() => openChart(p)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-400 text-white">
                        <User size={20} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="pf-link font-semibold">{p.first_name}</span>
                      <div className="text-xxs text-pf-muted">PRN {p.prn}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="pf-link font-semibold">{p.last_name}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {fmtDob(p.dob)}
                      <div className="text-pf-muted">{p.sex}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div>
                        {p.address_street ? `${p.address_street}, ` : ''}
                        {p.address_city ? `${p.address_city}, ` : ''}
                        {p.address_state ?? ''} {p.address_zip ?? ''}
                      </div>
                      <div className="text-pf-muted">
                        {p.phone_mobile && (
                          <span className="mr-3">
                            <span className="text-gray-400">M</span> {p.phone_mobile}
                          </span>
                        )}
                        {p.phone_home && (
                          <span>
                            <span className="text-gray-400">H</span> {p.phone_home}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{fmtAccessed(p.last_accessed_at)}</td>
                  </tr>
                ))}
                {!isLoading && sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-pf-muted">
                      No patients match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                  <th className="w-12 px-3 py-2" />
                  <th className="px-3 py-2">First</th>
                  <th className="px-3 py-2">Last</th>
                  <th className="px-3 py-2">DOB</th>
                  <th className="px-3 py-2">Contact info</th>
                  <th className="px-3 py-2">Appt/Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduled.map((a) => (
                  <tr
                    key={a.id}
                    className="cursor-pointer border-b border-pf-border hover:bg-blue-50"
                    onClick={() => a.patient && openChart(a.patient)}
                  >
                    <td className="px-3 py-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-400 text-white">
                        <User size={20} />
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="pf-link font-semibold">{a.patient!.first_name}</span>
                      <div className="text-xxs text-pf-muted">PRN {a.patient!.prn}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="pf-link font-semibold">{a.patient!.last_name}</span>
                    </td>
                    <td className="px-3 py-2.5">{fmtDob(a.patient!.dob)}</td>
                    <td className="px-3 py-2.5 text-pf-muted">
                      {a.patient!.phone_mobile ?? '--'}
                    </td>
                    <td className="px-3 py-2.5">
                      {a.start_time} · {a.status}
                    </td>
                  </tr>
                ))}
                {scheduled.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-pf-muted">
                      None Scheduled
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <AdRail variant="staffing" />
      </div>

      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
