'use client'

import { useMemo, useState } from 'react'
import { Check, MapPin, MessageCircle, Navigation, Search, X } from 'lucide-react'
import { formatAddress, formatLocationName } from '@/lib/utils/format-location'
import type { Branch } from '@/lib/types'

type BranchSelectorProps = {
  branches: Branch[]
  onSelectBranch: (branch: Branch) => void
  selectedBranch?: Branch | null
  helperText?: string
  stepNumber?: string
  title?: string
}

export function BranchSelector({
  branches,
  onSelectBranch,
  selectedBranch,
  helperText,
  stepNumber = '1.',
  title = 'Pilih Cabang Terdekat',
}: BranchSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBranches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return branches
    }

    return branches.filter(branch =>
      [branch.NamaCabang, branch.Kota, branch.Provinsi, branch.Alamat]
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [branches, searchQuery])

  return (
    <div className="rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {stepNumber} Pilih Lokasi Cabang
          </p>
          <h3 className="mt-0.5 text-base sm:text-lg font-bold text-primary">
            {title}
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-slate-600">
          {filteredBranches.length} Cabang Tersedia
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari cabang, kota, atau alamat (misal: Semarang, Sudirman, Jakarta...)"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9.5 pr-9 text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none transition"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Hapus pencarian"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {helperText ? (
        <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
          <Navigation size={13} className="text-slate-400 shrink-0" />
          <span>{helperText}</span>
        </p>
      ) : null}

      {/* Branch Cards Box Grid */}
      <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2.5 pr-1 -mr-1">
        {filteredBranches.map(branch => {
          const isSelected = selectedBranch?.id === branch.id
          const distance = typeof branch.distance === 'number' && Number.isFinite(branch.distance)
            ? branch.distance < 1
              ? `${Math.round(branch.distance * 1000)} m`
              : `${branch.distance.toFixed(1)} km`
            : null

          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelectBranch(branch)}
              className={`w-full rounded-xl border-2 p-3 text-left transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-primary/60 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin
                      size={14}
                      className={`shrink-0 ${isSelected ? 'text-accent' : 'text-slate-400 group-hover:text-primary'}`}
                    />
                    <strong
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isSelected ? 'text-primary' : 'text-slate-800 group-hover:text-primary'
                      }`}
                    >
                      {branch.NamaCabang}
                    </strong>
                  </div>
                  {isSelected ? (
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent shrink-0 flex items-center gap-0.5">
                      <Check size={11} /> Terpilih
                    </span>
                  ) : distance ? (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0">
                      ± {distance}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-slate-700">
                    {formatLocationName(branch.Kota)}
                  </span>
                  {branch.Alamat ? ` • ${formatAddress(branch.Alamat)}` : ''}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold">
                <span className={isSelected ? 'text-accent' : 'text-slate-400 group-hover:text-primary'}>
                  {isSelected ? 'Cabang Terpilih' : 'Pilih Cabang Ini'}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-accent' : 'text-slate-300 group-hover:text-primary'}`}>
                  →
                </span>
              </div>
            </button>
          )
        })}

        {filteredBranches.length === 0 ? (
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-xs font-bold text-primary">Belum menemukan cabang di area Anda?</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Hubungi Admin untuk informasi lokasi dan layanan Gadai Sakti yang tersedia.
            </p>
            <a
              href={`https://wa.me/6281125201419?text=${encodeURIComponent('Hallo.. Saya melihat Website Gadai Sakti saat simulasi gadai, Saya ingin bertanya informasi lokasi cabang dan layanan di area saya. Terimakasih.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-95"
            >
              <MessageCircle size={14} />
              <span>Tanya Admin</span>
            </a>
          </div>
        ) : null}
      </div>

      {/* Selected Confirmation Banner */}
      {selectedBranch ? (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 px-3.5 py-2.5 text-xs text-primary border border-primary/10">
          <div className="flex items-center gap-2 truncate">
            <Check size={15} className="text-emerald-600 shrink-0" />
            <span className="truncate">
              Cabang aktif: <strong>{selectedBranch.NamaCabang}</strong> ({formatLocationName(selectedBranch.Kota)})
            </span>
          </div>
          <span className="text-[11px] text-accent font-semibold shrink-0 ml-2">Siap dihitung</span>
        </div>
      ) : null}
    </div>
  )
}
