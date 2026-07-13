import AdRail from '../components/AdRail'
import { useToast } from '../components/Toast'

const CATEGORIES = [
  {
    title: 'Patient reports',
    items: ['Patient demographics', 'Patient lists', 'Immunization records'],
  },
  {
    title: 'Clinical reports',
    items: ['Diagnoses summary', 'Medication usage', 'Lab result trends'],
  },
  {
    title: 'Schedule reports',
    items: ['Appointment volume', 'No-show summary', 'Provider utilization'],
  },
  {
    title: 'Financial reports',
    items: ['Superbill summary', 'Payments received', 'Outstanding balances'],
  },
  {
    title: 'Quality of care',
    items: ['CQM dashboard', 'Screening compliance', 'Risk score distribution'],
  },
  {
    title: 'Administrative',
    items: ['User activity log', 'Chart access audit', 'e-Prescribing volume'],
  },
]

export default function Reports() {
  const toast = useToast()
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 bg-pf-band px-5 py-4">
        <h1 className="text-[26px] font-light text-white">Reports</h1>
      </div>
      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto p-4">
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="pf-card p-5">
              <h2 className="text-[17px] font-bold text-pf-link">{cat.title}</h2>
              <ul className="ml-5 mt-3 list-disc space-y-2">
                {cat.items.map((item) => (
                  <li key={item}>
                    <button
                      className="pf-link"
                      onClick={() => toast('Reports are placeholder-only in this demo')}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <AdRail variant="staffing" />
      </div>
    </div>
  )
}
