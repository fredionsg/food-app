import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChipGroup from '../components/ChipGroup'
import TokenField from '../components/TokenField'
import Toast from '../components/Toast'

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
  { value: 'awful', emoji: '😫', label: 'Awful' },
  { value: 'meh', emoji: '😕', label: 'Uneasy' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'great', emoji: '😄', label: 'Great' },
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
      setToast({ message: 'Meal logged!', type: 'success' })
      setTimeout(() => navigate('/home'), 1500)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-bark mb-1">Log a meal</h1>
      <p className="text-stone mb-6">Record what you ate and how it made you feel.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basics */}
        <div>
          <label className="block text-sm font-medium text-bark mb-2">Meal name</label>
          <input value={form.meal_name} onChange={setField('meal_name')} required
            className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
            placeholder="e.g. Chicken stir-fry" />
        </div>

        <div>
          <label className="block text-sm font-medium text-bark mb-2">Date & time</label>
          <input type="datetime-local" value={form.meal_time} onChange={setField('meal_time')} required
            className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all" />
        </div>

        <ChipGroup label="Where / context" options={CONTEXTS} selected={form.contexts} onChange={set('contexts')} />
        <ChipGroup label="Preparation style" options={PREP_STYLES} selected={form.preparation_styles} onChange={set('preparation_styles')} />

        {/* Triggers */}
        <div>
          <label className="block text-sm font-medium text-bark mb-2">Possible triggers</label>
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

        {/* Portion size */}
        <div>
          <label className="block text-sm font-medium text-bark mb-3">Portion size</label>
          <div className="grid grid-cols-5 gap-2">
            {PORTIONS.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => set('portion_size')(value)}
                className={`flex flex-col items-center p-3 rounded-xl text-center transition-all duration-200 cursor-pointer
                  ${form.portion_size === value
                    ? 'bg-sage text-white shadow-sm'
                    : 'bg-white border border-sand text-stone hover:border-sage-light'}`}>
                <span className="text-xs font-medium">{label}</span>
                <span className={`text-[10px] mt-0.5 ${form.portion_size === value ? 'text-white/70' : 'text-stone-light'}`}>{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reaction */}
        <div>
          <label className="block text-sm font-medium text-bark mb-3">How did you feel?</label>
          <div className="flex gap-2 justify-between">
            {REACTIONS.map(({ value, emoji, label }) => (
              <button key={value} type="button" onClick={() => set('reaction')(value)}
                className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${form.reaction === value
                    ? 'bg-sage/10 ring-2 ring-sage shadow-sm'
                    : 'bg-white border border-sand hover:border-sage-light'}`}>
                <span className="text-2xl mb-1">{emoji}</span>
                <span className="text-xs font-medium text-bark">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-bark mb-2">Notes</label>
          <textarea value={form.notes} onChange={setField('notes')} rows={3}
            className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all resize-none"
            placeholder="Symptoms, cravings, anything worth noting..." />
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer">
          {saving ? 'Saving...' : 'Log meal'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
