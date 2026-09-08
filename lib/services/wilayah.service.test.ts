import assert from 'node:assert/strict'
import test from 'node:test'
import { wilayahFromNominatim } from './wilayah.service'

test('mengambil kecamatan dari admin level 6, bukan kelurahan level 7', () => {
  const result = wilayahFromNominatim({ features: [{ properties: { geocoding: { admin: { level4: 'DKI Jakarta', level5: 'Jakarta Barat', level6: 'Palmerah', level7: 'Slipi' } } } }] })
  assert.deepEqual(result, { provinsi: 'DKI Jakarta', kota: 'Jakarta Barat', kecamatan: 'Palmerah' })
})

test('tidak mengembalikan kecamatan jika kota/kabupaten tidak ada', () => {
  const result = wilayahFromNominatim({ features: [{ properties: { geocoding: { admin: { level6: 'Palmerah', level7: 'Slipi' } } } }] })
  assert.equal(result.kecamatan, null)
})
