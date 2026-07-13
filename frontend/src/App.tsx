import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import Shell from './components/Shell'
import { isLoggedIn } from './lib/session'
import Login from './pages/Login'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import PatientLists from './pages/charts/PatientLists'
import ChartLayout from './pages/charts/ChartLayout'
import Summary from './pages/charts/Summary'
import Timeline from './pages/charts/Timeline'
import Documents from './pages/charts/Documents'
import Profile from './pages/charts/Profile'
import Ledger from './pages/charts/Ledger'
import PaymentCollection from './pages/charts/PaymentCollection'
import EncounterView from './pages/charts/EncounterView'
import Tasks from './pages/Tasks'
import Messages from './pages/Messages'
import Reports from './pages/Reports'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/schedule/:view" element={<Schedule />} />
        <Route path="/charts" element={<PatientLists />} />
        <Route path="/charts/patients/:id" element={<ChartLayout />}>
          <Route index element={<Navigate to="summary" replace />} />
          <Route path="summary" element={<Summary />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="payment" element={<PaymentCollection />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="encounter/:encId" element={<EncounterView />} />
        </Route>
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/messages/:folder" element={<Messages />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  )
}
