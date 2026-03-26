import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import SwipeDeck from '../components/SwipeDeck'
import { Frown, Meh, Smile, SmilePlus, Zap, ArrowLeft, ArrowRight, Check, Utensils, Clock, MapPin, ChefHat, Gauge, Heart, AlertTriangle, Pill, StickyNote, Layers, ListChecks, X } from 'lucide-react'

// ── Data ──
const ALL_CONTEXTS = ['Home-cooked', 'Takeout', 'Restaurant', 'Fast casual', 'Cafe', 'Work cafe', 'Street food', 'Travel', 'Potluck']
const ALL_PREP_STYLES = ['Boiled', 'Baked', 'Stir-fried', 'Deep fried', 'Grilled', 'Steamed', 'Raw/Fresh']
const ALL_SUPPORTS = ['Digestive enzymes', 'Antihistamine', 'Peppermint tea', 'Ginger', 'Probiotic', 'Electrolyte drink', 'Breathing/relaxation']
const PORTIONS = [
  { value: 'nibbles', label: 'Nibbles', size: 'text-xl' },
  { value: 'light', label: 'Light bite', size: 'text-2xl' },
  { value: 'regular', label: 'Regular', size: 'text-3xl' },
  { value: 'hearty', label: 'Hearty', size: 'text-4xl' },
  { value: 'large', label: 'Large', size: 'text-5xl' },
]
const REACTIONS = [
  { value: 'awful', icon: Frown, label: 'Awful', bg: 'bg-error/10', ring: 'ring-error', text: 'text-error' },
  { value: 'meh', icon: Meh, label: 'Uneasy', bg: 'bg-warning/10', ring: 'ring-warning', text: 'text-warning' },
  { value: 'neutral', icon: Smile, label: 'OK', bg: 'bg-sand', ring: 'ring-bark-light', text: 'text-bark' },
  { value: 'good', icon: SmilePlus, label: 'Good', bg: 'bg-sage/10', ring: 'ring-sage', text: 'text-sage' },
  { value: 'great', icon: Zap, label: 'Great!', bg: 'bg-sage/15', ring: 'ring-sage-dark', text: 'text-sage-dark' },
]

const STEPS = [
  { id: 'name', title: 'What did you eat?', icon: Utensils, required: true, multi: false },
  { id: 'time', title: 'When?', icon: Clock, required: true, multi: false },
  { id: 'mode', title: 'How do you want to log?', icon: Layers, required: true, multi: false },
  { id: 'context', title: 'Where did you eat?', icon: MapPin, required: false, multi: true },
  { id: 'prep', title: 'How was it prepared?', icon: ChefHat, required: false, multi: true },
  { id: 'portion', title: 'How much did you eat?', icon: Gauge, required: false, multi: false },
  { id: 'reaction', title: "How'd you feel after?", icon: Heart, required: false, multi: false },
  { id: 'triggers', title: 'Notice any triggers?', icon: AlertTriangle, required: false, multi: true },
  { id: 'supports', title: 'Take anything for it?', icon: Pill, required: false, multi: true },
  { id: 'notes', title: 'Anything else to note?', icon: StickyNote, required: false, multi: false },
]

// ── Smart Suggestions ──
const MEAL_HINTS = [
  { words: ['coffee', 'latte', 'cappuccino', 'espresso', 'matcha', 'tea', 'chai'], contexts: ['Cafe', 'Work cafe'], preps: [] },
  { words: ['toast', 'eggs', 'omelette', 'omelet', 'cereal', 'porridge', 'oats', 'granola', 'pancake', 'waffle', 'smoothie', 'yogurt', 'yoghurt'], contexts: ['Home-cooked'], preps: ['Grilled', 'Boiled', 'Raw/Fresh'] },
  { words: ['sandwich', 'wrap', 'bagel', 'baguette', 'sub'], contexts: ['Home-cooked', 'Cafe', 'Fast casual'], preps: ['Raw/Fresh'] },
  { words: ['salad', 'poke', 'sushi', 'sashimi', 'ceviche'], contexts: ['Restaurant', 'Takeout'], preps: ['Raw/Fresh'] },
  { words: ['pizza', 'burger', 'fries', 'chips', 'nugget', 'hot dog', 'kebab', 'shawarma', 'doner'], contexts: ['Fast casual', 'Takeout', 'Street food'], preps: ['Deep fried', 'Grilled', 'Baked'] },
  { words: ['curry', 'dal', 'dhal', 'biryani', 'tikka', 'masala', 'naan', 'roti', 'samosa', 'bhaji'], contexts: ['Restaurant', 'Takeout', 'Home-cooked'], preps: ['Stir-fried', 'Boiled', 'Deep fried'] },
  { words: ['stir-fry', 'stir fry', 'noodle', 'ramen', 'pho', 'pad thai', 'lo mein', 'chow', 'wok', 'fried rice', 'dim sum', 'dumpling', 'spring roll'], contexts: ['Restaurant', 'Takeout', 'Street food'], preps: ['Stir-fried', 'Steamed', 'Deep fried'] },
  { words: ['pasta', 'spaghetti', 'penne', 'risotto', 'lasagna', 'gnocchi', 'ravioli'], contexts: ['Home-cooked', 'Restaurant'], preps: ['Boiled', 'Baked'] },
  { words: ['steak', 'roast', 'bbq', 'barbeque', 'barbecue', 'ribs', 'wings', 'grilled'], contexts: ['Restaurant', 'Home-cooked'], preps: ['Grilled', 'Baked'] },
  { words: ['soup', 'stew', 'broth', 'chowder', 'chili'], contexts: ['Home-cooked', 'Restaurant'], preps: ['Boiled'] },
  { words: ['cake', 'brownie', 'cookie', 'muffin', 'croissant', 'pastry', 'donut', 'doughnut', 'ice cream', 'gelato', 'dessert', 'chocolate'], contexts: ['Cafe', 'Home-cooked'], preps: ['Baked', 'Raw/Fresh'] },
  { words: ['fish', 'salmon', 'tuna', 'cod', 'prawn', 'shrimp'], contexts: ['Restaurant', 'Home-cooked'], preps: ['Grilled', 'Steamed', 'Baked'] },
  { words: ['takeout', 'takeaway', 'delivery', 'uber', 'deliveroo', 'just eat'], contexts: ['Takeout'], preps: [] },
  { words: ['canteen', 'cafeteria', 'work lunch', 'office'], contexts: ['Work cafe'], preps: [] },
  { words: ['travel', 'airport', 'train', 'flight'], contexts: ['Travel', 'Fast casual'], preps: [] },
  { words: ['potluck', 'party', 'buffet', 'gathering'], contexts: ['Potluck'], preps: [] },
]

function getSuggestions(mealName) {
  const lower = mealName.toLowerCase()
  const ctx = new Set(), prep = new Set()
  for (const h of MEAL_HINTS) {
    if (h.words.some((w) => lower.includes(w))) {
      h.contexts.forEach((c) => ctx.add(c))
      h.preps.forEach((p) => prep.add(p))
    }
  }
  if (ctx.size === 0) ctx.add('Home-cooked')
  if (prep.size === 0) prep.add('Grilled')
  return { contexts: [...ctx], preps: [...prep] }
}

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// ── Progress Ring ──
function ProgressRing({ step, total }) {
  const r = 18, c = 2 * Math.PI * r, offset = c - (step / total) * c
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" className="absolute">
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--sand)" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="var(--terracotta)" strokeWidth="3"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          className="progress-ring-circle" />
      </svg>
      <span className="text-xs font-bold text-bark">{step}/{total}</span>
    </div>
  )
}

// ── Auto-advance bar (shows after first tap on multi-select) ──
function AutoAdvanceBar({ onGo, onCancel, seconds = 2 }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const interval = setInterval(() => setRemaining((r) => r - 0.05), 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (remaining <= 0) onGo()
  }, [remaining, onGo])

  const progress = Math.max(0, remaining / seconds)

  return (
    <div className="animate-fade-up fixed bottom-20 md:bottom-6 inset-x-0 z-40 px-4">
      <div className="max-w-md mx-auto bg-bark/90 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        {/* Progress shrink bar */}
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-terracotta rounded-full transition-none" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="text-white/70 text-xs font-medium shrink-0">Moving on...</span>
        <button type="button" onClick={onCancel}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer">
          <X className="w-3.5 h-3.5" /> Wait
        </button>
      </div>
    </div>
  )
}

// ── Celebration ──
function Celebration({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream card-flow-enter">
      <div className="relative mb-8">
        {['🌿', '🍃', '✨', '🌱', '🍂'].map((emoji, i) => (
          <span key={i} className="absolute text-2xl" style={{
            left: `${Math.cos(i * 1.26) * 50}px`, top: `${Math.sin(i * 1.26) * 50}px`,
            animation: `confetti-burst 1.5s ${i * 0.1}s cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}>{emoji}</span>
        ))}
        <div className="pop-in w-20 h-20 rounded-full bg-sage/15 flex items-center justify-center">
          <Check className="w-10 h-10 text-sage" strokeWidth={3} />
        </div>
      </div>
      <h2 className="pop-in font-serif text-2xl font-semibold text-bark" style={{ animationDelay: '150ms' }}>Meal logged!</h2>
      <p className="pop-in text-stone font-light mt-2" style={{ animationDelay: '250ms' }}>Nice one. Keep it up.</p>
    </div>
  )
}

export default function LogMeal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [mode, setMode] = useState(null) // 'swipe' | 'tap'
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [done, setDone] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [suggestionsApplied, setSuggestionsApplied] = useState(false)
  const [swipePhase, setSwipePhase] = useState(0)
  const inputRef = useRef(null)
  const topRef = useRef(null)

  const [form, setForm] = useState({
    meal_name: '', meal_time: nowLocal(),
    contexts: [], preparation_styles: [], triggers: [], supports: [],
    portion_size: '', reaction: '', notes: '',
  })

  const [triggerOptions, setTriggerOptions] = useState([])

  useEffect(() => {
    if (user) {
      const items = [...(user.allergies || []), ...(user.avoid || [])]
      setTriggerOptions([...new Set(items)])
    }
  }, [user])

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setAutoAdvance(false)
  }, [step])

  useEffect(() => {
    const s = STEPS[step]
    if (s && (s.id === 'name' || s.id === 'notes')) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [step])

  // Apply pre-selections when entering tap mode
  useEffect(() => {
    if (mode === 'tap' && !suggestionsApplied && form.meal_name.trim()) {
      const s = getSuggestions(form.meal_name)
      setForm((f) => ({ ...f, contexts: s.contexts, preparation_styles: s.preps, portion_size: 'regular' }))
      setSuggestionsApplied(true)
    }
  }, [mode, suggestionsApplied, form.meal_name])

  const suggestions = getSuggestions(form.meal_name)
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const goNext = useCallback(() => {
    setDirection('forward')
    setAutoAdvance(false)
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else handleSubmit()
  }, [step])

  const goBack = () => {
    setAutoAdvance(false)
    if (mode === 'swipe' && swipePhase > 0) { setSwipePhase((p) => p - 1); return }
    if (mode === 'swipe' && swipePhase === 0) { setMode(null); setStep(2); return }
    if (step > 0) { setDirection('back'); setStep((s) => s - 1) }
    // If at step 3 (context) and going back, reset mode
    if (step === 3 && mode) { setMode(null); setStep(2) }
  }

  const selectMode = (m) => {
    setMode(m)
    if (m === 'tap') { setStep(3); setDirection('forward') }
    if (m === 'swipe') setSwipePhase(0)
  }

  const handleSubmit = async () => {
    if (!form.meal_name.trim()) { setToast({ message: 'Meal name is required', type: 'error' }); setStep(0); return }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to log meal') }
      setDone(true)
    } catch (err) { setToast({ message: err.message, type: 'error' }) }
    finally { setSaving(false) }
  }

  // Single-select: pick and auto-advance
  const selectSingle = (field, value) => {
    set(field)(value)
    setTimeout(goNext, 500)
  }

  // Multi-select: toggle and trigger auto-advance bar
  const toggleMulti = (field, value) => {
    setForm((f) => {
      const arr = f[field]
      return { ...f, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
    setAutoAdvance(true)
  }

  const handleNameKeyDown = (e) => { if (e.key === 'Enter' && form.meal_name.trim()) { e.preventDefault(); goNext() } }
  const handleNotesKeyDown = (e) => { if (e.key === 'Enter' && e.metaKey) { e.preventDefault(); goNext() } }

  // ── Swipe decks ──
  const swipeDecks = [
    { title: 'Where did you eat?', cards: ALL_CONTEXTS.map((c) => ({ id: `ctx-${c}`, label: c, category: 'Context', suggested: suggestions.contexts.includes(c) })) },
    { title: 'How was it prepared?', cards: ALL_PREP_STYLES.map((p) => ({ id: `prep-${p}`, label: p, category: 'Preparation', suggested: suggestions.preps.includes(p) })) },
    ...(triggerOptions.length > 0 ? [{ title: 'Notice any triggers?', cards: triggerOptions.map((t) => ({ id: `trig-${t}`, label: t, category: 'Trigger', suggested: false })) }] : []),
    { title: 'Take anything for it?', cards: ALL_SUPPORTS.map((s) => ({ id: `sup-${s}`, label: s, category: 'Support', suggested: false })) },
  ]

  const handleSwipeDone = (selected) => {
    const fields = ['contexts', 'preparation_styles', ...(triggerOptions.length > 0 ? ['triggers'] : []), 'supports']
    const field = fields[swipePhase]
    if (field) setForm((f) => ({ ...f, [field]: selected }))
    if (swipePhase < swipeDecks.length - 1) { setSwipePhase((p) => p + 1) }
    else { setMode('tap'); setForm((f) => ({ ...f, portion_size: 'regular' })); setStep(5) } // jump to portion
  }

  if (done) return <Celebration onDone={() => navigate('/home')} />

  // ── Swipe mode render ──
  if (mode === 'swipe' && swipePhase < swipeDecks.length) {
    const deck = swipeDecks[swipePhase]
    return (
      <div className="min-h-[70vh] flex flex-col">
        <div ref={topRef} />
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-terracotta transition-colors cursor-pointer p-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <ProgressRing step={3 + swipePhase + 1} total={STEPS.length} />
        </div>
        <div className="card-flow-enter">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-terracotta" strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-bark tracking-tight">{deck.title}</h1>
          </div>
          <SwipeDeck key={`deck-${swipePhase}`} cards={deck.cards} onComplete={handleSwipeDone} />
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  // ── Tap mode / pre-mode render ──
  const currentStepDef = STEPS[step]
  const StepIcon = currentStepDef?.icon || Utensils
  const isLast = step === STEPS.length - 1
  const showBottomActions = currentStepDef?.id !== 'mode'

  return (
    <div className="min-h-[70vh] flex flex-col">
      <div ref={topRef} />

      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={step === 0 ? () => navigate('/home') : goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-terracotta transition-colors cursor-pointer p-1">
          <ArrowLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <ProgressRing step={step + 1} total={STEPS.length} />
      </div>

      <div className="flex-1 flex flex-col" key={`step-${step}-${direction}`}>
        <div className={direction === 'forward' ? 'card-flow-enter' : 'card-flow-enter-back'}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-terracotta" strokeWidth={1.8} />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-bark tracking-tight">{currentStepDef?.title}</h1>
          </div>

          <div className="flex-1">

            {/* NAME */}
            {currentStepDef?.id === 'name' && (
              <div className="space-y-4">
                <input ref={inputRef} value={form.meal_name} onChange={(e) => set('meal_name')(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className="w-full px-5 py-5 bg-white/60 border-2 border-sand/50 rounded-2xl text-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:border-terracotta-muted transition-all duration-200"
                  placeholder="e.g. Chicken stir-fry" autoFocus />
                <p className="text-xs text-stone-light text-center">Press Enter to continue</p>
              </div>
            )}

            {/* TIME */}
            {currentStepDef?.id === 'time' && (
              <div className="space-y-4">
                <button type="button" onClick={() => { set('meal_time')(nowLocal()); setTimeout(goNext, 300) }}
                  className="option-bounce w-full py-5 bg-terracotta/10 text-terracotta font-semibold rounded-2xl border-2 border-terracotta/20 hover:bg-terracotta/15 transition-all cursor-pointer text-lg">
                  Right now
                </button>
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-sand/50" />
                  <p className="relative text-center text-xs text-stone-light bg-cream px-3 mx-auto w-fit">or pick a time</p>
                </div>
                <input type="datetime-local" value={form.meal_time} onChange={(e) => set('meal_time')(e.target.value)}
                  className="w-full px-5 py-5 bg-white/60 border-2 border-sand/50 rounded-2xl text-charcoal focus:outline-none focus:border-terracotta-muted transition-all duration-200" />
              </div>
            )}

            {/* MODE SELECT */}
            {currentStepDef?.id === 'mode' && (
              <div className="space-y-3">
                <button type="button" onClick={() => selectMode('swipe')}
                  className="option-bounce w-full flex items-center gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-sand/40 hover:border-terracotta/30 hover:shadow-md transition-all cursor-pointer text-left">
                  <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center shrink-0">
                    <Layers className="w-7 h-7 text-terracotta" strokeWidth={1.8} />
                  </div>
                  <div>
                    <span className="block text-lg font-semibold text-bark">Swipe mode</span>
                    <span className="block text-sm text-stone font-light mt-0.5">Swipe right to include, left to skip</span>
                  </div>
                </button>
                <button type="button" onClick={() => selectMode('tap')}
                  className="option-bounce w-full flex items-center gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-sand/40 hover:border-sage/30 hover:shadow-md transition-all cursor-pointer text-left">
                  <div className="w-14 h-14 rounded-2xl bg-sage/10 flex items-center justify-center shrink-0">
                    <ListChecks className="w-7 h-7 text-sage" strokeWidth={1.8} />
                  </div>
                  <div>
                    <span className="block text-lg font-semibold text-bark">Tap mode</span>
                    <span className="block text-sm text-stone font-light mt-0.5">Tap to select with smart pre-fills</span>
                  </div>
                </button>
              </div>
            )}

            {/* CONTEXT (one question) */}
            {currentStepDef?.id === 'context' && (
              <div>
                <p className="text-xs text-stone-light mb-4">Pre-filled for "{form.meal_name}" — tap to adjust</p>
                <div className="flex flex-wrap gap-2.5">
                  {ALL_CONTEXTS.map((c) => (
                    <button key={c} type="button" onClick={() => toggleMulti('contexts', c)}
                      className={`option-bounce px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 cursor-pointer border
                        ${form.contexts.includes(c)
                          ? 'bg-terracotta text-white border-terracotta shadow-md'
                          : 'bg-white/70 text-bark border-sand/50 hover:border-terracotta-muted'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PREP (one question) */}
            {currentStepDef?.id === 'prep' && (
              <div>
                <p className="text-xs text-stone-light mb-4">Pre-filled for "{form.meal_name}" — tap to adjust</p>
                <div className="flex flex-wrap gap-2.5">
                  {ALL_PREP_STYLES.map((p) => (
                    <button key={p} type="button" onClick={() => toggleMulti('preparation_styles', p)}
                      className={`option-bounce px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 cursor-pointer border
                        ${form.preparation_styles.includes(p)
                          ? 'bg-terracotta text-white border-terracotta shadow-md'
                          : 'bg-white/70 text-bark border-sand/50 hover:border-terracotta-muted'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PORTION (one question, single select, auto-advance) */}
            {currentStepDef?.id === 'portion' && (
              <div className="flex flex-wrap justify-center gap-4 py-2">
                {PORTIONS.map(({ value, label, size }) => (
                  <button key={value} type="button" onClick={() => selectSingle('portion_size', value)}
                    className={`option-bounce flex flex-col items-center gap-2.5 w-24 py-5 rounded-2xl transition-all duration-200 cursor-pointer border-2
                      ${form.portion_size === value
                        ? 'bg-terracotta/10 border-terracotta scale-105'
                        : 'bg-white/50 border-transparent hover:border-sand'}`}>
                    <span className={`${size} leading-none`}>🍽</span>
                    <span className={`text-sm font-semibold ${form.portion_size === value ? 'text-terracotta' : 'text-stone'}`}>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* REACTION (one question, single select, auto-advance) */}
            {currentStepDef?.id === 'reaction' && (
              <div className="flex justify-center gap-3 py-2">
                {REACTIONS.map(({ value, icon: Icon, label, bg, ring, text }) => (
                  <button key={value} type="button" onClick={() => selectSingle('reaction', value)}
                    className={`option-bounce flex flex-col items-center gap-2.5 py-6 px-3 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[80px] border-2
                      ${form.reaction === value
                        ? `${bg} ${ring} ring-2 border-transparent scale-110 -translate-y-1`
                        : 'bg-white/50 border-transparent hover:bg-sand-lighter'}`}>
                    <Icon className={`w-9 h-9 ${form.reaction === value ? text : 'text-stone-light'}`}
                      strokeWidth={form.reaction === value ? 2.2 : 1.5} />
                    <span className={`text-xs font-bold tracking-wide ${form.reaction === value ? 'text-bark' : 'text-stone-light'}`}>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* TRIGGERS (one question) */}
            {currentStepDef?.id === 'triggers' && (
              <div>
                {triggerOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {triggerOptions.map((t) => (
                      <button key={t} type="button" onClick={() => toggleMulti('triggers', t)}
                        className={`option-bounce px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 cursor-pointer border
                          ${form.triggers.includes(t)
                            ? 'bg-terracotta text-white border-terracotta shadow-md'
                            : 'bg-white/70 text-bark border-sand/50 hover:border-terracotta-muted'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone text-center py-8">No triggers in your profile yet. You can add them in Dietary Setup.</p>
                )}
              </div>
            )}

            {/* SUPPORTS (one question) */}
            {currentStepDef?.id === 'supports' && (
              <div className="flex flex-wrap gap-2.5">
                {ALL_SUPPORTS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleMulti('supports', s)}
                    className={`option-bounce px-5 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 cursor-pointer border
                      ${form.supports.includes(s)
                        ? 'bg-terracotta text-white border-terracotta shadow-md'
                        : 'bg-white/70 text-bark border-sand/50 hover:border-terracotta-muted'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* NOTES (one question) */}
            {currentStepDef?.id === 'notes' && (
              <div>
                <textarea ref={inputRef} value={form.notes} onChange={(e) => set('notes')(e.target.value)}
                  onKeyDown={handleNotesKeyDown} rows={4}
                  className="w-full px-5 py-5 bg-white/60 border-2 border-sand/50 rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:border-terracotta-muted transition-all duration-200 resize-none"
                  placeholder="Symptoms, cravings, anything worth noting..." />
                <p className="text-xs text-stone-light text-center mt-2">Press Cmd+Enter to finish</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-advance bar for multi-select steps */}
      {autoAdvance && currentStepDef?.multi && (
        <AutoAdvanceBar onGo={goNext} onCancel={() => setAutoAdvance(false)} />
      )}

      {/* Bottom actions */}
      {showBottomActions && !autoAdvance && (
        <div className="flex items-center gap-3 mt-8 pb-4">
          <button type="button"
            onClick={isLast ? handleSubmit : goNext}
            disabled={(step === 0 && !form.meal_name.trim()) || saving}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-semibold rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-sm
              ${isLast
                ? 'bg-sage text-white hover:bg-sage-dark'
                : 'bg-terracotta text-white hover:bg-terracotta-dark'}`}>
            {saving ? 'Saving...' : isLast ? (
              <><Check className="w-5 h-5" /> Log meal</>
            ) : (
              <>Next <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
