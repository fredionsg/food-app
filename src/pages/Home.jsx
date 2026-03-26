import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UtensilsCrossed, Search, FileDown, Settings, ArrowRight, Sparkles } from 'lucide-react'

const actions = [
  {
    to: '/log-meal',
    icon: UtensilsCrossed,
    title: 'Log a meal',
    desc: 'Record what you ate and how you felt',
    color: 'bg-sage/10 text-sage',
  },
  {
    to: '/check-meal',
    icon: Search,
    title: 'Check a meal',
    desc: 'See if a meal fits your dietary needs',
    color: 'bg-terracotta/10 text-terracotta',
  },
  {
    to: '/export',
    icon: FileDown,
    title: 'Export profile',
    desc: 'Download your dietary info as a PDF',
    color: 'bg-clay/10 text-clay',
  },
  {
    to: '/dietary-setup',
    icon: Settings,
    title: 'Dietary setup',
    desc: 'Update your allergies and preferences',
    color: 'bg-olive/10 text-olive',
  },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-3xl font-semibold text-bark">
          Hi, {user?.first_name} 👋
        </h1>
        <p className="text-stone mt-1">What would you like to do today?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(({ to, icon: Icon, title, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-sand/50 hover:border-sage/30 hover:shadow-md transition-all duration-200"
          >
            <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-bark">{title}</h3>
                <ArrowRight className="w-4 h-4 text-stone-light group-hover:text-sage group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-stone mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Tip card */}
      <div className="bg-sand-lighter rounded-2xl p-5 border border-sand/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-terracotta" />
          <span className="text-sm font-medium text-bark">Quick tip</span>
        </div>
        <p className="text-sm text-stone leading-relaxed">
          Log meals consistently to build a clearer picture of your triggers. Even small snacks count — the more data, the better the insights.
        </p>
      </div>
    </div>
  )
}
