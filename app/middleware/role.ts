export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    return navigateTo('/login')
  }

  const required = to.meta.role as string | string[] | undefined

  if (!required) return

  const userRoles = auth.user.roles

  const allowed = Array.isArray(required)
    ? required.some((role) => userRoles.includes(role))
    : userRoles.includes(required)

  if (!allowed) {
    return navigateTo('/403')
  }
})
