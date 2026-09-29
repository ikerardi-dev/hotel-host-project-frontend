<script setup>
defineProps({
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    :aria-pressed="selected"
    class="inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-label-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="selected ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink'"
  >
    <slot />
  </button>
</template>
