import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'

function parseJwt(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return {}
    const payload = parts[1]!
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  const payload = computed(() => (token.value ? parseJwt(token.value) : null))
  const userEmail = computed(() => (payload.value?.sub as string) ?? null)
  const userId = computed(() => (payload.value?.userId as number) ?? null)
  const userRole = computed(() => (payload.value?.role as string) ?? null)
  const isAuthenticated = computed(() => !!token.value)
  const isBarmaker = computed(() => userRole.value === 'BARMAKER')

  async function login(email: string, password: string) {
    const res = await loginApi({ email, password })
    token.value = res.token
    localStorage.setItem('token', res.token)
  }

  function logout() {
    token.value = null
    localStorage.removeItem('token')
  }

  return { token, userEmail, userId, userRole, isAuthenticated, isBarmaker, login, logout }
})
