import { api } from './client'

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export function getMe() {
  return api.get('/me')
}

// Nombre, apellidos y teléfono del usuario (el email no se puede cambiar)
export function updateProfile(profile) {
  return api.put('/me', profile)
}

// currentPassword es null en el primer acceso
export function changePassword(currentPassword, newPassword) {
  return api.put('/me/password', { currentPassword, newPassword })
}
