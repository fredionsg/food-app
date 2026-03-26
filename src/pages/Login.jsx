import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-bark transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Leaf className="w-6 h-6 text-sage" />
          <h1 className="font-serif text-2xl font-semibold text-bark">Welcome back</h1>
        </div>
        <p className="text-stone mb-8">Log in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-error-light text-error text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-bark mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bark mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 bg-white border border-sand rounded-xl text-charcoal placeholder:text-stone-light focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-bark transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone">
          Don't have an account?{' '}
          <Link to="/signup" className="text-sage font-medium hover:text-sage-dark transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
