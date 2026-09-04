'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export type AutocompleteInputProps = {
  value: string
  onChange: (value: string) => void
  onSelect?: (value: string) => void
  getSuggestions: (query: string) => string[]
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  getSuggestions,
  placeholder,
  required = false,
  className = '',
  disabled = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const suggestions = getSuggestions(value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selected: string) => {
    onChange(selected)
    if (onSelect) onSelect(selected)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      )
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault()
        handleSelect(suggestions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => {
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-internal pr-8 ${className}`}
          autoComplete="off"
        />
        <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(true)
              }}
              className="hover:text-slate-600 p-0.5"
              tabIndex={-1}
            >
              <X size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(open => !open)}
              className="hover:text-slate-600 p-0.5"
              tabIndex={-1}
            >
              <ChevronDown size={14} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-xs"
          role="listbox"
        >
          {suggestions.map((item, index) => {
            const isHighlighted = index === highlightedIndex
            const isSelected = item.toLowerCase() === value.trim().toLowerCase()
            return (
              <li
                key={item}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
                className={`cursor-pointer px-3 py-2 transition-colors ${
                  isHighlighted || isSelected
                    ? 'bg-primary/10 font-bold text-primary'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

