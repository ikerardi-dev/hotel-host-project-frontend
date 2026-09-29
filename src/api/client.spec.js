import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'

const API_URL = 'http://api.test'

let api
let ApiError

beforeAll(async () => {
  // La URL se lee al cargar el módulo, así que se define antes de importarlo
  vi.stubEnv('VITE_API_URL', API_URL)
  ;({ api, ApiError } = await import('./client.js'))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

function mockFetchResponse(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('api client', () => {
  it('envía el cuerpo en JSON y devuelve la respuesta', async () => {
    const fetchMock = mockFetchResponse(201, { id: 1 })

    const result = await api.post('/bookings', { guestName: 'Laura' })

    expect(result).toEqual({ id: 1 })
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName: 'Laura' }),
    })
  })

  it('lanza ApiError con el código y el mensaje de la API', async () => {
    mockFetchResponse(409, { error: 'BOOKING_OVERLAP', message: 'Las fechas se solapan' })

    const error = await api.get('/bookings').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.code).toBe('BOOKING_OVERLAP')
    expect(error.message).toBe('Las fechas se solapan')
  })

  it('lanza NETWORK_ERROR si no hay conexión con el servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await api.get('/bookings').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('devuelve null en una respuesta 204 sin contenido', async () => {
    mockFetchResponse(204)

    const result = await api.delete('/bookings/1')

    expect(result).toBeNull()
  })
})
