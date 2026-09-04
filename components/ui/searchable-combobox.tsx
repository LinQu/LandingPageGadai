'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

export type SearchableComboboxProps = {
  label: string
  placeholder?: string
  value: string
  options: string[]
  formatLabel?: (option: string) => string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function SearchableCombobox({
  label,
  placeholder,
  value,
  options,
  formatLabel = opt => opt,
  onChange,
  disabled = false,
  className = '',
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return options

    return options.filter(option => {
      const formatted = formatLabel(option).toLowerCase()
      const raw = option.toLowerCase()
      return raw.includes(q) || formatted.includes(q)
    })
  }, [options, searchQuery, formatLabel])

  // Reset highlight index when filtered options change
  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
  }, [filteredOptions])

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('touchstart', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleToggle = () => {
    if (disabled) return
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (nextOpen) {
      setSearchQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setSearchQuery('')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex])
      }
    }
  }

  const selectedDisplay = value ? formatLabel(value) : ''

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full sm:w-auto ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={label}
        className={`group flex min-h-[44px] w-full sm:w-auto items-center justify-between gap-2.5 rounded-full border px-4 py-2.5 text-xs font-bold transition-all outline-none ${
          disabled
            ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
            : value
            ? 'border-primary bg-primary text-white shadow-sm hover:brightness-105'
            : 'border-primary/25 bg-white text-primary hover:border-primary hover:bg-slate-50'
        }`}
      >
        <span className="truncate max-w-[200px] text-left">
          {value ? selectedDisplay : placeholder || label}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  handleClear(e as any)
                }
              }}
              aria-label={`Hapus pilihan ${label}`}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition text-white"
            >
              <X size={11} strokeWidth={2.5} />
            </span>
          ) : (
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } ${value ? 'text-white' : 'text-primary'}`}
            />
          )}
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-full sm:w-72 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {/* Search Field */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Cari ${label.toLowerCase()}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs outline-none focus:border-primary focus:bg-white transition"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = value === option
                const isHighlighted = highlightedIndex === idx
                const display = formatLabel(option)

                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex min-h-[38px] w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{display}</span>
                    {isSelected ? <Check size={14} className="text-primary shrink-0 ml-2" /> : null}
                  </button>
                )
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Tidak ada {label.toLowerCase()} yang cocok.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

