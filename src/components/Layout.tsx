import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-900">Discovery Tool</span>
            <nav className="flex gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Organizations
              </NavLink>
              <NavLink to="/contacts" className={navLinkClass}>
                Contacts
              </NavLink>
              <NavLink to="/discovery-notes" className={navLinkClass}>
                Discovery Notes
              </NavLink>
              <NavLink to="/pain-points" className={navLinkClass}>
                Pain Points
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{user?.email}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
