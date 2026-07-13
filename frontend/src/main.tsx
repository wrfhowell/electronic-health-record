import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import { ToastProvider } from './components/Toast'
import { ChartTabsProvider } from './lib/chartTabs'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ToastProvider>
          <ChartTabsProvider>
            <App />
          </ChartTabsProvider>
        </ToastProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>,
)
