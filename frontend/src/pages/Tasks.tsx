import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, MoreHorizontal, Search, Wrench } from 'lucide-react'

import { useCreateTask, useTasks, useUpdateTask } from '../api/hooks'
import type { Patient, Task } from '../api/types'
import AdRail from '../components/AdRail'
import Modal from '../components/Modal'
import PatientTypeahead from '../components/PatientTypeahead'
import { useToast } from '../components/Toast'
import { fmtDate, toISODate } from '../lib/format'
import { SESSION_USER } from '../lib/session'

const TABS = [
  'All tasks',
  'My tasks',
  'Unassigned tasks',
  'Rx change/cancel',
  'Lab results',
  'Refill requests',
  'Imaging results',
  'Prior Authorizations',
]

const TAB_TYPE: Record<string, string> = {
  'Rx change/cancel': 'Rx change/cancel',
  'Lab results': 'Lab results',
  'Refill requests': 'Refill request',
  'Imaging results': 'Imaging results',
  'Prior Authorizations': 'Prior Authorization',
}

const TASK_TYPES = [
  'Reminder',
  'Rx change/cancel',
  'Lab results',
  'Refill request',
  'Imaging results',
  'Prior Authorization',
]

function NewTaskModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTask()
  const toast = useToast()
  const [details, setDetails] = useState('')
  const [assignee, setAssignee] = useState('')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [reminderDate, setReminderDate] = useState(toISODate(new Date()))
  const [taskType, setTaskType] = useState('Reminder')
  const [error, setError] = useState('')

  function bump(kind: 'today' | 'd' | 'w' | 'm' | 'y') {
    if (kind === 'today') {
      setReminderDate(toISODate(new Date()))
      return
    }
    const d = new Date(reminderDate + 'T00:00:00')
    if (kind === 'd') d.setDate(d.getDate() + 1)
    if (kind === 'w') d.setDate(d.getDate() + 7)
    if (kind === 'm') d.setMonth(d.getMonth() + 1)
    if (kind === 'y') d.setFullYear(d.getFullYear() + 1)
    setReminderDate(toISODate(d))
  }

  function save() {
    if (!details.trim()) {
      setError('Details are required.')
      return
    }
    create.mutate(
      {
        details,
        assignee: assignee || null,
        patient_id: patient?.id ?? null,
        reminder_date: reminderDate || null,
        task_type: taskType,
        author: SESSION_USER,
      },
      {
        onSuccess: () => {
          toast('Task saved', 'success')
          onClose()
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <Modal
      title="New Task ⓘ"
      onClose={onClose}
      footer={
        <>
          <button className="btn-blue-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-blue" onClick={save} disabled={create.isPending}>
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4 p-4">
        {error && (
          <div className="border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="pf-label req">Details</label>
          <textarea
            className="pf-input w-full"
            rows={3}
            maxLength={255}
            placeholder="Enter task details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <div className="text-right text-xxs text-pf-muted">{details.length}/255</div>
        </div>
        <div>
          <label className="pf-label">
            Assign to{' '}
            <button
              className="pf-link ml-1 normal-case"
              onClick={() => setAssignee(SESSION_USER)}
              type="button"
            >
              Assign to me
            </button>
          </label>
          <div className="flex items-center rounded-sm border border-gray-400">
            <input
              className="min-w-0 flex-1 px-2 py-1 focus:outline-none"
              placeholder="Search"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
            <Search size={14} className="mx-2 text-gray-500" />
          </div>
        </div>
        <div>
          <label className="pf-label">Regarding patient</label>
          <PatientTypeahead value={patient} onChange={setPatient} />
        </div>
        <div>
          <label className="pf-label">Reminder date</label>
          <input
            type="date"
            className="pf-input"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <button className="btn-blue-outline !py-0.5" onClick={() => bump('today')}>
              Today
            </button>
            <button className="btn-blue-outline !py-0.5" onClick={() => bump('d')}>
              +1 d
            </button>
            <button className="btn-blue-outline !py-0.5" onClick={() => bump('w')}>
              +1 w
            </button>
            <button className="btn-blue-outline !py-0.5" onClick={() => bump('m')}>
              +1 m
            </button>
            <button className="btn-blue-outline !py-0.5" onClick={() => bump('y')}>
              +1 y
            </button>
          </div>
        </div>
        <div>
          <label className="pf-label">Author</label>
          <ul className="ml-5 list-disc">
            <li>{SESSION_USER}</li>
          </ul>
        </div>
        <div>
          <label className="pf-label">Task type</label>
          <select
            className="pf-input w-56"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            {TASK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  )
}

export default function Tasks() {
  const { data: tasks } = useTasks()
  const update = useUpdateTask()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('All tasks')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [statusFilter, setStatusFilter] = useState('Incomplete')
  const [patientSearch, setPatientSearch] = useState('')
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(() => {
    return (tasks ?? []).filter((t) => {
      if (tab === 'My tasks' && t.assignee !== SESSION_USER) return false
      if (tab === 'Unassigned tasks' && t.assignee) return false
      if (TAB_TYPE[tab] && t.task_type !== TAB_TYPE[tab]) return false
      if (typeFilter !== 'All types' && t.task_type !== typeFilter) return false
      if (statusFilter !== 'All' && t.status !== statusFilter.toLowerCase()) return false
      if (patientSearch) {
        const name = t.patient
          ? `${t.patient.first_name} ${t.patient.last_name}`.toLowerCase()
          : ''
        if (!name.includes(patientSearch.toLowerCase())) return false
      }
      return true
    })
  }, [tasks, tab, typeFilter, statusFilter, patientSearch])

  function complete(task: Task) {
    const next = task.status === 'complete' ? 'incomplete' : 'complete'
    update.mutate(
      { id: task.id, status: next },
      {
        onSuccess: () =>
          toast(next === 'complete' ? 'Task completed' : 'Task reopened', 'success'),
        onError: (err) => toast(err.message, 'error'),
      },
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between bg-pf-band px-5 pt-3">
        <h1 className="text-[26px] font-light text-white">Tasks</h1>
        <button className="btn-blue-outline flex items-center gap-1 !py-1">
          Actions <ChevronDown size={14} />
        </button>
      </div>
      <div className="flex shrink-0 items-end gap-1 bg-pf-band px-5 pt-1">
        {TABS.map((t) => (
          <button
            key={t}
            className={`whitespace-nowrap px-2.5 py-1.5 text-[13px] font-bold ${
              tab === t ? 'bg-white text-pf-text' : 'bg-pf-tab text-white hover:brightness-110'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <button className="bg-pf-tab px-2.5 py-1.5 text-white">
          <MoreHorizontal size={14} />
        </button>
        <button className="bg-pf-tab px-2.5 py-1.5 text-white">
          <Wrench size={13} />
        </button>
      </div>

      {/* Filter row */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <select
          className="pf-input w-32"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>All types</option>
          {TASK_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <div className="flex w-56 items-center rounded-sm border border-gray-400">
          <input
            className="min-w-0 flex-1 px-2 py-1 focus:outline-none"
            placeholder="Search patient name, record ..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>
        <select
          className="pf-input w-32"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Incomplete</option>
          <option>Complete</option>
          <option>All</option>
        </select>
        <select className="pf-input w-28">
          <option>Current</option>
          <option>Overdue</option>
        </select>
        <div className="flex w-44 items-center rounded-sm border border-gray-400">
          <input className="min-w-0 flex-1 px-2 py-1 focus:outline-none" placeholder="All providers" />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>
        <div className="flex-1" />
        <button className="btn-orange" onClick={() => setShowNew(true)}>
          New task
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto">
        <div className="flex-1 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">{filtered.length} Task</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-pf-border align-top">
                  <td className="px-4 py-2.5">{fmtDate(t.reminder_date)}</td>
                  <td className="px-4 py-2.5">
                    <div className={t.status === 'complete' ? 'line-through text-pf-muted' : ''}>
                      {t.task_type ?? 'Reminder'}
                    </div>
                    <div className="text-pf-muted">{t.assignee ?? 'Unassigned'}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    {t.patient ? (
                      <button
                        className="pf-link font-semibold"
                        onClick={() => navigate(`/charts/patients/${t.patient!.id}/summary`)}
                      >
                        {t.patient.first_name} {t.patient.last_name}
                      </button>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td
                    className={`px-4 py-2.5 ${
                      t.status === 'complete' ? 'line-through text-pf-muted' : ''
                    }`}
                  >
                    {t.details}
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="pf-link font-semibold" onClick={() => complete(t)}>
                      {t.status === 'complete' ? 'Reopen' : 'Complete ✓'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-pf-muted">
                    Your practice has no tasks matching the filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AdRail variant="updox" />
      </div>

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
