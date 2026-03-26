import { Link } from 'react-router-dom'
import { ArrowRight, Utensils, ShieldCheck, FileText } from 'lucide-react'
import LeafLogo from '../components/LeafLogo'
import { OrganicBlob, CornerVine } from '../components/BotanicalAccent'

const features = [
  { icon: Utensils, title: 'Log meals', desc: 'Track what you eat and how it affects you' },
  { icon: ShieldCheck, title: 'Check safety', desc: 'Scan ingredients against your profile' },
  { icon: FileText, title: 'Export prefs', desc: 'Share your dietary needs as a PDF' },
]

export default function Landing() {
  return (
    <div className="grain min-h-screen bg-cream flex flex-col relative overflow-hidden">
      {/* Organic background shapes */}
      <OrganicBlob className="absolute -top-32 -right-32 w-[500px] h-[500px]" color="sage" />
      <OrganicBlob className="absolute -bottom-48 -left-48 w-[600px] h-[600px]" color="terracotta" />
      <CornerVine position="top-right" />
      <CornerVine position="bottom-left" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Logo mark */}
        <div className="animate-fade-up mb-10">
          <div className="w-20 h-20 rounded-3xl bg-parchment border border-sand/60 flex items-center justify-center shadow-sm">
            <LeafLogo className="w-11 h-11" />
          </div>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up stagger-1 font-serif text-5xl md:text-6xl font-semibold text-bark tracking-tight text-center mb-4 leading-tight">
          can i eat that<span className="text-terracotta">?</span>
        </h1>
        <p className="animate-fade-up stagger-2 text-stone text-center text-lg md:text-xl max-w-md mb-14 font-light leading-relaxed">
          Track your meals, know your triggers,<br className="hidden sm:block" /> eat with confidence.
        </p>

        {/* Actions */}
        <div className="animate-fade-up stagger-3 w-full max-w-xs flex flex-col gap-3">
          <Link
            to="/signup"
            className="group flex items-center justify-center gap-2.5 w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-250 shadow-sm hover:shadow-md"
          >
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-4 text-bark font-semibold rounded-2xl border-2 border-sand hover:border-terracotta-muted hover:bg-parchment transition-all duration-200"
          >
            Log in
          </Link>
        </div>

        {/* Features */}
        <div className="animate-fade-up stagger-4 mt-20 w-full max-w-lg">
          <div className="grid grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`animate-fade-up stagger-${i + 4} flex flex-col items-center text-center p-4 rounded-2xl bg-parchment/50 border border-sand/30`}
              >
                <div className="w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-sage" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-bark mb-1">{title}</span>
                <span className="text-xs text-stone leading-relaxed hidden sm:block">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-terracotta/30 to-transparent" />
    </div>
  )
}
