import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, UtensilsCrossed, Search, FileDown, Settings, LogOut, Leaf } from 'lucide-react'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/log-meal', icon: UtensilsCrossed, label: 'Log' },
  { to: '/check-meal', icon: Search, label: 'Check' },
  { to: '/export', icon: FileDown, label: 'Export' },
  { to: '/dietary-setup', icon: Settings, label: 'Diet' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-sand/50">
        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-sage" />
          <span className="font-serif text-xl font-semibold text-bark">can i eat that?</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-sage text-white shadow-sm'
                  : 'text-stone hover:bg-sand-light hover:text-bark'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone">Hi, {user?.first_name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone hover:text-terracotta transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 md:px-8 md:py-8">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-sand/50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200
                ${isActive ? 'text-sage' : 'text-stone-light'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-sage/10' : ''}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
