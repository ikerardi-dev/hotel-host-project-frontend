<script setup>
import { CircleCheck, Circle } from '@lucide/vue'
import { passwordRules } from '@/utils/passwordRules'

defineProps({
  password: { type: String, required: true },
})
</script>

<template>
  <ul class="flex flex-col gap-1.5 rounded-md bg-surface-muted p-3">
    <li
      v-for="rule in passwordRules"
      :key="rule.label"
      class="flex items-center gap-2 text-body-md"
      :class="rule.test(password) ? 'text-success-ink' : 'text-ink-muted'"
    >
      <component :is="rule.test(password) ? CircleCheck : Circle" class="size-4 shrink-0" aria-hidden="true" />
      {{ rule.label }}
    </li>
  </ul>
</template>
