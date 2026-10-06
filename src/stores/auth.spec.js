import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { changePassword as changePasswordRequest, login as loginRequest } from '@/api/auth'
import { useAuthStore } from './auth'

vi.mock('@/api/auth', () => ({ login: vi.fn(), changePassword: vi.fn() }))

const FUTURE = new Date(Date.now() + 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 60 * 1000).toISOString()

function loginResponse(role, expiresAt = FUTURE) {
  return { token: 'token-de-prueba', expiresAt, user: { id: 1, email: 'maria@test.es', role } }
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('al iniciar sesión guarda el token y el usuario', async () => {
    loginRequest.mockResolvedValue(loginResponse('ADMIN'))
    const auth = useAuthStore()

    await auth.login('maria@test.es', 'Secreta123')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('ADMIN')
    expect(JSON.parse(localStorage.getItem('auth')).token).toBe('token-de-prueba')
  })

  it('lleva a cada rol a su pantalla de inicio', async () => {
    loginRequest.mockResolvedValue(loginResponse('CLEANING'))
    const auth = useAuthStore()

    await auth.login('maria@test.es', 'Secreta123')

    expect(auth.homeRoute).toEqual({ name: 'my-cleanings' })
  })

  it('al cerrar sesión borra todo', async () => {
    loginRequest.mockResolvedValue(loginResponse('ADMIN'))
    const auth = useAuthStore()
    await auth.login('maria@test.es', 'Secreta123')

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('auth')).toBeNull()
  })

  it('tras cambiar la contraseña temporal deja de exigir el cambio y lo guarda', async () => {
    loginRequest.mockResolvedValue({
      ...loginResponse('ADMIN'),
      user: { id: 1, role: 'ADMIN', mustChangePassword: true },
    })
    changePasswordRequest.mockResolvedValue({ id: 1, role: 'ADMIN', mustChangePassword: false })
    const auth = useAuthStore()
    await auth.login('maria@test.es', 'Temporal123')
    expect(auth.mustChangePassword).toBe(true)

    await auth.changePassword(null, 'NuevaClave1')

    expect(auth.mustChangePassword).toBe(false)
    expect(JSON.parse(localStorage.getItem('auth')).user.mustChangePassword).toBe(false)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('recupera la sesión guardada al recargar la página', () => {
    localStorage.setItem('auth', JSON.stringify(loginResponse('ADMIN')))

    const auth = useAuthStore()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.email).toBe('maria@test.es')
  })

  it('descarta la sesión guardada si el token ha caducado', () => {
    localStorage.setItem('auth', JSON.stringify(loginResponse('ADMIN', PAST)))

    const auth = useAuthStore()

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth')).toBeNull()
  })
})
