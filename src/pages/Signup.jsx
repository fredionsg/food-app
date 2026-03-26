import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import TokenField from '../components/TokenField'
import ChipGroup from '../components/ChipGroup'

const QUICK_CHOICES = ['Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Low-FODMAP', 'Nut-free', 'Dairy-free']
const SPICE_LEVELS = ['None', 'Mild', 'Medium', 'Hot']

export default function Signup() {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    dob: '', country: '', medical_notes: '',
    quick_choices: [], allergies: [], avoid: [], preferred: [],
    spice_level: '', special_notes: '',
  })

  const set = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: typeof value === 'function' ? value(f[field]) : value }))

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const validateStep1 = () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.dob || !form.country) {
      setError('Please fill in all required fields')
      return false
    }
    if (form.password.length < 10 || !/\d/.test(form.password) || !/[^a-zA-Z0-9]/.test(form.password)) {
      setError('Password must be 10+ characters with at least one number and one symbol')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (form.quick_choices.length === 0) { setError('Select at least one dietary label'); return false }
    if (form.allergies.length === 0) { setError('Add at least one allergy (or "None")'); return false }
    if (form.avoid.length === 0) { setError('Add at least one food to avoid (or "None")'); return false }
    if (form.preferred.length === 0) { setError('Add at least one preferred food'); return false }
    if (!form.spice_level) { setError('Select a spice level'); return false }
    return true
  }

  const nextStep = () => {
    setError('')
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateStep2()) return
    setLoading(true)
    try {
      await signup(form)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-bark transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Leaf className="w-6 h-6 text-sage" />
          <h1 className="font-serif text-2xl font-semibold text-bark">Create your profile</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8 mt-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${step >= s ? 'bg-sage text-white' : 'bg-sand-light text-stone'}`}>
                {s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-bark font-medium' : 'text-stone'}`}>
                {s === 1 ? 'Details' : 'Dietary'}
              </span>
              {s < 2 && <div className={`w-8 h-px ${step > 1 ? 'bg-sage' : 'bg-sand'}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-error-light text-error text-sm px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bark mb-2">First name</label>
                <input value={form.first_name} onChange={setField('first_name')} required
                  className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-2">Last name</label>
                <input value={form.last_name} onChange={setField('last_name')} required
                  className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">Email</label>
              <input type="email" value={form.email} onChange={setField('email')} required
                className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                placeholder="you@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={setField('password')} required
                  className="w-full px-4 py-3 pr-12 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                  placeholder="10+ chars, include number & symbol" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-bark transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bark mb-2">Date of birth</label>
                <input type="date" value={form.dob} onChange={setField('dob')} required
                  className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark mb-2">Country</label>
                <input value={form.country} onChange={setField('country')} required
                  className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                  placeholder="e.g. UK" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark mb-2">Medical notes <span className="text-stone font-normal">(optional)</span></label>
              <textarea value={form.medical_notes} onChange={setField('medical_notes')} rows={2}
                className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all resize-none"
                placeholder="Any health conditions worth noting..." />
            </div>

            <button onClick={nextStep}
              className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <ChipGroup label="Dietary labels" options={QUICK_CHOICES} selected={form.quick_choices} onChange={set('quick_choices')} />
            <TokenField label="Allergies" tokens={form.allergies} onChange={set('allergies')} placeholder="e.g. Peanuts, Shellfish" />
            <TokenField label="Foods to avoid" tokens={form.avoid} onChange={set('avoid')} placeholder="e.g. Red meat, MSG" />
            <TokenField label="Preferred / safe foods" tokens={form.preferred} onChange={set('preferred')} placeholder="e.g. Rice, Chicken" />
            <ChipGroup label="Spice level" options={SPICE_LEVELS} selected={form.spice_level} onChange={set('spice_level')} multi={false} />

            <div>
              <label className="block text-sm font-medium text-bark mb-2">Special notes <span className="text-stone font-normal">(optional)</span></label>
              <textarea value={form.special_notes} onChange={setField('special_notes')} rows={2}
                className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all resize-none"
                placeholder="Anything else about your diet..." />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="flex-1 py-3.5 text-bark font-medium rounded-2xl border border-sand hover:bg-sand-light transition-all cursor-pointer">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer">
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-stone">
          Already have an account?{' '}
          <Link to="/login" className="text-sage font-medium hover:text-sage-dark transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  )
}
