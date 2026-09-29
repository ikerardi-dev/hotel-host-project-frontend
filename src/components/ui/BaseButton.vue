<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value),
  },
  type: { type: String, default: 'button' },
})

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover',
  secondary: 'border border-sand bg-sand-light text-primary',
  danger: 'bg-danger text-white',
  ghost: 'text-ink-muted hover:bg-surface-muted active:bg-surface-muted',
}
</script>

<template>
  <button
    :type="type"
    class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 text-label-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="variants[variant]"
  >
    <slot />
  </button>
</template>
