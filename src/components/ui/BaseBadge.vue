<script setup>
defineProps({
  variant: {
    type: String,
    default: 'neutral',
    validator: (value) => ['success', 'warning', 'danger', 'primary', 'neutral'].includes(value),
  },
})

const variants = {
  success: { badge: 'border-success-line bg-success-soft text-success-ink', dot: 'bg-success' },
  warning: { badge: 'border-warning-line bg-warning-soft text-warning-ink', dot: 'bg-warning' },
  danger: { badge: 'border-danger-line bg-danger-soft text-danger-ink', dot: 'bg-danger' },
  primary: { badge: 'border-primary/20 bg-primary/10 text-primary', dot: 'bg-primary' },
  neutral: { badge: 'border-border bg-surface-muted text-ink-muted', dot: 'bg-ink-disabled' },
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-label-md"
    :class="variants[variant].badge"
  >
    <span class="size-1.5 rounded-full" :class="variants[variant].dot" aria-hidden="true" />
    <slot />
  </span>
</template>
