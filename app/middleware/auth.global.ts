export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.init()
  }

  if (to.meta.auth === false) {
    return
  }

  if (!auth.isLogged) {
    return navigateTo('/login')
  }
})
