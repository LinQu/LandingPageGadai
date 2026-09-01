import type { FakturApiResponse } from '@/lib/faktur/types'

export async function getFakturStatus(nomorFaktur: string): Promise<FakturApiResponse> {
  const response = await fetch(`/api/faktur?nomor=${encodeURIComponent(nomorFaktur)}`, { cache: 'no-store' })
  
  //console log get detail get
  
  const data = (await response.json())
  console.log( data)  
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil status faktur.')
  return data
}
