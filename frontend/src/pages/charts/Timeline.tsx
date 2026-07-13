import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { RotateCw } from 'lucide-react'

import AdRail from '../../components/AdRail'
import { fmtDate } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

const FILTERS = [
  'Appointments',
  'Documents pending',
  'Documents signed',
  'e-Prescriptions',
  'Encounters',
  'Exported patient records',
  'Imaging orders',
  'Imaging results',
  'Lab orders',
  'Lab results',
  'Prescription drafts',
  'Prior authorizations',
  'Referrals',
]

export default function Timeline() {
  const { summary } = useOutletContext<ChartContext>()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Encounters')
  const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  const showEncounters = filter === 'Encounters'
  const showDocuments = filter.startsWith('Documents')

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <span className="flex items-center gap-1.5 text-pf-link">
          <RotateCw size={14} /> {now}
        </span>
        <select
          className="pf-input w-56"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {FILTERS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto">
        <div className="flex-1 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                <th className="px-4 py-2">Type/Source</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {showEncounters &&
                summary.encounters.map((e) => (
                  <tr key={e.id} className="border-b border-pf-border align-top">
                    <td className="px-4 py-3">
                      <button
                        className="pf-link font-semibold"
                        onClick={() =>
                          navigate(
                            `/charts/patients/${summary.patient.id}/encounter/${e.id}`,
                          )
                        }
                      >
                        {e.type}
                      </button>
                      <div>Will Demo</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{e.note_type}</div>
                      <div>CC: {e.chief_complaint || '--'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{fmtDate(e.date)}</div>
                      {e.status === 'Signed' && (
                        <div className="text-pf-muted">Signed</div>
                      )}
                    </td>
                  </tr>
                ))}
              {showDocuments &&
                summary.documents.map((d) => (
                  <tr key={d.id} className="border-b border-pf-border align-top">
                    <td className="px-4 py-3">
                      <span className="pf-link font-semibold">{d.type ?? 'Document'}</span>
                      <div>{d.provider ?? 'Will Demo'}</div>
                    </td>
                    <td className="px-4 py-3">{d.title}</td>
                    <td className="px-4 py-3">
                      <div>{fmtDate(d.date)}</div>
                      <div className="text-pf-muted">{d.status}</div>
                    </td>
                  </tr>
                ))}
              {((showEncounters && summary.encounters.length === 0) ||
                (showDocuments && summary.documents.length === 0) ||
                (!showEncounters && !showDocuments)) && (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-pf-muted">
                    No {filter.toLowerCase()} to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <AdRail variant="twitter" />
      </div>
    </div>
  )
}
