<script setup>
import { CircleAlert, CircleCheck, X } from '@lucide/vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const styles = {
  success: { toast: 'bg-primary', icon: CircleCheck },
  error: { toast: 'bg-danger', icon: CircleAlert },
}
</script>

<template>
  <div class="fixed inset-x-0 top-4 z-40 mx-auto flex max-w-lg flex-col gap-2 px-4" aria-live="polite">
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="-translate-y-2 opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        role="status"
        class="flex items-center gap-3 rounded-lg py-2 pr-2 pl-4 text-white shadow-floating"
        :class="styles[toast.type].toast"
      >
        <component :is="styles[toast.type].icon" class="size-5 shrink-0" aria-hidden="true" />
        <p class="flex-1 text-label-lg">{{ toast.message }}</p>
        <button
          type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full"
          aria-label="Cerrar aviso"
          @click="toastStore.dismiss(toast.id)"
        >
          <X class="size-5" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
