const API_URL = import.meta.env.VITE_API_URL

let authToken = null
let onUnauthorized = null

// Token JWT que se envía en todas las peticiones (null = sin sesión)
export function setAuthToken(token) {
  authToken = token
}

// Se ejecuta cuando la sesión deja de valer: token caducado, usuario dado de baja o eliminado,
// o contraseña restablecida por el admin
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// Error de la API con el formato acordado: { "error": "CODIGO", "message": "..." }
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request(method, path, body) {
  const options = {
    method,
    headers: { Accept: 'application/json' },
  }

  if (authToken) {
    options.headers.Authorization = `Bearer ${authToken}`
  }

  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se ha podido conectar con el servidor')
  }


  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  // PASSWORD_CHANGE_REQUIRED con sesión abierta: el admin le ha dado una contraseña temporal nueva,
  // así que tiene que volver a entrar con ella (y entonces se le pedirá cambiarla)
  const sessionEnded = response.status === 401 || data?.error === 'PASSWORD_CHANGE_REQUIRED'
  if (sessionEnded && authToken && onUnauthorized) {
    onUnauthorized()
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.error ?? 'UNKNOWN_ERROR',
      data?.message ?? 'Ha ocurrido un error inesperado',
    )
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
