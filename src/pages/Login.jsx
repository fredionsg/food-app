import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import LeafLogo from '../components/LeafLogo'
import { OrganicBlob } from '../components/BotanicalAccent'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grain min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <OrganicBlob className="absolute -top-40 -right-40 w-[500px] h-[500px]" color="sage" />
      <OrganicBlob className="absolute -bottom-40 -left-40 w-[400px] h-[400px]" color="terracotta" />

      <div className="relative w-full max-w-sm">
        <Link to="/" className="animate-fade-up inline-flex items-center gap-1.5 text-sm font-medium text-stone hover:text-terracotta transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="animate-fade-up stagger-1">
          <LeafLogo className="w-10 h-10 mb-5" />
          <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight mb-1">Welcome back</h1>
          <p className="text-stone font-light mb-8">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up stagger-2">
          {error && (
            <div className="bg-error-light text-error text-sm px-4 py-3 rounded-2xl border border-error/10 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200"
              placeholder="Email or username"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 pr-12 bg-cream border border-sand rounded-2xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta-muted transition-all duration-200"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light hover:text-terracotta transition-colors cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="animate-fade-up stagger-3 mt-8 text-center text-sm text-stone">
          New here?{' '}
          <Link to="/signup" className="text-terracotta font-semibold hover:text-terracotta-dark transition-colors">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
