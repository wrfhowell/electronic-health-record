export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '--'
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return '--'
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y.slice(2)}`
}

export function ageOf(dob: string): number {
  const birth = new Date(dob + 'T00:00:00')
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export function fmtDob(dob: string): string {
  const d = new Date(dob + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "13:30" -> "1:30 PM" */
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '--'
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  })
}

/** "9:53 PM, 07/12/26" like the accessed column */
export function fmtAccessed(iso: string | null | undefined): string {
  if (!iso) return '--'
  const d = new Date(iso)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const date = d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  })
  return `${time}, ${date}`
}

export function initialsOf(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}
