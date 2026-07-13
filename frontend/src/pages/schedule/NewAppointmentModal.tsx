import { useState } from 'react'

import { useCreateAppointment } from '../../api/hooks'
import type { Patient } from '../../api/types'
import Modal from '../../components/Modal'
import PatientTypeahead from '../../components/PatientTypeahead'
import { useToast } from '../../components/Toast'
import { fmtTime, toISODate } from '../../lib/format'

const APPT_TYPES = [
  'Office Visit',
  'Follow-Up Visit',
  'New Patient Visit',
  'Wellness Exam',
  'Urgent Visit',
  'Video Visit',
]
const STATUSES = ['Pending', 'Confirmed', 'In Lobby', 'In Room', 'Seen', 'No Show']
const BLOCK_REASONS = ['Lunch', 'Meeting', 'Vacation', 'Holiday', 'Out of Office', 'Other']
const DURATIONS = [15, 30, 45, 60, 90, 120]

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

interface Props {
  initialDate: string
  onClose: () => void
}

export default function NewAppointmentModal({ initialDate, onClose }: Props) {
  const create = useCreateAppointment()
  const toast = useToast()
  const [tab, setTab] = useState<'patient' | 'block' | 'range'>('patient')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [type, setType] = useState('Office Visit')
  const [status, setStatus] = useState('Pending')
  const [duration, setDuration] = useState(30)
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState('09:00')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockDescription, setBlockDescription] = useState('')
  const [rangeEndDate, setRangeEndDate] = useState(initialDate)
  const [error, setError] = useState('')

  const endTime = addMinutes(time, duration)

  function save() {
    setError('')
    if (tab === 'patient') {
      if (!patient) {
        setError('Patient is required.')
        return
      }
      if (!date || !time) {
        setError('Date and time are required.')
        return
      }
      create.mutate(
        {
          patient_id: patient.id,
          provider_id: 1,
          date,
          start_time: time,
          end_time: endTime,
          type,
          status,
          chief_complaint: chiefComplaint || null,
        },
        {
          onSuccess: () => {
            toast('Appointment saved', 'success')
            onClose()
          },
          onError: (err) => setError(err.message),
        },
      )
    } else {
      if (!blockReason) {
        setError('Reason is required.')
        return
      }
      if (!date || !time) {
        setError('Date and time are required.')
        return
      }
      const payload = {
        provider_id: 1,
        date,
        start_time: tab === 'range' ? '00:00' : time,
        end_time: tab === 'range' ? '23:59' : endTime,
        type: 'Block',
        status: 'Blocked',
        is_block: true,
        block_reason: blockReason,
        note: blockDescription || null,
      }
      if (tab === 'range') {
        // Create one block row per day in the range.
        const start = new Date(date + 'T00:00:00')
        const end = new Date(rangeEndDate + 'T00:00:00')
        if (end < start) {
          setError('End date must be on or after the start date.')
          return
        }
        const days: string[] = []
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(toISODate(d))
        }
        Promise.all(
          days.map((day) => create.mutateAsync({ ...payload, date: day })),
        )
          .then(() => {
            toast('Time blocked', 'success')
            onClose()
          })
          .catch((err) => setError((err as Error).message))
      } else {
        create.mutate(payload, {
          onSuccess: () => {
            toast('Time blocked', 'success')
            onClose()
          },
          onError: (err) => setError(err.message),
        })
      }
    }
  }

  const tabBtn = (key: typeof tab, label: string) => (
    <button
      className={`border-b-2 px-1 pb-2 text-[14px] font-bold ${
        tab === key
          ? 'border-pf-rail text-pf-text'
          : 'border-transparent text-pf-link hover:text-pf-text'
      }`}
      onClick={() => setTab(key)}
    >
      {label}
    </button>
  )

  return (
    <Modal
      title="New appointment"
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
      <div className="flex gap-6 border-b border-gray-300 px-4 pt-3">
        {tabBtn('patient', 'With patient')}
        {tabBtn('block', 'Block time')}
        {tabBtn('range', 'Block range')}
      </div>

      <div className="space-y-4 p-4">
        {error && (
          <div className="border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </div>
        )}

        {tab === 'patient' && (
          <>
            <div>
              <label className="pf-label req">Patient</label>
              <PatientTypeahead
                value={patient}
                onChange={setPatient}
                extra={<span className="pf-link font-semibold">Add new patient</span>}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="pf-label">Appointment type</label>
                <select
                  className="pf-input w-full"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {APPT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="pf-label">Duration</label>
                <select
                  className="pf-input w-full"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="pf-label">Status</label>
                <select
                  className="pf-input w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="pf-label">Chief complaint</label>
              <input
                className="pf-input w-full"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
              />
            </div>
          </>
        )}

        {(tab === 'block' || tab === 'range') && (
          <>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="pf-label">Block time for</label>
                <select className="pf-input w-full" disabled>
                  <option>Demo, Will</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="pf-label">Facility</label>
                <select className="pf-input w-full" disabled>
                  <option>Will Demo Practice</option>
                </select>
              </div>
            </div>
            <div>
              <label className="pf-label req">Reason</label>
              <select
                className="pf-input w-full"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              >
                <option value="">Select...</option>
                {BLOCK_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="pf-label">Description</label>
              <textarea
                className="pf-input w-full"
                rows={2}
                maxLength={100}
                value={blockDescription}
                onChange={(e) => setBlockDescription(e.target.value)}
              />
              <div className="text-right text-xxs text-pf-muted">
                {blockDescription.length}/100
              </div>
            </div>
          </>
        )}

        {/* Date/time row */}
        <div className="flex items-end gap-3">
          <div>
            <label className="pf-label req">{tab === 'range' ? 'Start date' : 'Date'}</label>
            <input
              type="date"
              className="pf-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {tab === 'range' ? (
            <div>
              <label className="pf-label req">End date</label>
              <input
                type="date"
                className="pf-input"
                value={rangeEndDate}
                onChange={(e) => setRangeEndDate(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="pf-label req">Time</label>
                <span className="flex items-center">
                  <button
                    className="btn-blue-outline !px-2 !py-1"
                    onClick={() => setTime((t) => addMinutes(t, -15))}
                  >
                    −
                  </button>
                  <input
                    type="time"
                    className="pf-input mx-1"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <button
                    className="btn-blue-outline !px-2 !py-1"
                    onClick={() => setTime((t) => addMinutes(t, 15))}
                  >
                    +
                  </button>
                </span>
              </div>
              {tab === 'block' && (
                <div className="w-24">
                  <label className="pf-label req">Duration</label>
                  <select
                    className="pf-input w-full"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="pb-1.5">
                <span className="pf-label">End time</span>
                {fmtTime(endTime)}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
