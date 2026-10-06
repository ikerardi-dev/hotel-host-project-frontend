import { api } from './client'

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}

export function getMe() {
  return api.get('/me')
}
