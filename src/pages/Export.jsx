import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FileDown, Loader2, AlertCircle, User, Mail, Leaf, AlertTriangle, Heart, Flame, StickyNote } from 'lucide-react'

const fieldIcons = {
  Name: User,
  Email: Mail,
  'Dietary labels': Leaf,
  Allergies: AlertTriangle,
  Avoid: AlertTriangle,
  Preferred: Heart,
  'Spice level': Flame,
}

export default function Export() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/profile/export', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dietary-profile-${user?.first_name?.toLowerCase() || 'export'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const profileItems = [
    { label: 'Name', value: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() },
    { label: 'Email', value: user?.email },
    { label: 'Dietary labels', value: user?.quick_choices?.join(', ') },
    { label: 'Allergies', value: user?.allergies?.join(', ') },
    { label: 'Avoid', value: user?.avoid?.join(', ') },
    { label: 'Preferred', value: user?.preferred?.join(', ') },
    { label: 'Spice level', value: user?.spice_level },
  ].filter((item) => item.value)

  return (
    <div>
      <div className="animate-fade-up mb-8">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-terracotta mb-1">Share</p>
        <h1 className="font-serif text-3xl font-semibold text-bark tracking-tight">Export profile</h1>
        <p className="text-stone mt-1 font-light">Download your dietary information as a PDF to share with restaurants, hosts, or healthcare providers.</p>
      </div>

      {/* Preview card */}
      <div className="animate-fade-up stagger-1 bg-white/60 backdrop-blur-sm rounded-2xl border border-sand/40 p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-terracotta via-sage to-amber" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-stone mb-5 mt-1">Profile preview</h2>
        <div className="space-y-4">
          {profileItems.map(({ label, value }) => {
            const Icon = fieldIcons[label] || StickyNote
            return (
              <div key={label} className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-parchment flex items-center justify-center mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-bark-light" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-light">{label}</span>
                  <span className="block text-sm text-charcoal mt-0.5 leading-relaxed">{value}</span>
                </div>
              </div>
            )
          })}
          {user?.special_notes && (
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-parchment flex items-center justify-center mt-0.5">
                <StickyNote className="w-3.5 h-3.5 text-bark-light" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-stone-light">Notes</span>
                <span className="block text-sm text-charcoal mt-0.5 leading-relaxed">{user.special_notes}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="animate-scale-in flex items-center gap-2.5 bg-error-light text-error text-sm px-4 py-3.5 rounded-2xl mb-5 border border-error/10 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={loading}
        className="animate-fade-up stagger-2 w-full py-4 bg-terracotta text-white font-semibold rounded-2xl hover:bg-terracotta-dark transition-all duration-200 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2.5 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            Download PDF
          </>
        )}
      </button>
    </div>
  )
}
