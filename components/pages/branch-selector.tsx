'use client'

import { useMemo, useState } from 'react'
import { ChevronsUpDown, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Branch } from '@/lib/types'

type BranchSelectorProps = {
  branches: Branch[]
  onSelectBranch: (branch: Branch) => void
  selectedBranch?: Branch | null
  helperText?: string
}

export function BranchSelector({ branches, onSelectBranch, selectedBranch, helperText }: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBranches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return branches
    }

    return branches.filter(branch =>
      [branch.NamaCabang, branch.Kota, branch.Provinsi, branch.Alamat].join(' ').toLowerCase().includes(query)
    )
  }, [branches, searchQuery])

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Pilih Cabang</p>
            <h3 className="text-lg font-bold text-primary">Tentukan cabang yang akan dipakai untuk simulasi</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(open => !open)}
            className="inline-flex items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-accent"
          >
            <span className="max-w-[220px] truncate">{selectedBranch ? selectedBranch.NamaCabang : 'Buka daftar cabang'}</span>
            <ChevronsUpDown size={16} className="shrink-0" />
          </button>
        </div>
      </div>

      {isOpen ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 px-4 py-4 sm:px-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari cabang, kota, atau alamat"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-accent"
            />
          </div>

          {helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}

          <div className="max-h-52 sm:max-h-72 space-y-2 overflow-auto pr-1">
            {filteredBranches.map(branch => {
              const isSelected = selectedBranch?.id === branch.id
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    onSelectBranch(branch)
                    setIsOpen(false)
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
                      : 'border-slate-200 bg-white hover:border-accent hover:bg-accent/5'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-primary">{branch.NamaCabang}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {branch.Kota} • {branch.Alamat}
                    </div>
                  </div>
                  {isSelected ? (
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                      ✓ Terpilih
                    </span>
                  ) : null}
                </button>
              )
            })}

            {filteredBranches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                Cabang tidak ditemukan.
              </div>
            ) : null}
          </div>

          {selectedBranch ? (
            <div className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
              Cabang dipilih: <span className="font-semibold">{selectedBranch.NamaCabang}</span>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  )
}
