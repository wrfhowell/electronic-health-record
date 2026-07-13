interface AdRailProps {
  variant?: 'updox' | 'staffing' | 'twitter' | 'imaging'
}

/** Static fake advertisement rail on the right side of every screen. */
export default function AdRail({ variant = 'updox' }: AdRailProps) {
  return (
    <div className="hidden w-[176px] shrink-0 xl:block">
      <div className="text-xxs text-gray-500 mb-0.5">Advertisement</div>
      {variant === 'updox' && (
        <div className="bg-[#0d2d52] text-white">
          <div className="px-4 pt-6 pb-3 text-2xl font-bold tracking-tight">
            updox<span className="align-super text-xxs font-normal"> by EverHealth</span>
          </div>
          <div className="mx-3 mb-3 rounded-lg bg-[#1467b3] px-4 py-6">
            <div className="text-xl font-bold leading-snug">
              Streamline Check-In. Reduce Paperwork.
            </div>
            <p className="mt-4 text-sm leading-snug">
              Digital forms that speed intake and eliminate bottlenecks.
            </p>
            <button className="mt-6 rounded bg-[#e8582a] px-4 py-2 font-bold">
              Learn More
            </button>
          </div>
          <div className="h-1.5 bg-cyan-300 mx-3 mb-4" />
        </div>
      )}
      {variant === 'staffing' && (
        <div className="border border-gray-300 bg-white px-4 py-6">
          <div className="mx-auto mb-6 flex h-24 w-20 items-center justify-center border-2 border-[#0d2d52] rounded">
            <div className="h-10 w-10 rounded-full bg-[#4a9fd8]" />
          </div>
          <div className="font-serif text-2xl leading-tight text-[#222]">
            Did you recently make staffing changes?
          </div>
          <p className="mt-4 text-sm leading-snug text-gray-700">
            Add, edit, and remove staff members by following a few simple steps.
          </p>
          <button className="mt-5 rounded bg-[#e8582a] px-4 py-2 font-bold text-white">
            Learn more
          </button>
        </div>
      )}
      {variant === 'twitter' && (
        <div className="bg-[#2b4a7d] px-4 py-8 text-white">
          <svg viewBox="0 0 24 24" className="mx-auto mb-8 h-20 w-20 fill-[#1d9bf0]">
            <path d="M23 4.9c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.5-1.9.9-2.9 1.1a4.5 4.5 0 0 0-7.7 4.1A12.8 12.8 0 0 1 2.5 3.7a4.5 4.5 0 0 0 1.4 6 4.4 4.4 0 0 1-2-.5v.1a4.5 4.5 0 0 0 3.6 4.4 4.5 4.5 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 1 18.6a12.7 12.7 0 0 0 6.9 2c8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.2-2.3z" />
          </svg>
          <div className="font-serif text-2xl leading-snug">Keep up on digital health</div>
          <p className="mt-4 text-sm">Follow us on Twitter.</p>
          <button className="mt-5 rounded bg-[#e8582a] px-4 py-2 font-bold">Follow us</button>
        </div>
      )}
      {variant === 'imaging' && (
        <div className="border border-gray-300 bg-white px-4 py-6">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded bg-[#0d2d52]">
            <div className="h-12 w-8 rounded-b-full border-4 border-[#4a9fd8]" />
          </div>
          <div className="font-serif text-xl leading-tight text-[#222]">
            Connect to over 200 imaging partners
          </div>
          <p className="mt-4 text-sm leading-snug text-gray-700">
            Access our large imaging partner database to request orders and receive
            reports within your current workflow.
          </p>
          <button className="mt-5 rounded bg-[#e8582a] px-4 py-2 font-bold text-white">
            Connect now
          </button>
        </div>
      )}
    </div>
  )
}
