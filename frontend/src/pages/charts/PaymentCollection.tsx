import AdRail from '../../components/AdRail'
import { useToast } from '../../components/Toast'

export default function PaymentCollection() {
  const toast = useToast()
  return (
    <div className="flex h-full gap-2 overflow-y-auto p-4">
      <div className="flex-1 space-y-4">
        <section className="pf-card p-5">
          <h2 className="text-[17px] font-bold">Payment collection</h2>
          <div className="mt-4 grid grid-cols-[160px_1fr] gap-y-2">
            <span className="text-xxs font-bold uppercase text-gray-500">Balance due</span>
            <span className="font-bold">$0.00</span>
            <span className="text-xxs font-bold uppercase text-gray-500">Payment preference</span>
            <span>Self Pay</span>
          </div>
          <button
            className="btn-orange mt-5"
            onClick={() => toast('Payment collection is not part of this demo')}
          >
            Collect payment
          </button>
        </section>
        <section className="pf-card p-5">
          <h3 className="font-bold">Payment history</h3>
          <p className="mt-2 text-pf-muted">No payments recorded for this patient.</p>
        </section>
      </div>
      <AdRail variant="updox" />
    </div>
  )
}
