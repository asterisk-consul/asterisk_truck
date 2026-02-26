import { defineStore } from 'pinia'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isLogged = computed(() => !!user.value)

  // 🔐 LOGIN
  async function login(email: string, password: string) {
    loading.value = true

    try {
      const res = await $fetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include'
      })

      user.value = res.user
    } finally {
      loading.value = false
    }
  }

  // 👤 ME (usuario actual)
  async function fetchMe() {
    try {
      const res = await $fetch<AuthUser>('/api/auth/me', {
        credentials: 'include'
      })

      user.value = res
    } catch {
      user.value = null
    }
  }

  // 🔄 REFRESH
  async function refresh() {
    try {
      await $fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      await fetchMe()
    } catch {
      user.value = null
    }
  }

  // 🚀 INIT SESSION (se ejecuta al cargar app)
  async function init() {
    if (initialized.value) return

    initialized.value = true

    try {
      await refresh() // genera access nuevo
      await fetchMe() // obtiene usuario
    } catch {
      user.value = null
    }
  }

  // 🚪 LOGOUT REAL
  async function logout() {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })

    user.value = null
  }

  return {
    user,
    loading,
    initialized,
    isLogged,
    login,
    fetchMe,
    refresh,
    init,
    logout
  }
})
