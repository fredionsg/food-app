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
      {label && <label className="block text-sm font-medium text-bark mb-2">{label}</label>}
      <div className="min-h-[48px] bg-white border border-sand rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-sage/30 focus-within:border-sage transition-all">
        {tokens.map((token, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-sand-light text-bark text-sm px-3 py-1 rounded-full"
          >
            {token}
            <button
              type="button"
              onClick={() => removeToken(i)}
              className="text-stone hover:text-terracotta transition-colors cursor-pointer"
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
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-charcoal placeholder:text-stone-light"
        />
      </div>
    </div>
  )
}
