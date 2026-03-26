import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import TokenField from '../components/TokenField'
import ChipGroup from '../components/ChipGroup'
import LeafLogo from '../components/LeafLogo'
import { OrganicBlob } from '../components/BotanicalAccent'

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

  const inputClass = "w-full px-4 py-3.5 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200"

  return (
    <div className="grain min-h-screen bg-cream flex flex-col items-center px-6 py-12 relative overflow-hidden">
      <OrganicBlob className="absolute -top-40 -left-40 w-[500px] h-[500px]" color="sage" />
      <OrganicBlob className="absolute -bottom-32 -right-32 w-[400px] h-[400px]" color="terracotta" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="animate-fade-up inline-flex items-center gap-1.5 text-sm font-medium text-stone hover:text-terracotta transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="animate-fade-up stagger-1">
          <LeafLogo className="w-10 h-10 mb-5" />
          <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight mb-1">Create your profile</h1>
          <p className="text-stone font-light mb-6">Tell us about your dietary needs</p>
        </div>

        {/* Step indicator */}
        <div className="animate-fade-up stagger-2 flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                ${step > s
                  ? 'bg-sage text-white'
                  : step === s
                    ? 'bg-terracotta text-white'
                    : 'bg-sand-light text-stone'
                }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-sm hidden sm:block ${step >= s ? 'text-bark font-semibold' : 'text-stone'}`}>
                {s === 1 ? 'Your details' : 'Dietary needs'}
              </span>
              {s < 2 && (
                <div className="flex-1 mx-2">
                  <div className={`h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-sage' : 'bg-sand'}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="animate-scale-in bg-error-light text-error text-sm px-4 py-3 rounded-2xl mb-6 border border-error/10 font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="animate-fade-up space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">First name</label>
                <input value={form.first_name} onChange={setField('first_name')} required className={inputClass} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Last name</label>
                <input value={form.last_name} onChange={setField('last_name')} required className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Email</label>
              <input type="email" value={form.email} onChange={setField('email')} required className={inputClass} placeholder="you@email.com" />
            </div>

            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={setField('password')} required
                  className={`${inputClass} pr-12`} placeholder="10+ chars, include number & symbol" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light hover:text-terracotta transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Date of birth</label>
                <input type="date" value={form.dob} onChange={setField('dob')} required className={inputClass} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Country</label>
                <input value={form.country} onChange={setField('country')} required className={inputClass} placeholder="e.g. UK" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">
                Medical notes <span className="normal-case font-normal tracking-normal text-stone-light">(optional)</span>
              </label>
              <textarea value={form.medical_notes} onChange={setField('medical_notes')} rows={2}
                className={`${inputClass} resize-none`} placeholder="Any health conditions worth noting..." />
            </div>

            <button onClick={nextStep}
              className="w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm cursor-pointer">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-fade-up space-y-6">
            <ChipGroup label="Dietary labels" options={QUICK_CHOICES} selected={form.quick_choices} onChange={set('quick_choices')} />
            <TokenField label="Allergies" tokens={form.allergies} onChange={set('allergies')} placeholder="e.g. Peanuts, Shellfish" />
            <TokenField label="Foods to avoid" tokens={form.avoid} onChange={set('avoid')} placeholder="e.g. Red meat, MSG" />
            <TokenField label="Preferred / safe foods" tokens={form.preferred} onChange={set('preferred')} placeholder="e.g. Rice, Chicken" />
            <ChipGroup label="Spice level" options={SPICE_LEVELS} selected={form.spice_level} onChange={set('spice_level')} multi={false} />

            <div>
              <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">
                Special notes <span className="normal-case font-normal tracking-normal text-stone-light">(optional)</span>
              </label>
              <textarea value={form.special_notes} onChange={setField('special_notes')} rows={2}
                className={`${inputClass} resize-none`} placeholder="Anything else about your diet..." />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep(1); setError('') }}
                className="flex-1 py-4 text-bark font-semibold rounded-2xl border-2 border-sand hover:border-terracotta-muted hover:bg-parchment transition-all cursor-pointer">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer">
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>
          </form>
        )}

        <p className="animate-fade-up stagger-5 mt-8 text-center text-sm text-stone">
          Already have an account?{' '}
          <Link to="/login" className="text-terracotta font-semibold hover:text-terracotta-dark transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
