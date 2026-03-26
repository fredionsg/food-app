import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

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
      <h1 className="font-serif text-2xl font-semibold text-bark mb-1">Check a meal</h1>
      <p className="text-stone mb-6">Enter ingredients to check against your dietary profile.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-bark mb-2">
            Ingredients or meal description
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all resize-none"
            placeholder="e.g. chicken, peanuts, soy sauce, rice noodles&#10;(separate with commas or new lines)"
          />
        </div>

        <button
          onClick={checkMeal}
          disabled={!query.trim()}
          className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Check ingredients
        </button>
      </div>

      {results && (
        <div className="mt-8 space-y-4">
          {/* Overall verdict */}
          <div className={`p-4 rounded-2xl flex items-start gap-3 ${
            results.flagged.length > 0
              ? 'bg-red-50 border border-red-200'
              : results.avoided.length > 0
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-emerald-50 border border-emerald-200'
          }`}>
            {results.flagged.length > 0 ? (
              <>
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Contains allergens</p>
                  <p className="text-sm text-red-600 mt-0.5">This meal contains items from your allergy list. Avoid or find alternatives.</p>
                </div>
              </>
            ) : results.avoided.length > 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Contains items you avoid</p>
                  <p className="text-sm text-amber-600 mt-0.5">No allergens detected, but some ingredients are on your avoid list.</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800">Looks good!</p>
                  <p className="text-sm text-emerald-600 mt-0.5">No allergens or avoided items detected in this meal.</p>
                </div>
              </>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {results.flagged.length > 0 && (
              <ResultGroup
                icon={<XCircle className="w-4 h-4 text-red-500" />}
                label="Allergens found"
                items={results.flagged}
                chipClass="bg-red-50 text-red-700 border border-red-200"
              />
            )}
            {results.avoided.length > 0 && (
              <ResultGroup
                icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                label="On your avoid list"
                items={results.avoided}
                chipClass="bg-amber-50 text-amber-700 border border-amber-200"
              />
            )}
            {results.safe.length > 0 && (
              <ResultGroup
                icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
                label="Preferred / safe"
                items={results.safe}
                chipClass="bg-emerald-50 text-emerald-700 border border-emerald-200"
              />
            )}
            {results.unknown.length > 0 && (
              <ResultGroup
                icon={<Info className="w-4 h-4 text-stone" />}
                label="Not in your profile"
                items={results.unknown}
                chipClass="bg-sand-light text-stone border border-sand"
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
    <div className="bg-white rounded-xl p-4 border border-sand/50">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium text-bark">{label}</span>
        <span className="text-xs text-stone">({items.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`px-3 py-1 rounded-full text-sm ${chipClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
