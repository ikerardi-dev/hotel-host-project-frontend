<script setup>
import { onBeforeUnmount, useId, watch } from 'vue'
import { X } from '@lucide/vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
  title: { type: String, required: true },
})

const titleId = useId()

function close() {
  open.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

// Mientras está abierto: se bloquea el scroll de la página y Escape lo cierra
watch(
  open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-20 bg-ink/45 backdrop-blur-xs" @click="close" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-y-full"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="open"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-h-[90dvh] max-w-lg flex-col rounded-t-xl bg-surface shadow-floating"
      >
        <div class="mx-auto mt-3 h-1 w-10 rounded-full bg-sand" aria-hidden="true" />

        <header class="flex items-center justify-between gap-4 pt-1 pr-2 pl-4">
          <h2 :id="titleId" class="text-headline-sm">{{ title }}</h2>
          <button
            type="button"
            class="flex size-12 items-center justify-center rounded-full text-ink-muted active:bg-surface-muted"
            aria-label="Cerrar"
            @click="close"
          >
            <X class="size-5" aria-hidden="true" />
          </button>
        </header>

        <div class="overflow-y-auto px-4 pb-4">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="border-t border-border px-4 py-3">
          <slot name="footer" />
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>
