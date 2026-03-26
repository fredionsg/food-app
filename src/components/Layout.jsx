import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Home, UtensilsCrossed, Search, FileDown, Settings, LogOut, Sun, Moon } from 'lucide-react'
import LeafLogo from './LeafLogo'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/log-meal', icon: UtensilsCrossed, label: 'Log' },
  { to: '/check-meal', icon: Search, label: 'Check' },
  { to: '/export', icon: FileDown, label: 'Export' },
  { to: '/dietary-setup', icon: Settings, label: 'Diet' },
]

function ThemeToggle({ className = '' }) {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className={`option-bounce p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        dark
          ? 'bg-amber/15 text-amber hover:bg-amber/25'
          : 'bg-bark/5 text-bark-light hover:bg-bark/10'
      } ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="grain min-h-screen bg-cream flex flex-col transition-colors duration-300">
      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-parchment/60 backdrop-blur-md border-b border-sand/40 transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <LeafLogo className="w-7 h-7" />
          <span className="font-serif text-xl font-semibold text-bark tracking-tight">can i eat that?</span>
        </div>
        <nav className="flex items-center gap-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-bark text-cream shadow-sm'
                  : 'text-stone hover:bg-sand-light hover:text-bark'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-terracotta/15 flex items-center justify-center">
              <span className="text-xs font-semibold text-terracotta">{user?.first_name?.[0]}</span>
            </div>
            <span className="text-sm font-medium text-bark">{user?.first_name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-light hover:text-terracotta transition-colors cursor-pointer p-1"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-6 pb-28 md:pb-8 md:px-8 md:py-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-parchment/80 backdrop-blur-xl border-t border-sand/30 px-1 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
        <div className="flex justify-around py-1.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold transition-all duration-200
                ${isActive ? 'text-terracotta' : 'text-stone-light'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-2xl transition-all duration-200 ${isActive ? 'bg-terracotta/10' : ''}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className="tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* Mobile theme toggle as last nav item */}
          <ThemeToggle className="self-center" />
        </div>
      </nav>
    </div>
  )
}
