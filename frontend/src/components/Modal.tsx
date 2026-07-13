import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: string
}

/** PF-style modal: blue title bar, white body, footer above a blue rule. */
export default function Modal({ title, onClose, children, footer, width = 'w-[490px]' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-24"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`${width} max-w-[95vw] bg-white shadow-2xl`}>
        <div className="flex items-center justify-between bg-pf-tab px-4 py-2.5">
          <h2 className="text-[15px] font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="border-t-2 border-pf-tab px-4 py-3 flex items-center justify-between">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
