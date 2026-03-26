import { Link } from 'react-router-dom'
import { Leaf, ArrowRight } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sage/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center w-16 h-16 bg-sage/10 rounded-2xl">
          <Leaf className="w-8 h-8 text-sage" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-bark text-center mb-3">
          can i eat that?
        </h1>
        <p className="text-stone text-center text-lg max-w-sm mb-12">
          Track your meals, know your triggers, eat with confidence.
        </p>

        {/* Actions */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <Link
            to="/signup"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-3.5 text-bark font-medium rounded-2xl border border-sand hover:bg-sand-light transition-all duration-200"
          >
            Log in
          </Link>
        </div>

        {/* Features hint */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md w-full">
          {[
            { emoji: '📝', text: 'Log meals' },
            { emoji: '🔍', text: 'Check safety' },
            { emoji: '📋', text: 'Export prefs' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs text-stone font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
