import { onMounted, ref } from 'vue'

/**
 * Carga datos de la API con su estado de carga y su error.
 * loader: función async que devuelve los datos. Se ejecuta al montar el componente y con reload().
 * loading solo es true en la primera carga: al recargar se siguen mostrando los datos anteriores.
 */
export function useAsyncData(loader, initialValue = null) {
  const data = ref(initialValue)
  const loading = ref(true)
  const error = ref('')

  async function reload() {
    try {
      data.value = await loader()
      error.value = ''
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  onMounted(reload)

  return { data, loading, error, reload }
}
