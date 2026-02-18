export default defineNuxtRouteMiddleware(async (to) => {
  // 1. Rutas públicas
  const publicPages = ['/login']
  if (publicPages.includes(to.path)) {
    return
  }

  const auth = useAuthStore()

  // 2. Si ya hay usuario, no hacer nada
  if (auth.user) return

  try {
    // 3. Intentar restaurar sesión desde cookies
    await auth.fetchMe()
  } catch {
    // ignorar error
  }

  // 4. Si sigue sin usuario → login
  if (!auth.user) {
    return navigateTo('/login')
  }
})
