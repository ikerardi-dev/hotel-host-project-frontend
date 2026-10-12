<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface shadow-floating lg:hidden">
    <ul class="mx-auto flex max-w-lg md:max-w-3xl">
      <li v-for="item in items" :key="item.route" class="flex-1">
        <RouterLink
          :to="{ name: item.route }"
          class="flex min-h-16 flex-col items-center justify-center gap-1 text-label-md text-ink-muted [&.router-link-active]:text-primary"
        >
          <component :is="item.icon" class="size-6" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
