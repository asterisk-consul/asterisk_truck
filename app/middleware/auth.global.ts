import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // Restaurar token de cookie si aún no está en el store
  const token = auth.token

  // No proteger la ruta de login
  if (to.path === '/login') return

  // Redirigir a login si no hay token válido
  if (!token || auth.isTokenExpiring()) {
    return navigateTo('/login')
  }
})
