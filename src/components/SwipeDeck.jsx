import { useState, useRef, useCallback, useEffect } from 'react'
import { Check, X } from 'lucide-react'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.5

export default function SwipeDeck({ cards, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selections, setSelections] = useState({})
  const [exiting, setExiting] = useState(null) // 'left' | 'right' | null
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const startRef = useRef({ x: 0, y: 0, time: 0 })
  const cardRef = useRef(null)

  const currentCard = cards[currentIndex]
  const remaining = cards.length - currentIndex
  const isDone = currentIndex >= cards.length

  // Resolve swipe
  const resolve = useCallback((direction) => {
    if (exiting || isDone) return
    setExiting(direction)

    if (direction === 'right') {
      setSelections((s) => ({ ...s, [currentCard.id]: true }))
    }

    setTimeout(() => {
      setCurrentIndex((i) => i + 1)
      setExiting(null)
      setDrag({ x: 0, y: 0, active: false })
    }, 300)
  }, [currentIndex, currentCard, exiting, isDone])

  // Fire onComplete when deck is done
  useEffect(() => {
    if (isDone && Object.keys(selections).length >= 0) {
      const selected = cards.filter((c) => selections[c.id]).map((c) => c.label)
      onComplete(selected)
    }
  }, [isDone])

  // ── Touch handlers ──
  const onPointerDown = (e) => {
    if (exiting || isDone) return
    startRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    setDrag({ x: 0, y: 0, active: true })
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!drag.active || exiting) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    setDrag({ x: dx, y: dy, active: true })
  }

  const onPointerUp = (e) => {
    if (!drag.active || exiting) return
    const dx = e.clientX - startRef.current.x
    const dt = (Date.now() - startRef.current.time) / 1000
    const velocity = Math.abs(dx) / dt

    if (dx > SWIPE_THRESHOLD || (dx > 30 && velocity > VELOCITY_THRESHOLD)) {
      resolve('right')
    } else if (dx < -SWIPE_THRESHOLD || (dx < -30 && velocity > VELOCITY_THRESHOLD)) {
      resolve('left')
    } else {
      setDrag({ x: 0, y: 0, active: false })
    }
  }

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (isDone || exiting) return
      if (e.key === 'ArrowRight') resolve('right')
      if (e.key === 'ArrowLeft') resolve('left')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resolve, isDone, exiting])

  if (isDone) return null

  // Card transform
  const getTransform = (offset) => {
    if (exiting) {
      const dir = exiting === 'right' ? 1 : -1
      return `translateX(${dir * 120}%) rotate(${dir * 20}deg)`
    }
    if (offset > 0) {
      return `scale(${1 - offset * 0.04}) translateY(${offset * 8}px)`
    }
    const rotation = drag.x * 0.08
    return `translateX(${drag.x}px) translateY(${drag.y * 0.3}px) rotate(${rotation}deg)`
  }

  const getOpacity = (offset) => {
    if (offset === 0) return exiting ? 0.8 : 1
    return Math.max(0, 1 - offset * 0.15)
  }

  // Swipe direction indicator
  const swipeProgress = Math.min(1, Math.abs(drag.x) / SWIPE_THRESHOLD)
  const swipeDirection = drag.x > 20 ? 'right' : drag.x < -20 ? 'left' : null

  return (
    <div className="relative flex flex-col items-center">
      {/* Counter */}
      <div className="mb-4 text-xs font-semibold text-stone-light tracking-wide">
        {currentIndex + 1} / {cards.length}
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-[300px] h-[200px]" style={{ touchAction: 'none' }}>
        {/* Render up to 3 stacked cards */}
        {cards.slice(currentIndex, currentIndex + 3).map((card, offset) => {
          const isFront = offset === 0
          return (
            <div
              key={card.id}
              ref={isFront ? cardRef : null}
              onPointerDown={isFront ? onPointerDown : undefined}
              onPointerMove={isFront ? onPointerMove : undefined}
              onPointerUp={isFront ? onPointerUp : undefined}
              className={`absolute inset-0 rounded-3xl border-2 flex flex-col items-center justify-center select-none
                ${isFront ? 'cursor-grab active:cursor-grabbing z-30' : offset === 1 ? 'z-20' : 'z-10'}
                ${isFront && swipeDirection === 'right' ? 'border-sage bg-sage/5' : ''}
                ${isFront && swipeDirection === 'left' ? 'border-error/50 bg-error/5' : ''}
                ${!swipeDirection || !isFront ? 'border-sand/50 bg-surface-el' : ''}`}
              style={{
                transform: getTransform(offset),
                opacity: getOpacity(offset),
                transition: isFront && drag.active ? 'none' : 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Suggestion badge */}
              {card.suggested && !swipeDirection && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                  Suggested
                </span>
              )}

              {/* Category label */}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-light mb-2">
                {card.category}
              </span>

              {/* Main label */}
              <span className="text-xl font-serif font-semibold text-bark text-center px-6">
                {card.label}
              </span>

              {/* Swipe indicators */}
              {isFront && swipeDirection === 'right' && (
                <div className="absolute top-4 left-4 pop-in">
                  <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center" style={{ opacity: swipeProgress }}>
                    <Check className="w-5 h-5 text-sage" strokeWidth={3} />
                  </div>
                </div>
              )}
              {isFront && swipeDirection === 'left' && (
                <div className="absolute top-4 right-4 pop-in">
                  <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center" style={{ opacity: swipeProgress }}>
                    <X className="w-5 h-5 text-error" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <div className="mt-6 flex items-center gap-6 text-xs text-stone-light">
        <span className="flex items-center gap-1">
          <X className="w-3 h-3" /> Skip
        </span>
        <span className="text-sand">swipe or use arrow keys</span>
        <span className="flex items-center gap-1">
          Include <Check className="w-3 h-3" />
        </span>
      </div>
    </div>
  )
}
