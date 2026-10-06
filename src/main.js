import './assets/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api/client'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Si la sesión deja de valer (token caducado o usuario dado de baja), se vuelve al login
setUnauthorizedHandler(() => {
  useAuthStore().logout()
  router.push({ name: 'login' })
})

app.mount('#app')
