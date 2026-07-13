import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

import { usePatients } from '../api/hooks'
import type { Patient } from '../api/types'
import { fmtDob } from '../lib/format'

interface PatientTypeaheadProps {
  value: Patient | null
  onChange: (patient: Patient | null) => void
  placeholder?: string
  showFormatHint?: boolean
  extra?: React.ReactNode
}

/** Search box with the PF format-hint tooltip and a result dropdown. */
export default function PatientTypeahead({
  value,
  onChange,
  placeholder = 'Search patient name, record number, phone, DOB or SSN',
  showFormatHint = true,
  extra,
}: PatientTypeaheadProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { data: patients } = usePatients(query.length >= 1 ? query : undefined)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-sm border border-gray-400 bg-blue-50 px-2 py-1">
        <span>
          <span className="font-bold">
            {value.first_name} {value.last_name}
          </span>
          <span className="ml-2 text-pf-muted">
            {fmtDob(value.dob)} · PRN {value.prn}
          </span>
        </span>
        <button onClick={() => onChange(null)} aria-label="Clear patient">
          <X size={14} className="text-gray-500 hover:text-gray-800" />
        </button>
      </div>
    )
  }

  const results = query.length >= 1 ? (patients ?? []) : []

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center rounded-sm border border-gray-400 bg-white">
        <input
          className="min-w-0 flex-1 px-2 py-1 text-[13px] focus:outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
        />
        <Search size={14} className="mx-2 shrink-0 text-gray-500" />
      </div>
      {focused && (
        <div className="absolute left-0 right-0 top-full z-20 border border-gray-300 bg-white shadow-lg">
          {query.length === 0 && showFormatHint && (
            <div className="grid grid-cols-[90px_1fr] gap-y-2 px-4 py-3 text-[13px]">
              <span className="text-right pr-3 text-gray-600">Name:</span>
              <span>First Last</span>
              <span className="text-right pr-3 text-gray-600">Phone:</span>
              <span>123-456-7890</span>
              <span className="text-right pr-3 text-gray-600">DOB:</span>
              <span>MM/DD/YYYY</span>
              <span className="text-right pr-3 text-gray-600">Last 4 SSN:</span>
              <span className="text-gray-400">###-## ####</span>
              <span className="text-right pr-3 text-gray-600">PRN:</span>
              <span>AA123456</span>
            </div>
          )}
          {query.length >= 1 &&
            results.map((p) => (
              <button
                key={p.id}
                className="block w-full px-4 py-2 text-left hover:bg-blue-50"
                onClick={() => {
                  onChange(p)
                  setQuery('')
                  setFocused(false)
                }}
              >
                <span className="font-bold">
                  {p.first_name} {p.last_name}
                </span>
                <span className="ml-2 text-pf-muted">
                  {fmtDob(p.dob)} · {p.sex} · PRN {p.prn}
                </span>
              </button>
            ))}
          {query.length >= 1 && results.length === 0 && (
            <div className="px-4 py-3 text-pf-muted">No matching patients</div>
          )}
          {extra && <div className="border-t border-gray-200 px-4 py-2">{extra}</div>}
        </div>
      )}
    </div>
  )
}
