import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search } from 'lucide-react'

import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'
import { fmtDate } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

export default function Documents() {
  const { summary } = useOutletContext<ChartContext>()
  const toast = useToast()
  const [status, setStatus] = useState('All')
  const [typeFilter, setTypeFilter] = useState('')

  const docs = summary.documents.filter(
    (d) =>
      (status === 'All' || d.status === status) &&
      (!typeFilter || (d.type ?? '').toLowerCase().includes(typeFilter.toLowerCase())),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-pf-band bg-white px-4 py-2">
        <select className="pf-input w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Pending</option>
          <option>Signed</option>
        </select>
        <div className="flex w-44 items-center rounded-sm border border-gray-400">
          <input className="min-w-0 flex-1 px-2 py-1 focus:outline-none" placeholder="Provider" />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>
        <div className="flex w-44 items-center rounded-sm border border-gray-400">
          <input
            className="min-w-0 flex-1 px-2 py-1 focus:outline-none"
            placeholder="Document type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Search size={14} className="mx-2 text-gray-500" />
        </div>
        <div className="flex-1" />
        <button className="btn-blue-outline" onClick={() => toast('Scanning is not available in this demo')}>
          Scan
        </button>
        <button className="btn-blue-outline" onClick={() => toast('Uploads are not available in this demo')}>
          Upload
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto">
        <div className="flex-1 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" />
                </th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Comments</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Date ▼</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-pf-border">
                  <td className="px-3 py-2.5">
                    <input type="checkbox" />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="pf-link font-semibold">{d.title}</span>
                  </td>
                  <td className="px-3 py-2.5">{d.type ?? '--'}</td>
                  <td className="px-3 py-2.5">{d.comments ?? '--'}</td>
                  <td className="px-3 py-2.5">{d.provider ?? '--'}</td>
                  <td className="px-3 py-2.5">{fmtDate(d.date)}</td>
                  <td className="px-3 py-2.5">{d.size ?? '--'}</td>
                  <td className="px-3 py-2.5">
                    <button
                      className="pf-link"
                      onClick={() => toast('Document viewing is not part of this demo')}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-12 text-center text-pf-muted">
                    <div>No documents to display</div>
                    <div className="mt-2">
                      Drag and drop or click 'Upload' to add files.
                      <br />
                      Upload up to 20 files at a time.
                    </div>
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
