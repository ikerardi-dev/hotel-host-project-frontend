<script setup>
import { onBeforeUnmount, useId, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmar' },
  variant: { type: String, default: 'primary' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm'])

const titleId = useId()

function onKeydown(event) {
  if (event.key === 'Escape') open.value = false
}

watch(
  open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-30 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-xs"
      @click.self="open = false"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-5 shadow-floating"
      >
        <h2 :id="titleId" class="text-headline-sm">{{ title }}</h2>
        <p class="text-body-md text-ink-muted">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" :disabled="loading" @click="open = false">Cancelar</BaseButton>
          <BaseButton :variant="variant" :disabled="loading" @click="emit('confirm')">
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
