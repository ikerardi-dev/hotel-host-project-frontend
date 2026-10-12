import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useAsyncData } from './useAsyncData'

// Monta un componente mínimo que usa el composable y lo expone para el test
function withComposable(loader) {
  let result
  mount(
    defineComponent({
      setup() {
        result = useAsyncData(loader, [])
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useAsyncData', () => {
  it('carga los datos al montar y quita el estado de carga', async () => {
    const result = withComposable(vi.fn().mockResolvedValue(['a', 'b']))
    expect(result.loading.value).toBe(true)

    await flushPromises()

    expect(result.loading.value).toBe(false)
    expect(result.data.value).toEqual(['a', 'b'])
    expect(result.error.value).toBe('')
  })

  it('guarda el mensaje de error si la carga falla', async () => {
    const result = withComposable(vi.fn().mockRejectedValue(new Error('No se ha podido conectar con el servidor')))

    await flushPromises()

    expect(result.error.value).toBe('No se ha podido conectar con el servidor')
    expect(result.data.value).toEqual([])
    expect(result.loading.value).toBe(false)
  })

  it('reload vuelve a pedir los datos', async () => {
    const loader = vi.fn().mockResolvedValueOnce([1]).mockResolvedValueOnce([1, 2])
    const result = withComposable(loader)
    await flushPromises()

    await result.reload()

    expect(loader).toHaveBeenCalledTimes(2)
    expect(result.data.value).toEqual([1, 2])
  })
})
