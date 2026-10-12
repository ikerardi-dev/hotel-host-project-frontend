<script setup>
import { computed, ref, useId } from 'vue'
import { Eye, EyeOff } from '@lucide/vue'

// Los atributos extra (placeholder, autocomplete, required...) van al <input>, no al contenedor
defineOptions({ inheritAttrs: false })

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  icon: { type: [Object, Function], default: null },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
})

const id = useId()
const descriptionId = `${id}-description`
const showPassword = ref(false)

const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && showPassword.value ? 'text' : props.type))
const description = computed(() => props.error || props.hint)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-label-lg">{{ label }}</label>

    <div class="relative">
      <component
        :is="icon"
        v-if="icon"
        class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />

      <input
        :id="id"
        v-model="model"
        v-bind="$attrs"
        :type="inputType"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="description ? descriptionId : undefined"
        class="h-12 w-full rounded-md border px-3 text-body-lg placeholder:text-ink-disabled focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted"
        :class="[
          error ? 'border-danger bg-danger-soft' : 'border-border-input bg-surface',
          { 'pl-10': icon, 'pr-12': isPassword },
        ]"
      />

      <button
        v-if="isPassword"
        type="button"
        class="absolute top-0 right-0 flex size-12 items-center justify-center text-ink-muted"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="showPassword = !showPassword"
      >
        <component :is="showPassword ? EyeOff : Eye" class="size-5" aria-hidden="true" />
      </button>
    </div>

    <p
      v-if="description"
      :id="descriptionId"
      class="text-body-sm"
      :class="error ? 'text-danger-ink' : 'text-ink-muted'"
    >
      {{ description }}
    </p>
  </div>
</template>
