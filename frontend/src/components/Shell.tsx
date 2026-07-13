import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  HelpCircle,
  Home,
  Lock,
  LogOut,
  Mail,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react'

import { logout, SESSION_PRACTICE, SESSION_USER } from '../lib/session'
import { useChartTabs } from '../lib/chartTabs'
import { useToast } from './Toast'

const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/schedule/week', label: 'Schedule', icon: CalendarDays, match: '/schedule' },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/charts', label: 'Charts', icon: ClipboardList },
  { to: '/messages/inbox', label: 'Messages', icon: Mail, match: '/messages' },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

/** Sub-nav shown in the dark strip under the top bar, varies per section. */
function DarkBarTabs() {
  const { pathname } = useLocation()
  const { tabs, closeTab } = useChartTabs()
  const navigate = useNavigate()

  if (pathname.startsWith('/charts')) {
    const onList = pathname === '/charts'
    return (
      <div className="flex items-center gap-1">
        <Link
          to="/charts"
          className={`px-3 py-2 text-[13px] font-semibold ${
            onList ? 'text-pf-band' : 'text-white hover:text-pf-band'
          }`}
        >
          Patient lists
        </Link>
        {tabs.map((t) => {
          const active = pathname.startsWith(`/charts/patients/${t.patientId}`)
          return (
            <span
              key={t.patientId}
              className={`flex items-center gap-2 px-3 py-2 text-[13px] font-semibold ${
                active ? 'text-pf-band' : 'text-white'
              }`}
            >
              <Link to={`/charts/patients/${t.patientId}/summary`} className="hover:underline">
                {t.name}
              </Link>
              <button
                aria-label={`Close ${t.name}`}
                className="text-gray-400 hover:text-white"
                onClick={() => {
                  closeTab(t.patientId)
                  if (active) navigate('/charts')
                }}
              >
                <X size={13} />
              </button>
            </span>
          )
        })}
      </div>
    )
  }
  if (pathname.startsWith('/home')) {
    return (
      <div className="flex items-center">
        <span className="px-3 py-2 text-[13px] font-semibold text-pf-band">Dashboard</span>
        <span className="px-3 py-2 text-[13px] font-semibold text-white">Documents</span>
        <span className="px-3 py-2 text-[13px] font-semibold text-white">Directory</span>
      </div>
    )
  }
  if (pathname.startsWith('/tasks')) {
    return (
      <div className="flex items-center">
        <span className="px-3 py-2 text-[13px] font-semibold text-pf-band">Tasks</span>
        <span className="px-3 py-2 text-[13px] font-semibold text-white">Documents</span>
      </div>
    )
  }
  if (pathname.startsWith('/schedule')) {
    return <span className="px-3 py-2 text-[13px] font-semibold text-pf-band">Schedule</span>
  }
  return null
}

export default function Shell() {
  const navigate = useNavigate()
  const toast = useToast()
  const { pathname } = useLocation()

  return (
    <div className="flex h-full">
      {/* Left rail */}
      <nav className="flex w-20 shrink-0 flex-col bg-pf-rail">
        <Link to="/home" className="flex flex-col items-center gap-1 py-3">
          {/* practice fusion mark */}
          <svg viewBox="0 0 40 40" className="h-9 w-9">
            <polygon points="8,6 32,14 8,22" fill="#29abe2" />
            <polygon points="8,20 32,28 8,36" fill="#0076c0" />
          </svg>
          <span className="text-center text-xxs leading-tight text-pf-band">
            practice
            <br />
            fusion
          </span>
        </Link>
        <div className="mt-2 flex flex-col">
          {NAV.map(({ to, label, icon: Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active =
                  isActive || (match ? pathname.startsWith(match) : false)
                return `flex flex-col items-center gap-1 py-3.5 text-xxs ${
                  active
                    ? 'bg-pf-blue text-white'
                    : 'text-gray-400 hover:bg-neutral-800 hover:text-white'
                }`
              }}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-9 shrink-0 items-center justify-end bg-pf-topbar text-[13px] text-gray-200">
          <button
            className="flex h-full items-center gap-1.5 border-l border-neutral-600 px-4 hover:bg-neutral-700"
            onClick={() => toast('Help is not available in this demo')}
          >
            <HelpCircle size={14} /> Help <ChevronDown size={12} />
          </button>
          <div className="flex h-full items-center border-l border-neutral-600 px-4">
            <span className="font-bold text-white">{SESSION_USER}</span>
            <span className="mx-2 text-neutral-500">|</span>
            <span className="text-gray-300">{SESSION_PRACTICE}</span>
          </div>
          <button
            className="flex h-full items-center gap-1.5 border-l border-neutral-600 px-4 hover:bg-neutral-700"
            onClick={() => toast('Screen lock is not available in this demo')}
          >
            <Lock size={14} /> Lock
          </button>
          <button
            className="flex h-full items-center gap-1.5 border-l border-neutral-600 px-4 hover:bg-neutral-700"
            onClick={() => toast('Settings are not available in this demo')}
          >
            <Settings size={14} /> Settings
          </button>
          <button
            className="flex h-full items-center gap-1.5 border-l border-neutral-600 px-4 hover:bg-neutral-700"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut size={14} /> Log out
          </button>
        </header>

        {/* Dark sub-nav strip */}
        <div className="flex h-9 shrink-0 items-center bg-pf-rail px-2">
          <DarkBarTabs />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
