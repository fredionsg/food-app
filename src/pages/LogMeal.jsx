import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast from '../components/Toast'
import { Frown, Meh, Smile, SmilePlus, Zap, ArrowLeft, ArrowRight, SkipForward, Check, Leaf, Utensils, Clock, MapPin, ChefHat, Gauge, Heart, AlertTriangle, Pill, StickyNote } from 'lucide-react'

// ── Data ──
const CONTEXTS = ['Home-cooked', 'Takeout', 'Restaurant', 'Fast casual', 'Cafe', 'Work cafe', 'Street food', 'Travel', 'Potluck']
const PREP_STYLES = ['Boiled', 'Baked', 'Stir-fried', 'Deep fried', 'Grilled', 'Steamed', 'Raw/Fresh']
const SUPPORTS = ['Digestive enzymes', 'Antihistamine', 'Peppermint tea', 'Ginger', 'Probiotic', 'Electrolyte drink', 'Breathing/relaxation']
const PORTIONS = [
  { value: 'nibbles', label: 'Nibbles', size: 'text-lg' },
  { value: 'light', label: 'Light bite', size: 'text-xl' },
  { value: 'regular', label: 'Regular', size: 'text-2xl' },
  { value: 'hearty', label: 'Hearty', size: 'text-3xl' },
  { value: 'large', label: 'Large', size: 'text-4xl' },
]
const REACTIONS = [
  { value: 'awful', icon: Frown, label: 'Awful', bg: 'bg-error/10', ring: 'ring-error', text: 'text-error' },
  { value: 'meh', icon: Meh, label: 'Uneasy', bg: 'bg-warning/10', ring: 'ring-warning', text: 'text-warning' },
  { value: 'neutral', icon: Smile, label: 'OK', bg: 'bg-sand', ring: 'ring-bark-light', text: 'text-bark' },
  { value: 'good', icon: SmilePlus, label: 'Good', bg: 'bg-sage/10', ring: 'ring-sage', text: 'text-sage' },
  { value: 'great', icon: Zap, label: 'Great!', bg: 'bg-sage/15', ring: 'ring-sage-dark', text: 'text-sage-dark' },
]

const STEPS = [
  { id: 'name', title: 'What did you eat?', icon: Utensils, required: true },
  { id: 'time', title: 'When?', icon: Clock, required: true },
  { id: 'context', title: 'Where & how?', icon: MapPin, required: false },
  { id: 'portion', title: 'How much?', icon: Gauge, required: false },
  { id: 'reaction', title: "How'd you feel?", icon: Heart, required: false },
  { id: 'triggers', title: 'Anything to flag?', icon: AlertTriangle, required: false },
  { id: 'notes', title: 'Any notes?', icon: StickyNote, required: false },
]

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// ── Progress Ring ──
function ProgressRing({ step, total }) {
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (step / total) * c
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

// ── Tappable Chip (bouncy) ──
function TapChip({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`option-bounce px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer border
        ${active
          ? 'bg-terracotta text-white border-terracotta shadow-md scale-[1.02]'
          : 'bg-white/70 text-bark border-sand/50 hover:border-terracotta-muted active:bg-terracotta/5'
        }`}>
      {label}
    </button>
  )
}

// ── Celebration Screen ──
function Celebration({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] card-flow-enter">
      {/* Floating particles */}
      <div className="relative mb-8">
        {['🌿', '🍃', '✨', '🌱', '🍂'].map((emoji, i) => (
          <span key={i} className="absolute text-2xl"
            style={{
              left: `${Math.cos(i * 1.26) * 50}px`,
              top: `${Math.sin(i * 1.26) * 50}px`,
              animation: `confetti-burst 1.5s ${i * 0.1}s cubic-bezier(0.22, 1, 0.36, 1) both`,
            }}>
            {emoji}
          </span>
        ))}
        <div className="pop-in w-20 h-20 rounded-full bg-sage/15 flex items-center justify-center">
          <Check className="w-10 h-10 text-sage" strokeWidth={3} />
        </div>
      </div>
      <h2 className="pop-in font-serif text-2xl font-semibold text-bark" style={{ animationDelay: '150ms' }}>
        Meal logged!
      </h2>
      <p className="pop-in text-stone font-light mt-2" style={{ animationDelay: '250ms' }}>
        Nice one. Keep it up.
      </p>
    </div>
  )
}

export default function LogMeal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)

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

  // Auto-focus text inputs when step changes
  useEffect(() => {
    if (step === 0 || step === 6) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [step])

  const set = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const goNext = useCallback(() => {
    setDirection('forward')
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleSubmit()
    }
  }, [step])

  const goBack = () => {
    if (step > 0) {
      setDirection('back')
      setStep((s) => s - 1)
    }
  }

  const handleSubmit = async () => {
    if (!form.meal_name.trim()) {
      setToast({ message: 'Meal name is required', type: 'error' })
      setStep(0)
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to log meal')
      }
      setDone(true)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Auto-advance helper for single-select fields
  const selectAndAdvance = (field, value, delay = 400) => {
    set(field)(value)
    setTimeout(goNext, delay)
  }

  // Toggle for multi-select (no auto-advance)
  const toggleMulti = (field, value) => {
    setForm((f) => {
      const arr = f[field]
      return { ...f, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] }
    })
  }

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter' && form.meal_name.trim()) {
      e.preventDefault()
      goNext()
    }
  }

  const handleNotesKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      goNext()
    }
  }

  if (done) {
    return <Celebration onDone={() => navigate('/home')} />
  }

  const currentStep = STEPS[step]
  const StepIcon = currentStep.icon
  const isLast = step === STEPS.length - 1
  const cardKey = `step-${step}-${direction}`

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Top bar: back + progress */}
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={step === 0 ? () => navigate('/home') : goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-terracotta transition-colors cursor-pointer p-1">
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>
        <ProgressRing step={step + 1} total={STEPS.length} />
      </div>

      {/* Step card */}
      <div className="flex-1 flex flex-col" key={cardKey}>
        <div className={direction === 'forward' ? 'card-flow-enter' : 'card-flow-enter-back'}>
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-terracotta/10 flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-terracotta" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-bark tracking-tight">{currentStep.title}</h1>
              {currentStep.required && <span className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">Required</span>}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1">
            {step === 0 && (
              <div className="space-y-4">
                <input ref={inputRef} value={form.meal_name} onChange={(e) => set('meal_name')(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  className="w-full px-5 py-4 bg-white/60 border-2 border-sand/50 rounded-2xl text-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:border-terracotta-muted transition-all duration-200"
                  placeholder="e.g. Chicken stir-fry" autoFocus />
                <p className="text-xs text-stone-light text-center">Press Enter to continue</p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <button type="button"
                  onClick={() => { set('meal_time')(nowLocal()); setTimeout(goNext, 300); }}
                  className="option-bounce w-full py-4 bg-terracotta/10 text-terracotta font-semibold rounded-2xl border-2 border-terracotta/20 hover:bg-terracotta/15 transition-all cursor-pointer text-lg">
                  Right now
                </button>
                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-sand/50" />
                  <p className="relative text-center text-xs text-stone-light bg-cream px-3 mx-auto w-fit">or pick a time</p>
                </div>
                <input type="datetime-local" value={form.meal_time}
                  onChange={(e) => set('meal_time')(e.target.value)}
                  className="w-full px-5 py-4 bg-white/60 border-2 border-sand/50 rounded-2xl text-charcoal focus:outline-none focus:border-terracotta-muted transition-all duration-200" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">Where?</p>
                  <div className="flex flex-wrap gap-2">
                    {CONTEXTS.map((c) => (
                      <TapChip key={c} label={c} active={form.contexts.includes(c)}
                        onClick={() => toggleMulti('contexts', c)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">How was it prepared?</p>
                  <div className="flex flex-wrap gap-2">
                    {PREP_STYLES.map((p) => (
                      <TapChip key={p} label={p} active={form.preparation_styles.includes(p)}
                        onClick={() => toggleMulti('preparation_styles', p)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-wrap justify-center gap-4 py-4">
                {PORTIONS.map(({ value, label, size }) => (
                  <button key={value} type="button"
                    onClick={() => selectAndAdvance('portion_size', value)}
                    className={`option-bounce flex flex-col items-center gap-2 w-20 py-4 rounded-2xl transition-all duration-200 cursor-pointer border-2
                      ${form.portion_size === value
                        ? 'bg-terracotta/10 border-terracotta scale-105'
                        : 'bg-white/50 border-transparent hover:border-sand'}`}>
                    <span className={`${size} leading-none`}>🍽</span>
                    <span className={`text-xs font-semibold ${form.portion_size === value ? 'text-terracotta' : 'text-stone'}`}>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="flex justify-center gap-3 py-4">
                {REACTIONS.map(({ value, icon: Icon, label, bg, ring, text }) => (
                  <button key={value} type="button"
                    onClick={() => selectAndAdvance('reaction', value)}
                    className={`option-bounce flex flex-col items-center gap-2 py-5 px-3 rounded-2xl transition-all duration-200 cursor-pointer flex-1 max-w-[72px] border-2
                      ${form.reaction === value
                        ? `${bg} ${ring} ring-2 border-transparent scale-110 -translate-y-1`
                        : 'bg-white/50 border-transparent hover:bg-sand-lighter'}`}>
                    <Icon className={`w-8 h-8 ${form.reaction === value ? text : 'text-stone-light'}`}
                      strokeWidth={form.reaction === value ? 2.2 : 1.5} />
                    <span className={`text-[10px] font-bold tracking-wide ${form.reaction === value ? 'text-bark' : 'text-stone-light'}`}>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                {triggerOptions.length > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">Known triggers</p>
                    <div className="flex flex-wrap gap-2">
                      {triggerOptions.map((t) => (
                        <TapChip key={t} label={t} active={form.triggers.includes(t)}
                          onClick={() => toggleMulti('triggers', t)} />
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">Meds or supports?</p>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTS.map((s) => (
                      <TapChip key={s} label={s} active={form.supports.includes(s)}
                        onClick={() => toggleMulti('supports', s)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <textarea ref={inputRef} value={form.notes} onChange={(e) => set('notes')(e.target.value)}
                  onKeyDown={handleNotesKeyDown}
                  rows={4}
                  className="w-full px-5 py-4 bg-white/60 border-2 border-sand/50 rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:border-terracotta-muted transition-all duration-200 resize-none"
                  placeholder="Symptoms, cravings, anything worth noting..." />
                <p className="text-xs text-stone-light text-center mt-2">Press Cmd+Enter to finish</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-3 mt-8 pb-4">
        {!currentStep.required && (
          <button type="button" onClick={goNext}
            className="flex items-center gap-1.5 px-5 py-3.5 text-stone font-semibold rounded-2xl hover:bg-sand-lighter transition-all cursor-pointer">
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
        )}
        <button type="button"
          onClick={isLast ? handleSubmit : goNext}
          disabled={step === 0 && !form.meal_name.trim() || saving}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-semibold rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-sm
            ${isLast
              ? 'bg-sage text-white hover:bg-sage-dark'
              : 'bg-terracotta text-white hover:bg-terracotta-dark'}`}>
          {saving ? 'Saving...' : isLast ? (
            <><Check className="w-4 h-4" /> Log meal</>
          ) : (
            <>Next <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
