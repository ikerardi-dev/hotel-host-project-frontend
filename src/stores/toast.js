import { ref } from 'vue'
import { defineStore } from 'pinia'

export const TOAST_DURATION = 4000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 1

  // type: 'success' | 'error'
  function show(message, type = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), TOAST_DURATION)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, show, dismiss }
})
