const API_URL = import.meta.env.VITE_API_URL

let authToken = null
let onUnauthorized = null

// Token JWT que se envía en todas las peticiones (null = sin sesión)
export function setAuthToken(token) {
  authToken = token
}

// Se ejecuta cuando la API responde 401 teniendo sesión (token caducado o usuario dado de baja)
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

  if (response.status === 401 && authToken && onUnauthorized) {
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
