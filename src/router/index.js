import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      redirect: { name: 'today' },
      children: [
        {
          path: 'today',
          name: 'today',
          component: () => import('@/views/TodayView.vue'),
          meta: { title: 'Hoy' },
        },
        {
          path: 'occupancy',
          name: 'occupancy',
          component: () => import('@/views/OccupancyView.vue'),
          meta: { title: 'Ocupación' },
        },
        {
          path: 'cleanings',
          name: 'cleanings',
          component: () => import('@/views/CleaningsView.vue'),
          meta: { title: 'Limpiezas' },
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/views/EmployeesView.vue'),
          meta: { title: 'Empleados' },
        },
        {
          path: 'my-cleanings',
          name: 'my-cleanings',
          component: () => import('@/views/MyCleaningsView.vue'),
          meta: { title: 'Mis limpiezas' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: 'Mi perfil' },
        },
      ],
    },
    // Solo en desarrollo: catálogo de componentes base
    ...(import.meta.env.DEV
      ? [{ path: '/ui', component: () => import('@/views/dev/UiPreviewView.vue') }]
      : []),
  ],
})

export default router
