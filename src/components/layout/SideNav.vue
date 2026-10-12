<script setup>
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo.png'

// Menú lateral para escritorio (≥1024 px); en móvil y tablet se usa la barra inferior
defineProps({
  section: { type: String, required: true },
  items: { type: Array, required: true },
})
</script>

<template>
  <nav class="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col gap-8 border-r border-border bg-surface px-4 py-6 lg:flex">
    <div class="flex items-center gap-3 px-2">
      <img :src="logo" alt="" class="size-10 rounded-md" />
      <div>
        <p class="text-label-lg">Gestión de apartamentos</p>
        <p class="text-label-md uppercase text-primary">{{ section }}</p>
      </div>
    </div>
    <ul class="flex flex-col gap-1">
      <li v-for="item in items" :key="item.route">
        <RouterLink
          :to="{ name: item.route }"
          class="flex min-h-12 items-center gap-3 rounded-md px-3 text-label-lg text-ink-muted hover:bg-surface-muted [&.router-link-active]:bg-primary/10 [&.router-link-active]:text-primary"
        >
          <component :is="item.icon" class="size-5" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
