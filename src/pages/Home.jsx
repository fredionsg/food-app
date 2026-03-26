import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UtensilsCrossed, Search, FileDown, Settings, ArrowRight, Lightbulb } from 'lucide-react'
import { BranchDivider } from '../components/BotanicalAccent'

const actions = [
  {
    to: '/log-meal',
    icon: UtensilsCrossed,
    title: 'Log a meal',
    desc: 'Record what you ate and how you felt',
    accent: 'card-accent-left',
    iconBg: 'bg-terracotta/10',
    iconColor: 'text-terracotta',
  },
  {
    to: '/check-meal',
    icon: Search,
    title: 'Check a meal',
    desc: 'Scan ingredients against your profile',
    accent: 'card-accent-sage',
    iconBg: 'bg-sage/10',
    iconColor: 'text-sage',
  },
  {
    to: '/export',
    icon: FileDown,
    title: 'Export profile',
    desc: 'Download your dietary info as a PDF',
    accent: 'card-accent-amber',
    iconBg: 'bg-amber/10',
    iconColor: 'text-amber',
  },
  {
    to: '/dietary-setup',
    icon: Settings,
    title: 'Dietary setup',
    desc: 'Update your allergies and preferences',
    accent: '',
    iconBg: 'bg-bark/8',
    iconColor: 'text-bark-light',
  },
]

export default function Home() {
  const { user } = useAuth()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="animate-fade-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-terracotta mb-1">{greeting}</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-bark tracking-tight">
          {user?.first_name}
        </h1>
        <p className="text-stone mt-1.5 font-light">What would you like to do today?</p>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {actions.map(({ to, icon: Icon, title, desc, accent, iconBg, iconColor }, i) => (
          <Link
            key={to}
            to={to}
            className={`animate-fade-up stagger-${i + 1} group flex items-center gap-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/40 hover:border-terracotta/20 hover:shadow-[var(--shadow-lifted)] transition-all duration-300 ${accent}`}
          >
            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-bark">{title}</h3>
              <p className="text-sm text-stone mt-0.5 font-light">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-sand group-hover:text-terracotta group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        ))}
      </div>

      <BranchDivider />

      {/* Tip card */}
      <div className="animate-fade-up stagger-6 bg-parchment/60 rounded-2xl p-6 border border-sand/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sage/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-terracotta/10 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-terracotta" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-semibold uppercase tracking-wide text-bark">Daily tip</span>
          </div>
          <p className="text-sm text-stone leading-relaxed font-light">
            Log meals consistently to build a clearer picture of your triggers. Even small snacks count — the more data, the better the insights.
          </p>
        </div>
      </div>
    </div>
  )
}
