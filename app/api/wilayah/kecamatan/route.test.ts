import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { GET } from './route'

test('menolak latitude tidak valid', async () => {
  const response = await GET(new NextRequest('http://localhost/api/wilayah/kecamatan?lat=invalid&lon=106.8'))
  assert.equal(response.status, 400)
})

test('menolak longitude di luar rentang', async () => {
  const response = await GET(new NextRequest('http://localhost/api/wilayah/kecamatan?lat=-6.2&lon=181'))
  assert.equal(response.status, 400)
})
