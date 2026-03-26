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
      {label && (
        <label className="block text-[13px] font-semibold uppercase tracking-wide text-stone mb-2.5">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = multi ? selected.includes(option) : selected === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`chip-press px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer border
                ${isActive
                  ? 'bg-terracotta text-white border-terracotta shadow-sm'
                  : 'bg-cream text-bark border-sand hover:border-terracotta-muted hover:bg-sand-lighter'
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
