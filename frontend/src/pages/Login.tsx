import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../lib/session'

/** Fake login — accepts anything and sets the client-side session. */
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('will.demo@demotest.com')
  const [password, setPassword] = useState('password')

  function submit(e: FormEvent) {
    e.preventDefault()
    login()
    navigate('/home')
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[#f4f4f4]">
      <div className="w-[420px] rounded-sm border border-gray-300 bg-white p-10 shadow">
        <div className="mb-8 flex items-center justify-center gap-3">
          <svg viewBox="0 0 40 40" className="h-12 w-12">
            <polygon points="8,6 32,14 8,22" fill="#29abe2" />
            <polygon points="8,20 32,28 8,36" fill="#0076c0" />
          </svg>
          <span className="text-2xl font-light text-pf-topbar">
            practice <span className="font-bold">fusion</span>
          </span>
        </div>
        <h1 className="mb-6 text-center text-lg font-bold text-pf-text">
          Sign in to your EHR
        </h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="pf-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="pf-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="pf-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="pf-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-orange w-full py-2 text-[14px]">
            Sign in
          </button>
          <p className="text-center text-xxs text-pf-muted">
            Demo build — any credentials work.
          </p>
        </form>
      </div>
    </div>
  )
}
