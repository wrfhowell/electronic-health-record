import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastItem {
  id: number
  text: string
  kind: 'info' | 'success' | 'error'
}

const ToastContext = createContext<(text: string, kind?: ToastItem['kind']) => void>(
  () => {},
)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const show = useCallback((text: string, kind: ToastItem['kind'] = 'info') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-sm px-4 py-2 text-white shadow-lg text-[13px] font-semibold ${
              t.kind === 'error'
                ? 'bg-red-600'
                : t.kind === 'success'
                  ? 'bg-green-700'
                  : 'bg-pf-topbar'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
