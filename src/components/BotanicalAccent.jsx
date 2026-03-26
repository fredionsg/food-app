export function BranchDivider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <svg width="120" height="20" viewBox="0 0 120 20" fill="none" className="text-sand">
        <path d="M0 10H45" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {/* Central leaf cluster */}
        <path d="M55 10C55 10 58 5 62 8C60 6 63 3 65 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <path d="M65 10C65 10 62 5 58 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <circle cx="60" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
        <path d="M75 10H120" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  )
}

export function CornerVine({ position = 'top-right', className = '' }) {
  const posClass = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0 -scale-x-100',
    'bottom-right': 'bottom-0 right-0 -scale-y-100',
    'bottom-left': 'bottom-0 left-0 -scale-x-100 -scale-y-100',
  }[position]

  return (
    <svg
      className={`absolute ${posClass} text-sage/10 ${className}`}
      width="120" height="120" viewBox="0 0 120 120" fill="none"
    >
      <path
        d="M120 0C120 0 100 10 90 30C80 50 85 70 70 85C55 100 30 105 10 120"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M95 25C95 25 88 20 85 28C88 24 92 22 95 25Z" fill="currentColor" />
      <path d="M78 55C78 55 71 50 68 58C71 54 75 52 78 55Z" fill="currentColor" />
      <path d="M50 90C50 90 43 85 40 93C43 89 47 87 50 90Z" fill="currentColor" />
    </svg>
  )
}

export function OrganicBlob({ className = '', color = 'sage' }) {
  const colorMap = {
    sage: 'text-sage/5',
    terracotta: 'text-terracotta/5',
    sand: 'text-sand/30',
  }

  return (
    <svg className={`${colorMap[color]} ${className}`} viewBox="0 0 200 200" fill="currentColor">
      <path d="M44.7,-76.4C58.8,-69.2,71.8,-58.8,79.6,-45.5C87.3,-32.2,89.8,-16.1,88.3,-0.9C86.8,14.4,81.3,28.7,73.1,41.4C64.9,54,54,65,41.2,72.9C28.4,80.8,14.2,85.6,-0.7,86.8C-15.6,88,-31.2,85.6,-44.8,78.3C-58.3,71,-69.8,58.8,-77.1,44.7C-84.4,30.6,-87.5,15.3,-86.9,0.4C-86.2,-14.6,-81.8,-29.2,-73.8,-41.6C-65.7,-54,-54,-64.2,-40.9,-71.9C-27.8,-79.6,-13.9,-84.8,0.8,-86.2C15.6,-87.5,30.6,-83.6,44.7,-76.4Z"
        transform="translate(100 100)" />
    </svg>
  )
}
