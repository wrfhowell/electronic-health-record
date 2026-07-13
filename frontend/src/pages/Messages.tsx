import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, RotateCw, Settings } from 'lucide-react'

import { useMessages, useSendMessage, useUpdateMessage } from '../api/hooks'
import type { Message, Patient } from '../api/types'
import AdRail from '../components/AdRail'
import Modal from '../components/Modal'
import PatientTypeahead from '../components/PatientTypeahead'
import { useToast } from '../components/Toast'
import { fmtDateTime } from '../lib/format'
import { SESSION_USER } from '../lib/session'

const FOLDERS = [
  { key: 'inbox', label: 'Inbox' },
  { key: 'sent', label: 'Sent' },
  { key: 'archive', label: 'Archive' },
  { key: 'referrals', label: 'Referrals' },
]

function NewMessageModal({ onClose }: { onClose: () => void }) {
  const send = useSendMessage()
  const toast = useToast()
  const navigate = useNavigate()
  const [to, setTo] = useState('')
  const [toFocused, setToFocused] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [addToChart, setAddToChart] = useState(false)
  const [error, setError] = useState('')

  function doSend() {
    if (!to.trim()) {
      setError('A recipient is required.')
      return
    }
    if (!subject.trim()) {
      setError('Subject is required.')
      return
    }
    if (!body.trim()) {
      setError('Message is required.')
      return
    }
    send.mutate(
      {
        from_user: SESSION_USER,
        to_user: to,
        patient_id: patient?.id ?? null,
        subject,
        body,
        urgent,
      },
      {
        onSuccess: () => {
          toast('Message sent', 'success')
          onClose()
          navigate('/messages/sent')
        },
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <Modal
      title="New Message"
      onClose={onClose}
      width="w-[640px]"
      footer={
        <>
          <button className="btn-blue-outline" onClick={onClose}>
            Cancel
          </button>
          <span className="flex items-center gap-4">
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
              />
              Urgent
            </label>
            <button
              className="btn-blue"
              onClick={doSend}
              disabled={send.isPending || !to || !subject || !body}
            >
              Send
            </button>
          </span>
        </>
      }
    >
      <div className="space-y-3 p-4">
        {error && (
          <div className="border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div>
            <label className="pf-label req">To</label>
            <select className="pf-input" disabled>
              <option>In practice</option>
            </select>
          </div>
          <div className="relative flex-1 self-end">
            <input
              className="pf-input w-full"
              placeholder="Search"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => setToFocused(true)}
              onBlur={() => setTimeout(() => setToFocused(false), 150)}
            />
            {toFocused && !to && (
              <button
                className="absolute left-0 right-0 top-full z-20 border border-gray-300 bg-white px-3 py-2 text-left shadow-lg hover:bg-blue-50"
                onMouseDown={() => setTo('Demo, Will')}
              >
                Demo, Will
              </button>
            )}
          </div>
          <span className="pf-link self-end pb-1.5 font-semibold">
            Send to all in practice
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <PatientTypeahead value={patient} onChange={setPatient} />
          </div>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={addToChart}
              onChange={(e) => setAddToChart(e.target.checked)}
              disabled={!patient}
            />
            Add to chart
          </label>
        </div>
        <div>
          <label className="pf-label req">Subject</label>
          <input
            className="pf-input w-full"
            placeholder="Enter a subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div>
          <label className="pf-label req">Message</label>
          <textarea
            className="pf-input w-full"
            rows={6}
            placeholder="Enter a message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  )
}

export default function Messages() {
  const { folder = 'inbox' } = useParams()
  const effectiveFolder = folder === 'referrals' ? 'referrals' : folder
  const { data: messages, refetch } = useMessages(
    effectiveFolder === 'referrals' ? 'none' : effectiveFolder,
  )
  const update = useUpdateMessage()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)

  const list = folder === 'referrals' ? [] : (messages ?? [])
  const selected: Message | undefined = list.find((m) => m.id === selectedId)

  function open(m: Message) {
    setSelectedId(m.id)
    if (!m.read) {
      update.mutate({ id: m.id, read: true })
    }
  }

  function archive(m: Message) {
    update.mutate(
      { id: m.id, folder: 'archive' },
      {
        onSuccess: () => {
          toast('Message archived', 'success')
          if (selectedId === m.id) setSelectedId(null)
        },
        onError: (err) => toast(err.message, 'error'),
      },
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between bg-pf-band px-5 pt-3">
        <h1 className="text-[26px] font-light text-white">Messages</h1>
        <button className="btn-blue-outline flex items-center gap-1 !py-1">
          Actions <ChevronDown size={14} />
        </button>
      </div>
      <div className="flex shrink-0 items-end gap-1 bg-pf-band px-5 pt-1">
        {FOLDERS.map((f) => (
          <NavLink
            key={f.key}
            to={`/messages/${f.key}`}
            onClick={() => setSelectedId(null)}
            className={({ isActive }) =>
              `px-3 py-1.5 text-[13px] font-bold ${
                isActive ? 'bg-white text-pf-text' : 'bg-pf-tab text-white hover:brightness-110'
              }`
            }
          >
            {f.label}
          </NavLink>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <button
          className="btn-blue-outline !px-2 !py-1"
          onClick={() => {
            refetch()
            toast('Messages refreshed')
          }}
        >
          <RotateCw size={14} />
        </button>
        <select className="pf-input w-28">
          <option>Show all</option>
          <option>Unread</option>
          <option>Urgent</option>
        </select>
        <span className="pf-link flex items-center gap-1 font-semibold">
          <Settings size={13} /> Message settings
        </span>
        <div className="flex-1" />
        <button className="btn-orange" onClick={() => setShowNew(true)}>
          New message
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-2">
        {/* Split pane */}
        <div className="flex min-w-0 flex-1">
          <div className="w-[45%] min-w-[320px] overflow-y-auto border-r-2 border-pf-band bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                  <th className="w-8 px-2 py-2">
                    <input type="checkbox" />
                  </th>
                  <th className="px-2 py-2">{folder === 'sent' ? 'To' : 'From'}</th>
                  <th className="px-2 py-2">Patient</th>
                  <th className="px-2 py-2">{folder === 'sent' ? 'Sent' : 'Received'}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr
                    key={m.id}
                    className={`cursor-pointer border-b border-pf-border ${
                      selectedId === m.id ? 'bg-blue-100' : 'hover:bg-blue-50'
                    }`}
                    onClick={() => open(m)}
                  >
                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" />
                    </td>
                    <td className={`px-2 py-2.5 ${!m.read ? 'font-bold' : ''}`}>
                      {m.urgent && <span className="mr-1 text-red-600">!</span>}
                      {folder === 'sent' ? m.to_user : m.from_user}
                      <div
                        className={`truncate text-xxs ${!m.read ? 'font-bold' : 'text-pf-muted'}`}
                      >
                        {m.subject}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      {m.patient ? `${m.patient.first_name} ${m.patient.last_name}` : '--'}
                    </td>
                    <td className="px-2 py-2.5 text-pf-muted">{fmtDateTime(m.created_at)}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-14 text-center text-pf-muted">
                      No messages in this folder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Reading pane */}
          <div className="min-w-0 flex-1 overflow-y-auto bg-white p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[18px] font-bold">
                      {selected.urgent && <span className="mr-2 text-red-600">Urgent</span>}
                      {selected.subject}
                    </h2>
                    <div className="mt-1 text-pf-muted">
                      From <span className="font-semibold">{selected.from_user}</span> to{' '}
                      <span className="font-semibold">{selected.to_user}</span> ·{' '}
                      {fmtDateTime(selected.created_at)}
                    </div>
                    {selected.patient && (
                      <div className="mt-1">
                        Patient:{' '}
                        <span className="pf-link font-semibold">
                          {selected.patient.first_name} {selected.patient.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                  {folder !== 'archive' && (
                    <button className="btn-blue-outline" onClick={() => archive(selected)}>
                      Archive
                    </button>
                  )}
                </div>
                <div className="mt-6 whitespace-pre-wrap leading-relaxed">
                  {selected.body}
                </div>
              </div>
            ) : (
              <div className="pt-10 text-center text-[18px] text-gray-700">
                Click a message to show it here.
              </div>
            )}
          </div>
        </div>
        <AdRail variant="twitter" />
      </div>

      {showNew && <NewMessageModal onClose={() => setShowNew(false)} />}
    </div>
  )
}
