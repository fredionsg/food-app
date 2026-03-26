import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, AlertTriangle, CheckCircle, XCircle, Info, ShieldCheck } from 'lucide-react'

export default function CheckMeal() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)

  const checkMeal = () => {
    if (!query.trim()) return

    const ingredients = query
      .toLowerCase()
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    const allergies = (user?.allergies || []).map((a) => a.toLowerCase())
    const avoid = (user?.avoid || []).map((a) => a.toLowerCase())
    const preferred = (user?.preferred || []).map((a) => a.toLowerCase())

    const flagged = []
    const avoided = []
    const safe = []
    const unknown = []

    for (const item of ingredients) {
      const isAllergy = allergies.some((a) => item.includes(a) || a.includes(item))
      const isAvoid = avoid.some((a) => item.includes(a) || a.includes(item))
      const isPreferred = preferred.some((p) => item.includes(p) || p.includes(item))

      if (isAllergy) flagged.push(item)
      else if (isAvoid) avoided.push(item)
      else if (isPreferred) safe.push(item)
      else unknown.push(item)
    }

    setResults({ flagged, avoided, safe, unknown })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      checkMeal()
    }
  }

  return (
    <div>
      <div className="animate-fade-up mb-8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-terracotta mb-1">Safety check</p>
        <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight">Check a meal</h1>
        <p className="text-stone mt-1 font-light">Enter ingredients to check against your dietary profile.</p>
      </div>

      <div className="animate-fade-up stagger-1 space-y-4">
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2.5">
            Ingredients or meal description
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full px-4 py-3.5 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200 resize-none"
            placeholder={"e.g. chicken, peanuts, soy sauce, rice noodles\n(separate with commas or new lines)"}
          />
        </div>

        <button
          onClick={checkMeal}
          disabled={!query.trim()}
          className="w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-40 shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" strokeWidth={2} />
          Check ingredients
        </button>
      </div>

      {results && (
        <div className="mt-10 space-y-4 animate-fade-up">
          {/* Overall verdict */}
          <div className={`p-5 rounded-2xl flex items-start gap-4 border ${
            results.flagged.length > 0
              ? 'bg-error-light border-error/15'
              : results.avoided.length > 0
              ? 'bg-warning-light border-warning/15'
              : 'bg-success-light border-success/15'
          }`}>
            {results.flagged.length > 0 ? (
              <>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-error" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-bark">Contains allergens</p>
                  <p className="text-sm text-stone mt-0.5 font-light">This meal contains items from your allergy list. Avoid or find alternatives.</p>
                </div>
              </>
            ) : results.avoided.length > 0 ? (
              <>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-bark">Contains items you avoid</p>
                  <p className="text-sm text-stone mt-0.5 font-light">No allergens detected, but some ingredients are on your avoid list.</p>
                </div>
              </>
            ) : (
              <>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-sage/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-sage" strokeWidth={2} />
                </div>
                <div>
                  <p className="font-semibold text-bark">Looks good!</p>
                  <p className="text-sm text-stone mt-0.5 font-light">No allergens or avoided items detected in this meal.</p>
                </div>
              </>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {results.flagged.length > 0 && (
              <ResultGroup
                icon={<XCircle className="w-4 h-4 text-error" />}
                label="Allergens found"
                items={results.flagged}
                chipClass="bg-error-light text-error border border-error/15"
              />
            )}
            {results.avoided.length > 0 && (
              <ResultGroup
                icon={<AlertTriangle className="w-4 h-4 text-warning" />}
                label="On your avoid list"
                items={results.avoided}
                chipClass="bg-warning-light text-bark border border-warning/15"
              />
            )}
            {results.safe.length > 0 && (
              <ResultGroup
                icon={<CheckCircle className="w-4 h-4 text-sage" />}
                label="Preferred / safe"
                items={results.safe}
                chipClass="bg-success-light text-sage-dark border border-sage/15"
              />
            )}
            {results.unknown.length > 0 && (
              <ResultGroup
                icon={<Info className="w-4 h-4 text-stone" />}
                label="Not in your profile"
                items={results.unknown}
                chipClass="bg-sand-lighter text-stone border border-sand/50"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultGroup({ icon, label, items, chipClass }) {
  return (
    <div className="bg-surface-el rounded-2xl p-5 border border-sand/30">
      <div className="flex items-center gap-2.5 mb-3">
        {icon}
        <span className="text-sm font-semibold text-bark">{label}</span>
        <span className="text-xs text-stone-light font-medium">({items.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`px-3.5 py-1.5 rounded-xl text-sm font-medium ${chipClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
