export default defineEventHandler((event) => {
  deleteCookie(event, 'api1_token')
  deleteCookie(event, 'api2_token')
  return { ok: true }
})
