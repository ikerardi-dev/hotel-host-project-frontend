const API_URL = import.meta.env.VITE_API_URL

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

  // 204 No Content: la petición ha ido bien pero no hay cuerpo que leer
  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

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
