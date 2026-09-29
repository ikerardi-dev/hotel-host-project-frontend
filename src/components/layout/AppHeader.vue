<script setup>
import logo from '@/assets/logo.png'

defineProps({
  section: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-border bg-surface">
    <div class="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
      <img :src="logo" alt="" class="size-9 rounded-md" />
      <div class="min-w-0">
        <p class="text-label-md uppercase text-primary">{{ section }}</p>
        <h1 class="truncate text-headline-sm">{{ title }}</h1>
      </div>
    </div>
  </header>
</template>
