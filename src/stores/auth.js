import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  changePassword as changePasswordRequest,
  login as loginRequest,
  updateProfile as updateProfileRequest,
} from '@/api/auth'
import { setAuthToken } from '@/api/client'

const STORAGE_KEY = 'auth'

// Pantalla de inicio de cada rol
const HOME_ROUTE_BY_ROLE = {
  ADMIN: 'today',
  CLEANING: 'my-cleanings',
}

function readStoredSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (session && new Date(session.expiresAt) > new Date()) {
      return session
    }
  } catch {
    // Sesión guardada ilegible: se ignora
  }
  localStorage.removeItem(STORAGE_KEY)
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const stored = readStoredSession()

  const token = ref(stored?.token ?? null)
  const expiresAt = ref(stored?.expiresAt ?? null)
  const user = ref(stored?.user ?? null)

  setAuthToken(token.value)

  const isAuthenticated = computed(() => token.value !== null)
  const role = computed(() => user.value?.role ?? null)
  const mustChangePassword = computed(() => user.value?.mustChangePassword === true)
  const homeRoute = computed(() => ({ name: HOME_ROUTE_BY_ROLE[role.value] ?? 'login' }))

  async function login(email, password) {
    const response = await loginRequest(email, password)
    token.value = response.token
    expiresAt.value = response.expiresAt
    user.value = response.user
    setAuthToken(response.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response))
  }

  async function changePassword(currentPassword, newPassword) {
    setUser(await changePasswordRequest(currentPassword, newPassword))
  }

  async function updateProfile(profile) {
    setUser(await updateProfileRequest(profile))
  }

  // Actualiza los datos del usuario manteniendo la sesión guardada
  function setUser(updatedUser) {
    user.value = updatedUser
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: token.value, expiresAt: expiresAt.value, user: updatedUser }),
    )
  }

  function logout() {
    token.value = null
    expiresAt.value = null
    user.value = null
    setAuthToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    token,
    expiresAt,
    user,
    isAuthenticated,
    role,
    mustChangePassword,
    homeRoute,
    login,
    changePassword,
    updateProfile,
    logout,
  }
})
