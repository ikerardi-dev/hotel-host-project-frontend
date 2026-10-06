<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { navigationByRole } from './navigation'

const route = useRoute()
const auth = useAuthStore()

const navigation = computed(() => navigationByRole[auth.role])

const title = computed(() => route.meta.title ?? '')
</script>

<template>
  <AppHeader :section="navigation.section" :title="title" />
  <main class="mx-auto max-w-lg px-4 pt-4 pb-24">
    <RouterView />
  </main>
  <BottomNav :items="navigation.items" />
</template>
