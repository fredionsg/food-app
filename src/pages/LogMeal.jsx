import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChipGroup from '../components/ChipGroup'
import TokenField from '../components/TokenField'
import Toast from '../components/Toast'
import { ChevronDown, Frown, Meh, Smile, SmilePlus, Zap, Leaf, Check } from 'lucide-react'

const CONTEXTS = ['Home-cooked', 'Takeout', 'Restaurant', 'Fast casual', 'Cafe', 'Work cafe', 'Street food', 'Travel', 'Potluck', 'Other']
const PREP_STYLES = ['Boiled', 'Baked', 'Stir-fried', 'Deep fried', 'Grilled', 'Steamed', 'Raw/Fresh']
const SUPPORTS = ['Digestive enzymes', 'Antihistamine', 'Peppermint tea', 'Ginger', 'Probiotic', 'Electrolyte drink', 'Breathing/relaxation']
const PORTIONS = [
  { value: 'nibbles', label: 'Nibbles' },
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'hearty', label: 'Hearty' },
  { value: 'large', label: 'Large' },
]
const REACTIONS = [
  { value: 'awful', icon: Frown, label: 'Awful', color: 'text-error' },
  { value: 'meh', icon: Meh, label: 'Uneasy', color: 'text-warning' },
  { value: 'neutral', icon: Smile, label: 'OK', color: 'text-bark-light' },
  { value: 'good', icon: SmilePlus, label: 'Good', color: 'text-sage' },
  { value: 'great', icon: Zap, label: 'Great', color: 'text-sage-dark' },
]

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// ── Collapsible Section ──
function Section({ title, number, open, onToggle, summary, children }) {
  return (
    <div className={`rounded-2xl border transition-all duration-300 ${open ? 'bg-white/60 backdrop-blur-sm border-sand/50 shadow-sm' : 'bg-white/30 border-sand/20'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 cursor-pointer group"
        aria-expanded={open}
      >
        <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${open ? 'bg-terracotta text-white' : summary ? 'bg-sage/15 text-sage' : 'bg-sand-light text-stone-light'}`}>
          {summary && !open ? <Check className="w-3.5 h-3.5" /> : number}
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className={`text-sm font-semibold transition-colors ${open ? 'text-bark' : 'text-stone'}`}>{title}</span>
          {!open && summary && (
            <p className="text-xs text-stone-light mt-0.5 truncate">{summary}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-light transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="section-collapse" data-open={open}>
        <div className="section-inner">
          <div className="px-5 pb-5 pt-1 space-y-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LogMeal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [openSections, setOpenSections] = useState({ 1: true, 2: false, 3: false, 4: false, 5: false })
  const hasAutoOpened = useRef(false)

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

  // Smart auto-open: when meal name is filled, open section 2
  useEffect(() => {
    if (form.meal_name.trim().length >= 3 && !hasAutoOpened.current) {
      hasAutoOpened.current = true
      setOpenSections((s) => ({ ...s, 2: true }))
    }
  }, [form.meal_name])

  const set = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggle = (n) => () =>
    setOpenSections((s) => ({ ...s, [n]: !s[n] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.meal_name.trim() || !form.meal_time) {
      setToast({ message: 'Meal name and time are required', type: 'error' })
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
      setToast({ message: 'Meal logged successfully', type: 'success' })
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // ── Section summaries ──
  const summaries = {
    2: [
      ...form.contexts,
      ...form.preparation_styles,
    ].join(', ') || null,
    3: [
      ...form.triggers.map((t) => t),
      ...form.supports.map((s) => s),
    ].join(', ') || null,
    4: [
      form.portion_size && PORTIONS.find((p) => p.value === form.portion_size)?.label,
      form.reaction && REACTIONS.find((r) => r.value === form.reaction)?.label,
    ].filter(Boolean).join(', ') || null,
    5: form.notes?.trim() ? (form.notes.length > 50 ? form.notes.slice(0, 50) + '...' : form.notes) : null,
  }

  // Count filled sections
  const filledCount = [
    form.meal_name.trim(),
    summaries[2],
    summaries[3],
    summaries[4],
    summaries[5],
  ].filter(Boolean).length

  const inputClass = "w-full px-4 py-3.5 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200"

  const portionIndex = PORTIONS.findIndex((p) => p.value === form.portion_size)

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="animate-fade-up mb-6 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-widest text-terracotta mb-1">New entry</p>
          <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight">Log a meal</h1>
        </div>
        <Leaf className="w-10 h-10 text-sage/15 mt-1" strokeWidth={1} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Section 1: What did you eat? */}
        <Section title="What did you eat?" number={1} open={openSections[1]} onToggle={toggle(1)} summary={form.meal_name.trim() || null}>
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Meal name <span className="text-terracotta">*</span></label>
            <input value={form.meal_name} onChange={setField('meal_name')} required className={inputClass}
              placeholder="e.g. Chicken stir-fry" autoFocus />
          </div>
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Date & time <span className="text-terracotta">*</span></label>
            <input type="datetime-local" value={form.meal_time} onChange={setField('meal_time')} required className={inputClass} />
          </div>
        </Section>

        {/* Section 2: How was it made? */}
        <Section title="How was it made?" number={2} open={openSections[2]} onToggle={toggle(2)} summary={summaries[2]}>
          <ChipGroup label="Where / context" options={CONTEXTS} selected={form.contexts} onChange={set('contexts')} />
          <ChipGroup label="Preparation style" options={PREP_STYLES} selected={form.preparation_styles} onChange={set('preparation_styles')} />
        </Section>

        {/* Section 3: Anything to flag? */}
        <Section title="Anything to flag?" number={3} open={openSections[3]} onToggle={toggle(3)} summary={summaries[3]}>
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2.5">Possible triggers</label>
            {triggerOptions.length > 0 && (
              <ChipGroup options={triggerOptions} selected={form.triggers} onChange={set('triggers')} />
            )}
            <div className="mt-3">
              <TokenField tokens={form.triggers.filter(t => !triggerOptions.includes(t))}
                onChange={(newCustom) => {
                  const fromChips = form.triggers.filter(t => triggerOptions.includes(t))
                  set('triggers')([...fromChips, ...newCustom])
                }}
                placeholder="Add a custom trigger" />
            </div>
          </div>
          <ChipGroup label="Meds or supports used" options={SUPPORTS} selected={form.supports} onChange={set('supports')} />
        </Section>

        {/* Section 4: How much & how'd it go? */}
        <Section title="How much & how'd it go?" number={4} open={openSections[4]} onToggle={toggle(4)} summary={summaries[4]}>
          {/* Segmented portion bar */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">Portion size</label>
            <div className="flex rounded-2xl overflow-hidden border border-sand">
              {PORTIONS.map(({ value, label }, i) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('portion_size')(value)}
                  className={`flex-1 py-3 text-xs font-semibold transition-all duration-200 cursor-pointer relative
                    ${form.portion_size === value
                      ? 'bg-terracotta text-white'
                      : portionIndex >= 0 && i < portionIndex
                        ? 'bg-terracotta/15 text-terracotta'
                        : 'bg-white/50 text-stone hover:bg-sand-lighter'
                    }
                    ${i > 0 ? 'border-l border-sand/50' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reaction selector */}
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">How did you feel?</label>
            <div className="flex items-end justify-between gap-1 px-2">
              {REACTIONS.map(({ value, icon: Icon, label, color }) => {
                const isSelected = form.reaction === value
                const hasSomethingSelected = !!form.reaction
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('reaction')(value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-250 cursor-pointer flex-1
                      ${isSelected
                        ? 'scale-110 -translate-y-1'
                        : hasSomethingSelected ? 'opacity-40 hover:opacity-70' : 'hover:bg-sand-lighter'
                      }`}
                  >
                    <Icon className={`w-7 h-7 transition-all duration-200 ${isSelected ? color : 'text-stone-light'}`} strokeWidth={isSelected ? 2.2 : 1.5} />
                    <span className={`text-[10px] font-semibold tracking-wide transition-colors ${isSelected ? 'text-bark' : 'text-stone-light'}`}>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </Section>

        {/* Section 5: Notes */}
        <Section title="Notes" number={5} open={openSections[5]} onToggle={toggle(5)} summary={summaries[5]}>
          <textarea value={form.notes} onChange={setField('notes')} rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Symptoms, cravings, anything worth noting..." />
        </Section>
      </form>

      {/* Floating submit bar */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-40 px-4 pb-3 pt-2 md:pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-parchment/90 backdrop-blur-xl rounded-2xl border border-sand/40 shadow-lg p-3 flex items-center gap-3">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2 pl-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      (n === 1 && form.meal_name.trim()) || summaries[n]
                        ? 'bg-sage w-3'
                        : 'bg-sand'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-stone-light font-medium">{filledCount}/5</span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !form.meal_name.trim()}
              className="flex-1 py-3.5 bg-terracotta text-white font-semibold rounded-xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-40 shadow-sm cursor-pointer text-sm"
            >
              {saving ? 'Saving...' : 'Log meal'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
