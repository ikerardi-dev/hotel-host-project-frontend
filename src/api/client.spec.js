import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'

const API_URL = 'http://api.test'

let api
let ApiError
let setAuthToken
let setUnauthorizedHandler

beforeAll(async () => {
  // La URL se lee al cargar el módulo, así que se define antes de importarlo
  vi.stubEnv('VITE_API_URL', API_URL)
  ;({ api, ApiError, setAuthToken, setUnauthorizedHandler } = await import('./client.js'))
})

afterEach(() => {
  vi.unstubAllGlobals()
  setAuthToken(null)
  setUnauthorizedHandler(null)
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

  it('envía el token de sesión en la cabecera Authorization', async () => {
    const fetchMock = mockFetchResponse(200, {})
    setAuthToken('mi-token')

    await api.get('/me')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer mi-token')
  })

  it('avisa cuando la sesión deja de valer (401 con token)', async () => {
    mockFetchResponse(401, { error: 'UNAUTHORIZED', message: 'Tienes que iniciar sesión' })
    const handler = vi.fn()
    setAuthToken('token-caducado')
    setUnauthorizedHandler(handler)

    await api.get('/me').catch(() => {})

    expect(handler).toHaveBeenCalledOnce()
  })

  it('no avisa de sesión caducada en un login fallido (401 sin token)', async () => {
    mockFetchResponse(401, { error: 'INVALID_CREDENTIALS', message: 'Email o contraseña incorrectos' })
    const handler = vi.fn()
    setUnauthorizedHandler(handler)

    await api.post('/auth/login', {}).catch(() => {})

    expect(handler).not.toHaveBeenCalled()
  })

  it('devuelve null en una respuesta 204 sin contenido', async () => {
    mockFetchResponse(204)

    const result = await api.delete('/bookings/1')

    expect(result).toBeNull()
  })
})
