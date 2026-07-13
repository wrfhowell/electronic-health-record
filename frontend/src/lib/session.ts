const KEY = 'pf-session'

export const SESSION_USER = 'Will Demo'
export const SESSION_PRACTICE = 'Will Demo Practice'

export function isLoggedIn(): boolean {
  return localStorage.getItem(KEY) === 'true'
}

export function login(): void {
  localStorage.setItem(KEY, 'true')
}

export function logout(): void {
  localStorage.removeItem(KEY)
}
