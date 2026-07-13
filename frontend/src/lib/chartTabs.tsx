import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export interface ChartTab {
  patientId: number
  name: string
}

interface ChartTabsCtx {
  tabs: ChartTab[]
  openTab: (tab: ChartTab) => void
  closeTab: (patientId: number) => void
}

const Ctx = createContext<ChartTabsCtx>({
  tabs: [],
  openTab: () => {},
  closeTab: () => {},
})

export function useChartTabs() {
  return useContext(Ctx)
}

const KEY = 'pf-chart-tabs'

/** Open patient chart tabs shown in the dark bar, like "Patient lists | Steve DemoCardio x". */
export function ChartTabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<ChartTab[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    sessionStorage.setItem(KEY, JSON.stringify(tabs))
  }, [tabs])

  const openTab = useCallback((tab: ChartTab) => {
    setTabs((prev) => {
      const existing = prev.find((t) => t.patientId === tab.patientId)
      if (existing) {
        return existing.name === tab.name
          ? prev
          : prev.map((t) => (t.patientId === tab.patientId ? tab : t))
      }
      return [...prev, tab]
    })
  }, [])

  const closeTab = useCallback((patientId: number) => {
    setTabs((prev) => prev.filter((t) => t.patientId !== patientId))
  }, [])

  return <Ctx.Provider value={{ tabs, openTab, closeTab }}>{children}</Ctx.Provider>
}
