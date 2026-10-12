<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import SideNav from '@/components/layout/SideNav.vue'
import { useAuthStore } from '@/stores/auth'
import { navigationByRole } from './navigation'

const route = useRoute()
const auth = useAuthStore()

const navigation = computed(() => navigationByRole[auth.role])

const title = computed(() => route.meta.title ?? '')
</script>

<template>
  <!-- Móvil y tablet: cabecera + barra inferior. Escritorio (lg): menú lateral fijo y contenido más ancho -->
  <SideNav :section="navigation.section" :items="navigation.items" />
  <div class="lg:pl-64">
    <AppHeader :section="navigation.section" :title="title" />
    <main class="mx-auto max-w-lg px-4 pt-4 pb-24 md:max-w-3xl lg:max-w-6xl lg:px-8 lg:pt-6 lg:pb-10">
      <RouterView />
    </main>
  </div>
  <BottomNav :items="navigation.items" />
</template>
