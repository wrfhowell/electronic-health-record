import { useNavigate } from 'react-router-dom'
import {
  CircleDollarSign,
  FlaskConical,
  Landmark,
  Pill,
  ScanLine,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react'

import AdRail from '../components/AdRail'
import { useToast } from '../components/Toast'

import type { LucideIcon } from 'lucide-react'

interface CardDef {
  icon: LucideIcon
  title: string
  body: string
  video?: boolean
  cta: string
  ctaKind: 'orange' | 'blue'
  incomplete?: boolean
  bigIcon?: LucideIcon
  navigateTo?: string
}

const CARDS: CardDef[] = [
  {
    icon: CircleDollarSign,
    title: 'Your practice. Our purpose.',
    body: 'Subscribe to the Practice Fusion EHR, the leading cloud-based EHR for small practice physicians.',
    cta: 'Buy a subscription',
    ctaKind: 'orange',
  },
  {
    icon: Users,
    title: 'EHR users',
    body: 'Your EHR system will improve with more users',
    video: true,
    cta: 'Add your users',
    ctaKind: 'blue',
    incomplete: true,
  },
  {
    icon: FlaskConical,
    title: 'Labs',
    body: 'Send orders and receive results in your EHR',
    video: true,
    cta: 'Add your labs',
    ctaKind: 'blue',
    incomplete: true,
  },
  {
    icon: ScanLine,
    title: 'Imaging centers',
    body: 'Images and reports viewed in your EHR',
    video: true,
    cta: 'Connect imaging centers',
    ctaKind: 'blue',
    incomplete: true,
  },
  {
    icon: Pill,
    title: 'e-Prescribing',
    body: "Send prescriptions directly to a patient's preferred pharmacy",
    video: true,
    cta: 'Set up e-Prescribing',
    ctaKind: 'blue',
    incomplete: true,
  },
  {
    icon: Landmark,
    title: 'CPT codes license access',
    body: 'Get access to CPT code sets by purchasing a license from Optum360, an AMA authorized distributor',
    cta: 'Learn more',
    ctaKind: 'blue',
  },
  {
    icon: CircleDollarSign,
    title: 'Billing',
    body: 'Create and send superbills from your EHR',
    video: true,
    cta: 'Explore billing solutions',
    ctaKind: 'blue',
  },
  {
    icon: ShieldCheck,
    title: 'Insurance eligibility',
    body: 'Insurance eligibility is available for your practice, click here to learn more',
    cta: '',
    ctaKind: 'blue',
    bigIcon: ShieldCheck,
  },
  {
    icon: Settings,
    title: 'Settings',
    body: 'Manage personal and practice-level settings',
    cta: '',
    ctaKind: 'blue',
    bigIcon: Settings,
  },
]

export default function Home() {
  const toast = useToast()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      {/* Blue header band */}
      <div className="flex shrink-0 items-center justify-between bg-pf-band px-5 py-4">
        <h1 className="text-[26px] font-light text-white">Practice dashboard</h1>
        <div className="flex items-center gap-3 pr-2">
          <span className="flex items-center gap-1.5 text-xxs font-bold uppercase tracking-wide text-white">
            <Wrench size={12} /> Practice setup
          </span>
          <div className="h-4 w-56 border border-white/60 bg-[#eef3f5]">
            <div className="h-full w-[16%] bg-[#59b50c]" />
          </div>
          <span className="font-bold text-white">16%</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-2 overflow-y-auto p-4">
        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon
            const Big = card.bigIcon
            return (
              <div
                key={card.title}
                className="pf-card relative flex min-h-[230px] flex-col overflow-hidden p-5"
              >
                {card.incomplete && (
                  <div className="absolute -right-9 top-4 rotate-45 bg-pf-orange px-8 py-0.5 text-xxs font-bold uppercase text-white shadow">
                    Incomplete
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {!Big && (
                    <span className="flex h-9 w-9 items-center justify-center bg-pf-link text-white">
                      <Icon size={20} />
                    </span>
                  )}
                  <h2 className="text-[17px] font-bold text-pf-link">{card.title}</h2>
                </div>
                <p className="mt-3 leading-snug text-pf-text">{card.body}</p>
                {card.video && (
                  <button
                    className="pf-link mt-1 self-start text-[13px]"
                    onClick={() => toast('Video tutorials are not part of this demo')}
                  >
                    Video tutorial
                  </button>
                )}
                <div className="flex-1" />
                {Big && (
                  <Big size={56} className="mb-2 self-center text-pf-link" />
                )}
                {card.cta && (
                  <button
                    className={`${card.ctaKind === 'orange' ? 'btn-orange' : 'btn-blue'} w-full`}
                    onClick={() =>
                      card.navigateTo
                        ? navigate(card.navigateTo)
                        : toast(`"${card.cta}" is not available in this demo`)
                    }
                  >
                    {card.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <AdRail variant="updox" />
      </div>
    </div>
  )
}
