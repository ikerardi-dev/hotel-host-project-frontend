<script setup>
import logo from '@/assets/logo.png'

defineProps({
  section: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-border bg-surface">
    <div class="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-3xl lg:max-w-6xl lg:px-8">
      <!-- En escritorio el logo ya está en el menú lateral -->
      <img :src="logo" alt="" class="size-9 rounded-md lg:hidden" />
      <div class="min-w-0">
        <p class="text-label-md uppercase text-primary lg:hidden">{{ section }}</p>
        <h1 class="text-headline-sm lg:text-headline-md">{{ title }}</h1>
      </div>
    </div>
  </header>
</template>
