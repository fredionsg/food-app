import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TokenField from '../components/TokenField'
import ChipGroup from '../components/ChipGroup'
import Toast from '../components/Toast'

const QUICK_CHOICES = ['Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Low-FODMAP', 'Nut-free', 'Dairy-free']
const SPICE_LEVELS = ['None', 'Mild', 'Medium', 'Hot']

export default function DietarySetup() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    quick_choices: [], allergies: [], avoid: [], preferred: [],
    spice_level: '', special_notes: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        quick_choices: user.quick_choices || [],
        allergies: user.allergies || [],
        avoid: user.avoid || [],
        preferred: user.preferred || [],
        spice_level: user.spice_level || '',
        special_notes: user.special_notes || '',
      })
    }
  }, [user])

  const set = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      await refreshUser()
      setToast({ message: 'Dietary preferences updated', type: 'success' })
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-bark mb-1">Dietary setup</h1>
      <p className="text-stone mb-6">Update your allergies, preferences, and dietary needs.</p>

      <form onSubmit={handleSave} className="space-y-6">
        <ChipGroup label="Dietary labels" options={QUICK_CHOICES} selected={form.quick_choices} onChange={set('quick_choices')} />
        <TokenField label="Allergies" tokens={form.allergies} onChange={set('allergies')} placeholder="e.g. Peanuts, Shellfish" />
        <TokenField label="Foods to avoid" tokens={form.avoid} onChange={set('avoid')} placeholder="e.g. Red meat, MSG" />
        <TokenField label="Preferred / safe foods" tokens={form.preferred} onChange={set('preferred')} placeholder="e.g. Rice, Chicken" />
        <ChipGroup label="Spice level" options={SPICE_LEVELS} selected={form.spice_level} onChange={set('spice_level')} multi={false} />

        <div>
          <label className="block text-sm font-medium text-bark mb-2">Special notes</label>
          <textarea value={form.special_notes} onChange={(e) => setForm(f => ({ ...f, special_notes: e.target.value }))} rows={3}
            className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all resize-none"
            placeholder="Anything else about your diet..." />
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
