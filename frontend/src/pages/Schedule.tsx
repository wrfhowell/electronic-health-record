import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import {
  useAppointments,
  useDeleteAppointment,
  useUpdateAppointment,
} from '../api/hooks'
import type { Appointment } from '../api/types'
import AdRail from '../components/AdRail'
import { useToast } from '../components/Toast'
import { fmtTime, toISODate } from '../lib/format'
import NewAppointmentModal from './schedule/NewAppointmentModal'

const TYPE_COLORS: Record<string, string> = {
  'Office Visit': 'bg-[#7cb5ec] border-[#4a90d9]',
  'Follow-Up Visit': 'bg-[#90c978] border-[#5da53f]',
  'New Patient Visit': 'bg-[#c39bd3] border-[#9b59b6]',
  'Wellness Exam': 'bg-[#f0c274] border-[#d69b2c]',
  'Urgent Visit': 'bg-[#e88a8a] border-[#cc4b4b]',
  'Video Visit': 'bg-[#76c7c0] border-[#3ba79e]',
}

const BUSINESS_START = 8 // 8 AM
const BUSINESS_END = 18 // 6 PM

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - copy.getDay())
  copy.setHours(0, 0, 0, 0)
  return copy
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

interface PopoverState {
  appt: Appointment
  x: number
  y: number
}

export default function Schedule() {
  const { view = 'week' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [anchor, setAnchor] = useState(() => new Date())
  const [slotMinutes, setSlotMinutes] = useState(30)
  const [showWeekends, setShowWeekends] = useState(true)
  const [showNonBusiness, setShowNonBusiness] = useState(true)
  const [displayOpen, setDisplayOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const isWeek = view !== 'day'
  const weekStart = startOfWeek(anchor)
  const days: Date[] = useMemo(() => {
    if (!isWeek) return [new Date(anchor)]
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }).filter((d) => showWeekends || (d.getDay() !== 0 && d.getDay() !== 6))
  }, [anchor, isWeek, showWeekends]) // eslint-disable-line react-hooks/exhaustive-deps

  const rangeStart = toISODate(days[0])
  const rangeEnd = toISODate(days[days.length - 1])
  const { data: appointments, refetch } = useAppointments(rangeStart, rangeEnd)
  const updateAppt = useUpdateAppointment()
  const deleteAppt = useDeleteAppointment()

  const startHour = showNonBusiness ? 0 : BUSINESS_START
  const endHour = showNonBusiness ? 24 : BUSINESS_END
  const slotsPerHour = 60 / slotMinutes
  const slotPx = slotMinutes === 15 ? 24 : slotMinutes === 30 ? 32 : 48
  const pxPerMinute = (slotPx * slotsPerHour) / 60

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const todayIso = toISODate(new Date())
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Scroll so 8 AM is visible on mount.
  useEffect(() => {
    if (gridRef.current && showNonBusiness) {
      gridRef.current.scrollTop = (BUSINESS_START * 60 - 30) * pxPerMinute
    }
  }, [pxPerMinute, showNonBusiness, view])

  function page(deltaDays: number) {
    const d = new Date(anchor)
    d.setDate(d.getDate() + deltaDays)
    setAnchor(d)
  }

  const headerLabel = isWeek
    ? `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${days[
        days.length - 1
      ].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : anchor.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

  const apptCount = (appointments ?? []).filter((a) => !a.is_block).length

  function setStatus(appt: Appointment, status: string) {
    updateAppt.mutate(
      { id: appt.id, status },
      {
        onSuccess: () => toast(`Marked ${status}`, 'success'),
        onError: (err) => toast(err.message, 'error'),
      },
    )
    setPopover(null)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Blue header */}
      <div className="flex shrink-0 items-center gap-4 bg-pf-band px-5 pt-3">
        <h1 className="text-[26px] font-light text-white">Schedule</h1>
        <span className="pb-1 text-white">
          {apptCount} Appointment{apptCount === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex shrink-0 items-end gap-1 bg-pf-band px-5 pt-1">
        {[
          { key: 'appointments', label: 'Appointments' },
          { key: 'day', label: 'Day' },
          { key: 'week', label: 'Week' },
          { key: 'settings', label: 'Settings' },
        ].map((t) => (
          <NavLink
            key={t.key}
            to={`/schedule/${t.key}`}
            className={({ isActive }) =>
              `px-3 py-1.5 text-[13px] font-bold ${
                isActive ? 'bg-white text-pf-text' : 'bg-pf-tab text-white hover:brightness-110'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b-2 border-pf-band bg-white px-4 py-2">
        <button className="btn-blue-outline flex items-center gap-1.5 !py-1">
          <SlidersHorizontal size={13} /> Filter
        </button>
        <button
          className="btn-blue-outline flex items-center gap-1.5 !py-1"
          onClick={() => {
            refetch()
            toast('Schedule refreshed')
          }}
        >
          <RotateCw size={13} /> Refresh
        </button>
        <select className="pf-input w-48">
          <option>Will Demo Practice</option>
        </select>
        <div className="flex-1" />
        <button className="btn-orange" onClick={() => setShowModal(true)}>
          Add appointment
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Left filter panel */}
        <div className="hidden w-52 shrink-0 flex-col overflow-y-auto border-r border-pf-border bg-white md:flex">
          <button
            className="flex items-center gap-1 border-b border-pf-border px-3 py-2.5 text-xxs font-bold uppercase tracking-wide"
            onClick={() => setUsersOpen((v) => !v)}
          >
            {usersOpen ? '▾' : '▸'} Users
          </button>
          {usersOpen && (
            <div className="border-b border-pf-border px-3 py-2">
              <label className="flex items-center gap-2 font-bold">
                <input type="checkbox" defaultChecked /> All
                <span className="pf-link ml-2 font-normal">Just me</span>
                <span className="text-gray-300">|</span>
                <span className="pf-link font-normal">Edit</span>
              </label>
              <div className="mt-3 text-xxs uppercase text-gray-500">Logged in as</div>
              <label className="mt-1 flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="h-3 w-3 bg-purple-700" /> Demo, ...
              </label>
            </div>
          )}
          <div className="flex-1" />
          <button
            className="flex items-center gap-1 border-t border-pf-border px-3 py-2.5 text-xxs font-bold uppercase tracking-wide"
            onClick={() => setDisplayOpen((v) => !v)}
          >
            {displayOpen ? '▾' : '▸'} Display options
          </button>
          {displayOpen && (
            <div className="space-y-1.5 px-3 pb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showWeekends}
                  onChange={(e) => setShowWeekends(e.target.checked)}
                />
                Weekends
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNonBusiness}
                  onChange={(e) => setShowNonBusiness(e.target.checked)}
                />
                Non-Business hours
              </label>
            </div>
          )}
          <button className="border-t border-pf-border px-3 py-2.5 text-left text-xxs font-bold uppercase tracking-wide">
            ▸ Appointment types
          </button>
          <button className="border-t border-pf-border px-3 py-2.5 text-left text-xxs font-bold uppercase tracking-wide">
            ▸ Appointment status
          </button>
        </div>

        {/* Settings tab */}
        {view === 'settings' && (
          <div className="flex-1 p-6">
            <div className="pf-card p-6">
              <h2 className="text-[17px] font-bold">Schedule settings</h2>
              <p className="mt-3 text-pf-muted">
                Business hours, appointment types, and reminder settings are not part
                of this demo.
              </p>
            </div>
          </div>
        )}

        {/* Agenda list tab */}
        {view === 'appointments' && (
          <div className="flex min-w-0 flex-1 flex-col bg-white">
            <div className="flex shrink-0 items-center gap-2 border-b border-pf-border px-4 py-2.5">
              <h2 className="mr-4 text-[17px] font-bold">
                {anchor.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
              <div className="flex-1" />
              <button className="btn-blue-outline !px-2 !py-1" onClick={() => page(-1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="btn-blue-outline !px-2 !py-1" onClick={() => page(1)}>
                <ChevronRight size={14} />
              </button>
              <button className="btn-blue-outline !py-1" onClick={() => setAnchor(new Date())}>
                Today
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                  <th className="px-4 py-2">Note</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Patient</th>
                  <th className="px-4 py-2">Time ▲</th>
                  <th className="px-4 py-2">Provider</th>
                </tr>
              </thead>
              <tbody>
                {(appointments ?? [])
                  .filter((a) => a.date === toISODate(anchor) && !a.is_block)
                  .map((a) => (
                    <tr key={a.id} className="border-b border-pf-border">
                      <td className="px-4 py-2.5">{a.note ?? '--'}</td>
                      <td className="px-4 py-2.5">{a.status}</td>
                      <td className="px-4 py-2.5">
                        <button
                          className="pf-link font-semibold"
                          onClick={() =>
                            a.patient && navigate(`/charts/patients/${a.patient.id}/summary`)
                          }
                        >
                          {a.patient?.first_name} {a.patient?.last_name}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">{fmtTime(a.start_time)}</td>
                      <td className="px-4 py-2.5">Will Demo</td>
                    </tr>
                  ))}
                {(appointments ?? []).filter((a) => a.date === toISODate(anchor) && !a.is_block)
                  .length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-pf-muted">
                      No appointments scheduled for the day
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Calendar area */}
        {view !== 'settings' && view !== 'appointments' && (
        <div className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Date paging row */}
          <div className="flex shrink-0 items-center gap-2 border-b border-pf-border px-4 py-2.5">
            <h2 className="mr-4 text-[17px] font-bold">{headerLabel}</h2>
            <div className="flex-1" />
            <button className="btn-blue-outline !px-2 !py-1">
              <Calendar size={14} />
            </button>
            <button className="btn-blue-outline !px-2 !py-1" onClick={() => page(isWeek ? -7 : -1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn-blue-outline !px-2 !py-1" onClick={() => page(isWeek ? 7 : 1)}>
              <ChevronRight size={14} />
            </button>
            <button className="btn-blue-outline !py-1" onClick={() => setAnchor(new Date())}>
              Today
            </button>
            <button
              className="btn-blue-outline !px-2 !py-1"
              onClick={() => setSlotMinutes((s) => Math.min(60, s * 2))}
            >
              <ZoomOut size={14} />
            </button>
            <button
              className="btn-blue-outline !px-2 !py-1"
              onClick={() => setSlotMinutes((s) => Math.max(15, s / 2))}
            >
              <ZoomIn size={14} />
            </button>
            <select
              className="pf-input"
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
            >
              {[15, 30, 60].map((s) => (
                <option key={s} value={s}>
                  {s} min slots
                </option>
              ))}
            </select>
          </div>

          {/* Day headers */}
          <div className="flex shrink-0 border-b border-pf-border pr-4">
            <div className="w-20 shrink-0" />
            {days.map((d) => {
              const iso = toISODate(d)
              return (
                <div
                  key={iso}
                  className={`flex-1 py-2 text-center font-bold ${
                    iso === todayIso ? 'text-pf-text' : 'text-gray-600'
                  }`}
                >
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                  {d.getMonth() + 1}/{d.getDate()}
                </div>
              )
            })}
          </div>

          {/* Grid */}
          <div ref={gridRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="relative flex pr-4">
              {/* time gutter */}
              <div className="w-20 shrink-0">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="relative border-b border-gray-200 pr-2 text-right text-[12px] text-gray-600"
                    style={{ height: slotPx * slotsPerHour }}
                  >
                    <span className="relative -top-2">
                      {h === 0
                        ? ''
                        : `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`}
                    </span>
                  </div>
                ))}
              </div>
              {/* day columns */}
              {days.map((d) => {
                const iso = toISODate(d)
                const isToday = iso === todayIso
                const dayAppts = (appointments ?? []).filter((a) => a.date === iso)
                return (
                  <div
                    key={iso}
                    className={`relative flex-1 border-l border-gray-200 ${
                      isToday ? 'bg-[#dbe7ee]' : ''
                    }`}
                  >
                    {hours.map((h) =>
                      Array.from({ length: slotsPerHour }, (_, s) => (
                        <div
                          key={`${h}-${s}`}
                          className={`border-b ${
                            s === slotsPerHour - 1 ? 'border-gray-300' : 'border-dotted border-gray-200'
                          }`}
                          style={{ height: slotPx }}
                        />
                      )),
                    )}
                    {/* current time line */}
                    {isToday &&
                      nowMinutes >= startHour * 60 &&
                      nowMinutes <= endHour * 60 && (
                        <div
                          className="absolute left-0 right-0 z-10 border-t-2 border-red-400"
                          style={{ top: (nowMinutes - startHour * 60) * pxPerMinute }}
                        />
                      )}
                    {/* appointment chips */}
                    {dayAppts.map((a) => {
                      const startMin = minutesOf(a.start_time)
                      const endMin = minutesOf(a.end_time)
                      if (endMin <= startHour * 60 || startMin >= endHour * 60) return null
                      const top = (Math.max(startMin, startHour * 60) - startHour * 60) * pxPerMinute
                      const height = Math.max(
                        18,
                        (Math.min(endMin, endHour * 60) - Math.max(startMin, startHour * 60)) *
                          pxPerMinute -
                          2,
                      )
                      const colors = a.is_block
                        ? 'bg-gray-300 border-gray-400 text-gray-700'
                        : `${TYPE_COLORS[a.type] ?? 'bg-[#7cb5ec] border-[#4a90d9]'} text-white`
                      return (
                        <button
                          key={a.id}
                          className={`absolute left-0.5 right-0.5 z-10 overflow-hidden rounded-sm border px-1.5 py-0.5 text-left text-xxs leading-tight ${colors}`}
                          style={{ top, height }}
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                            setPopover({
                              appt: a,
                              x: Math.min(rect.right + 4, window.innerWidth - 280),
                              y: Math.min(rect.top, window.innerHeight - 260),
                            })
                          }}
                        >
                          <div className="font-bold">
                            {a.is_block
                              ? (a.block_reason ?? 'Blocked')
                              : `${a.patient?.first_name ?? ''} ${a.patient?.last_name ?? ''}`}
                          </div>
                          <div>
                            {fmtTime(a.start_time)} · {a.is_block ? 'Blocked' : a.type}
                          </div>
                          {!a.is_block && <div className="italic">{a.status}</div>}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        )}

        <div className="p-2">
          <AdRail variant="staffing" />
        </div>
      </div>

      {/* Chip popover */}
      {popover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopover(null)} />
          <div
            className="fixed z-50 w-64 border border-gray-300 bg-white shadow-xl"
            style={{ left: popover.x, top: popover.y }}
          >
            <div className="flex items-center justify-between bg-pf-tab px-3 py-2 text-white">
              <span className="font-bold">
                {popover.appt.is_block
                  ? (popover.appt.block_reason ?? 'Blocked')
                  : `${popover.appt.patient?.first_name} ${popover.appt.patient?.last_name}`}
              </span>
              <ChevronDown size={14} />
            </div>
            <div className="space-y-1 px-3 py-2 text-[13px]">
              <div>
                {fmtTime(popover.appt.start_time)} – {fmtTime(popover.appt.end_time)}
              </div>
              {!popover.appt.is_block && (
                <>
                  <div>
                    {popover.appt.type} · <span className="italic">{popover.appt.status}</span>
                  </div>
                  {popover.appt.chief_complaint && (
                    <div className="text-pf-muted">CC: {popover.appt.chief_complaint}</div>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {['Confirmed', 'In Lobby', 'Seen'].map((s) => (
                      <button
                        key={s}
                        className="btn-blue-outline !px-2 !py-0.5 text-xxs"
                        onClick={() => setStatus(popover.appt, s)}
                      >
                        {s === 'Confirmed' ? 'Confirm' : s}
                      </button>
                    ))}
                  </div>
                  {popover.appt.patient && (
                    <button
                      className="pf-link block pt-1 font-semibold"
                      onClick={() => {
                        navigate(`/charts/patients/${popover.appt.patient!.id}/summary`)
                      }}
                    >
                      Open chart
                    </button>
                  )}
                </>
              )}
              <button
                className="block pt-1 font-semibold text-red-700 hover:underline"
                onClick={() => {
                  deleteAppt.mutate(popover.appt.id, {
                    onSuccess: () => toast('Appointment cancelled'),
                    onError: (err) => toast(err.message, 'error'),
                  })
                  setPopover(null)
                }}
              >
                Cancel appointment
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <NewAppointmentModal
          initialDate={toISODate(anchor)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
