import { useEffect } from 'react'
import { Check, AlertCircle } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}>
      <span className="inline-flex items-center gap-2">
        {type === 'success'
          ? <Check className="w-4 h-4" />
          : <AlertCircle className="w-4 h-4" />
        }
        {message}
      </span>
    </div>
  )
}
