export default defineEventHandler(async (event) => {
  const refresh = getCookie(event, 'api_refresh')
  const config = useRuntimeConfig()

  if (refresh) {
    await $fetch(`${config.public.apiBase}/auth/logout`, {
      method: 'POST',
      body: { refresh_token: refresh }
    })
  }

  deleteCookie(event, 'api_access')
  deleteCookie(event, 'api_refresh')

  return { ok: true }
})
