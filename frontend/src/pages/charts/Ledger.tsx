import { useOutletContext } from 'react-router-dom'

import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'
import { fmtDate, toISODate } from '../../lib/format'
import type { ChartContext } from './ChartLayout'

export default function Ledger() {
  const { summary } = useOutletContext<ChartContext>()
  const toast = useToast()
  const today = toISODate(new Date())
  const signed = summary.encounters.filter((e) => e.status === 'Signed')

  return (
    <div className="flex h-full gap-2 overflow-y-auto p-4">
      <div className="min-w-0 flex-1 space-y-4">
        <section className="pf-card p-5">
          <h2 className="text-[17px] font-bold">
            Introducing Our New Patient Ledger Feature: Enhancing Full-Service Billing
          </h2>
          <p className="mt-3">
            With Practice Fusion Billing Services, you can use the patient ledger to
            effortlessly navigate through a patient's charge and payment history. Here
            is what your practice can accomplish using this feature:
          </p>
          <ul className="ml-6 mt-3 list-disc space-y-2">
            <li>
              Dive into detailed information about individual transactions, filtering
              by service or billed date ranges, and distinguishing between paid and
              unpaid portions.
            </li>
            <li>
              Get a comprehensive view of any superbill, including billing code,
              modifiers, rendering provider, and facility details.
            </li>
            <li>
              Track the amount charged, payments received, and adjustments made by
              insurance and patients for each service, as well as the cumulative
              figures.
            </li>
          </ul>
          <p className="mt-3">
            The patient ledger feature is just a glimpse of what Practice Fusion
            Billing Services has to offer. Unlock the full potential of our end-to-end
            billing services, supported by our team of professional billing experts.
          </p>
          <button
            className="btn-blue mt-4"
            onClick={() => toast('Billing services are not part of this demo')}
          >
            Learn More
          </button>
        </section>

        <div className="flex items-end gap-4">
          <div>
            <label className="pf-label">Service date</label>
            <span className="flex items-center gap-1">
              <input type="date" className="pf-input" /> -
              <input type="date" className="pf-input" />
            </span>
          </div>
          <div>
            <label className="pf-label">Billed date</label>
            <span className="flex items-center gap-1">
              <input type="date" className="pf-input" /> -
              <input type="date" className="pf-input" />
            </span>
          </div>
          <div className="flex-1" />
          <label className="flex items-center gap-1 pb-1.5">
            <input type="radio" name="ledger-open" defaultChecked /> Open
          </label>
          <label className="flex items-center gap-1 pb-1.5">
            <input type="radio" name="ledger-open" /> All
          </label>
          <button className="btn-blue-outline">Clear filters</button>
          <button className="btn-blue">Search</button>
        </div>

        <div className="pf-card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-pf-border bg-[#f4f4f4] text-left text-xxs uppercase text-gray-600">
                <th className="px-3 py-2">Service date ▼</th>
                <th className="px-3 py-2">Superbill ID</th>
                <th className="px-3 py-2">Voucher</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Facility</th>
                <th className="px-3 py-2">Charge</th>
                <th className="px-3 py-2">Payments</th>
                <th className="px-3 py-2">Adjustments</th>
                <th className="px-3 py-2">Balance</th>
                <th className="px-3 py-2">Billed date</th>
              </tr>
            </thead>
            <tbody>
              {signed.map((e, i) => (
                <tr key={e.id} className="border-b border-pf-border">
                  <td className="px-3 py-2.5 font-bold">{fmtDate(e.date)}</td>
                  <td className="px-3 py-2.5">
                    <span className="pf-link">SB-{1000 + e.id}</span>
                  </td>
                  <td className="px-3 py-2.5">{200 + i}</td>
                  <td className="px-3 py-2.5">Will Demo</td>
                  <td className="px-3 py-2.5">{e.facility ?? 'Will Demo Practice'}</td>
                  <td className="px-3 py-2.5">$0.00</td>
                  <td className="px-3 py-2.5">$0.00</td>
                  <td className="px-3 py-2.5">$0.00</td>
                  <td className="px-3 py-2.5">$0.00</td>
                  <td className="px-3 py-2.5">{fmtDate(today)}</td>
                </tr>
              ))}
              {signed.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-10 text-center text-pf-muted">
                    No superbills for this patient.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AdRail variant="imaging" />
    </div>
  )
}
