import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { TOAST_DURATION, useToastStore } from './toast'

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('añade un aviso de éxito por defecto', () => {
    const store = useToastStore()

    store.show('Empleado creado')

    expect(store.toasts).toHaveLength(1)
    expect(store.toasts[0]).toMatchObject({ message: 'Empleado creado', type: 'success' })
  })

  it('quita el aviso automáticamente al pasar el tiempo', () => {
    const store = useToastStore()
    store.show('Error al guardar', 'error')

    vi.advanceTimersByTime(TOAST_DURATION)

    expect(store.toasts).toHaveLength(0)
  })

  it('permite cerrar un aviso antes de tiempo sin afectar a los demás', () => {
    const store = useToastStore()
    store.show('Primero')
    store.show('Segundo')

    store.dismiss(store.toasts[0].id)

    expect(store.toasts.map((toast) => toast.message)).toEqual(['Segundo'])
  })
})
