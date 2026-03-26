import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChipGroup from '../components/ChipGroup'
import TokenField from '../components/TokenField'
import Toast from '../components/Toast'
import { BranchDivider } from '../components/BotanicalAccent'
import { Frown, Meh, Smile, SmilePlus, Zap } from 'lucide-react'

const CONTEXTS = ['Home-cooked', 'Takeout', 'Restaurant', 'Fast casual', 'Cafe', 'Work cafe', 'Street food', 'Travel', 'Potluck', 'Other']
const PREP_STYLES = ['Boiled', 'Baked', 'Stir-fried', 'Deep fried', 'Grilled', 'Steamed', 'Raw/Fresh']
const SUPPORTS = ['Digestive enzymes', 'Antihistamine', 'Peppermint tea', 'Ginger', 'Probiotic', 'Electrolyte drink', 'Breathing/relaxation']
const PORTIONS = [
  { value: 'nibbles', label: 'Nibbles', desc: 'Just a taste' },
  { value: 'light', label: 'Light bite', desc: 'Small portion' },
  { value: 'regular', label: 'Regular', desc: 'Normal meal' },
  { value: 'hearty', label: 'Hearty', desc: 'Big serving' },
  { value: 'large', label: 'Large', desc: 'Very full' },
]
const REACTIONS = [
  { value: 'awful', icon: Frown, label: 'Awful', activeColor: 'bg-error/10 ring-error text-error' },
  { value: 'meh', icon: Meh, label: 'Uneasy', activeColor: 'bg-warning/10 ring-warning text-warning' },
  { value: 'neutral', icon: Smile, label: 'Neutral', activeColor: 'bg-sand ring-bark-light text-bark' },
  { value: 'good', icon: SmilePlus, label: 'Good', activeColor: 'bg-sage/10 ring-sage text-sage' },
  { value: 'great', icon: Zap, label: 'Great', activeColor: 'bg-sage/15 ring-sage-dark text-sage-dark' },
]

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function LogMeal() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

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

  const set = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

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

  const inputClass = "w-full px-4 py-3.5 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200"

  return (
    <div>
      <div className="animate-fade-up mb-8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-terracotta mb-1">New entry</p>
        <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight">Log a meal</h1>
        <p className="text-stone mt-1 font-light">Record what you ate and how it made you feel.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Basics section */}
        <div className="animate-fade-up stagger-1 space-y-5 bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-sand/30">
          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Meal name</label>
            <input value={form.meal_name} onChange={setField('meal_name')} required className={inputClass}
              placeholder="e.g. Chicken stir-fry" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Date & time</label>
            <input type="datetime-local" value={form.meal_time} onChange={setField('meal_time')} required className={inputClass} />
          </div>
        </div>

        {/* Context section */}
        <div className="animate-fade-up stagger-2 space-y-5">
          <ChipGroup label="Where / context" options={CONTEXTS} selected={form.contexts} onChange={set('contexts')} />
          <ChipGroup label="Preparation style" options={PREP_STYLES} selected={form.preparation_styles} onChange={set('preparation_styles')} />
        </div>

        <BranchDivider />

        {/* Triggers */}
        <div className="animate-fade-up stagger-3">
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

        <BranchDivider />

        {/* Portion size */}
        <div className="animate-fade-up stagger-4">
          <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">Portion size</label>
          <div className="grid grid-cols-5 gap-2">
            {PORTIONS.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => set('portion_size')(value)}
                className={`chip-press flex flex-col items-center p-3.5 rounded-2xl text-center transition-all duration-200 cursor-pointer border
                  ${form.portion_size === value
                    ? 'bg-terracotta text-white border-terracotta shadow-sm'
                    : 'bg-white/70 border-sand text-bark hover:border-terracotta-muted'}`}>
                <span className="text-xs font-semibold">{label}</span>
                <span className={`text-[10px] mt-0.5 font-light ${form.portion_size === value ? 'text-white/80' : 'text-stone-light'}`}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reaction */}
        <div className="animate-fade-up stagger-5">
          <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-3">How did you feel?</label>
          <div className="flex gap-2 justify-between">
            {REACTIONS.map(({ value, icon: Icon, label, activeColor }) => (
              <button key={value} type="button" onClick={() => set('reaction')(value)}
                className={`chip-press flex-1 flex flex-col items-center py-4 rounded-2xl transition-all duration-200 cursor-pointer border
                  ${form.reaction === value
                    ? `${activeColor} ring-2 border-transparent`
                    : 'bg-white/70 border-sand hover:border-terracotta-muted'}`}>
                <Icon className="w-6 h-6 mb-1.5" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold tracking-wide">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Notes</label>
          <textarea value={form.notes} onChange={setField('notes')} rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Symptoms, cravings, anything worth noting..." />
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer">
          {saving ? 'Saving...' : 'Log meal'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
