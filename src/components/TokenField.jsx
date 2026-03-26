import { useState } from 'react'
import { X } from 'lucide-react'

export default function TokenField({ label, tokens, onChange, placeholder = 'Type and press Enter' }) {
  const [input, setInput] = useState('')

  const addToken = (value) => {
    const trimmed = value.trim()
    if (trimmed && !tokens.includes(trimmed)) {
      onChange([...tokens, trimmed])
    }
    setInput('')
  }

  const removeToken = (index) => {
    onChange(tokens.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addToken(input)
    } else if (e.key === 'Backspace' && !input && tokens.length > 0) {
      removeToken(tokens.length - 1)
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2.5">
          {label}
        </label>
      )}
      <div className="min-h-[52px] bg-cream border border-sand rounded-2xl px-3 py-2.5 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta-muted transition-all duration-200">
        {tokens.map((token, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 bg-sage/10 text-sage-dark text-sm font-medium px-3 py-1.5 rounded-xl border border-sage/20"
          >
            {token}
            <button
              type="button"
              onClick={() => removeToken(i)}
              className="text-sage-light hover:text-terracotta transition-colors cursor-pointer"
              aria-label={`Remove ${token}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tokens.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-charcoal placeholder:text-stone-light py-1"
        />
      </div>
    </div>
  )
}
