import { defineStore } from 'pinia'
import type { AuthUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)

  const isLogged = computed(() => !!user.value)

  async function login(username: string, password: string) {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    })

    user.value = res.user
  }

  async function fetchMe() {
    try {
      const res = await $fetch('/api/auth/me')
      user.value = res
    } catch {
      user.value = null
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout')
    user.value = null
  }

  return {
    user,
    isLogged,
    login,
    fetchMe,
    logout
  }
})
