import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { login as loginRequest } from '@/api/auth'
import LoginView from './LoginView.vue'

vi.mock('@/api/auth', () => ({ login: vi.fn() }))

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

const FUTURE = new Date(Date.now() + 60 * 60 * 1000).toISOString()

async function fillAndSubmit(wrapper, email, password) {
  const [emailInput, passwordInput] = wrapper.findAll('input')
  await emailInput.setValue(email)
  await passwordInput.setValue(password)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    push.mockClear()
  })

  it('no deja enviar el formulario hasta rellenar correo y contraseña', async () => {
    const wrapper = mount(LoginView)
    const submit = wrapper.get('button[type="submit"]')
    expect(submit.element.disabled).toBe(true)

    await wrapper.findAll('input')[0].setValue('admin@test.es')
    await wrapper.findAll('input')[1].setValue('Secreta123')

    expect(submit.element.disabled).toBe(false)
  })

  it('al entrar lleva al inicio de su rol', async () => {
    loginRequest.mockResolvedValue({ token: 't', expiresAt: FUTURE, user: { id: 1, role: 'CLEANING' } })
    const wrapper = mount(LoginView)

    await fillAndSubmit(wrapper, '  ana@test.es ', 'Secreta123')

    expect(loginRequest).toHaveBeenCalledWith('ana@test.es', 'Secreta123')
    expect(push).toHaveBeenCalledWith({ name: 'my-cleanings' })
  })

  it('muestra el error del backend si las credenciales no son válidas', async () => {
    loginRequest.mockRejectedValue(new Error('Correo o contraseña incorrectos'))
    const wrapper = mount(LoginView)

    await fillAndSubmit(wrapper, 'ana@test.es', 'mal')

    expect(wrapper.get('[role="alert"]').text()).toBe('Correo o contraseña incorrectos')
    expect(push).not.toHaveBeenCalled()
  })
})
