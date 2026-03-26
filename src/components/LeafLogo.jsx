export default function LeafLogo({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main leaf */}
      <path
        d="M8 28C8 28 6 18 12 12C18 6 28 4 28 4C28 4 26 14 20 20C14 26 8 28 8 28Z"
        fill="currentColor"
        className="text-sage"
        opacity="0.9"
      />
      {/* Leaf vein */}
      <path
        d="M10 26C10 26 14 18 20 12C22 10 26 6 26 6"
        stroke="currentColor"
        className="text-cream"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Secondary small leaf */}
      <path
        d="M6 24C6 24 4 20 7 17C10 14 14 13 14 13C14 13 12 17 10 19C8 21 6 24 6 24Z"
        fill="currentColor"
        className="text-terracotta"
        opacity="0.7"
      />
    </svg>
  )
}
