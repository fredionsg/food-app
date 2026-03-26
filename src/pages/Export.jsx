import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { FileDown, Check, Loader2, AlertCircle } from 'lucide-react'

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
      <h1 className="font-serif text-2xl font-semibold text-bark mb-1">Export profile</h1>
      <p className="text-stone mb-6">Download your dietary information as a PDF to share with restaurants, hosts, or healthcare providers.</p>

      {/* Preview */}
      <div className="bg-white rounded-2xl border border-sand/50 p-5 mb-6">
        <h2 className="text-sm font-medium text-bark mb-4">Profile preview</h2>
        <div className="space-y-3">
          {profileItems.map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <span className="text-sm text-stone shrink-0 sm:w-32">{label}</span>
              <span className="text-sm text-charcoal">{value}</span>
            </div>
          ))}
          {user?.special_notes && (
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <span className="text-sm text-stone shrink-0 sm:w-32">Notes</span>
              <span className="text-sm text-charcoal">{user.special_notes}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-error-light text-error text-sm px-4 py-3 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full py-3.5 bg-sage text-white font-medium rounded-2xl hover:bg-sage-dark transition-all duration-200 disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
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
