export default function ChipGroup({ label, options, selected, onChange, multi = true }) {
  const toggle = (option) => {
    if (multi) {
      onChange(
        selected.includes(option)
          ? selected.filter((s) => s !== option)
          : [...selected, option]
      )
    } else {
      onChange(option)
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-bark mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = multi ? selected.includes(option) : selected === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-sage text-white shadow-sm'
                  : 'bg-white text-stone border border-sand hover:border-sage-light hover:text-bark'
                }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
