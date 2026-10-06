<script setup>
import { useRouter } from 'vue-router'
import { LogOut } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <section>
    <BaseButton variant="danger" class="w-full" @click="logout">
      <LogOut class="size-5" aria-hidden="true" />
      Cerrar sesión
    </BaseButton>
  </section>
</template>
