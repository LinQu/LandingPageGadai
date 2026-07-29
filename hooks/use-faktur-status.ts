'use client'

import { useState } from 'react'
import { getFakturStatus } from '@/lib/services/faktur.service'
import type { FakturDetail } from '@/lib/faktur/types'

export function useFakturStatus() {
  const [data, setData] = useState<FakturDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  const search = async (nomorFaktur: string) => {
    setLoading(true)
    setError(null)
    setData(null)
    setIsEmpty(false)
    try {
      const response = await getFakturStatus(nomorFaktur)
      if (response.status == 'VOID') throw new Error(response.message || 'Status faktur tidak dapat diproses.')
      const detail = response.Detail?.[0]
      //console.log('Faktur detail:', detail)
      console.log('Faktur detail:', response.Detail)
      if (!detail) setIsEmpty(true)
      else setData(detail)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Terjadi kesalahan saat mencari faktur.')
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, isEmpty, search }
}
