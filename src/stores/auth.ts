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
  const name = ref<string | null>(localStorage.getItem('name'))

  const payload = computed(() => (token.value ? parseJwt(token.value) : null))
  const userEmail = computed(() => (payload.value?.sub as string) ?? null)
  const userId = computed(() => (payload.value?.userId as number) ?? null)
  const userRole = computed(() => (payload.value?.role as string) ?? null)
  const userName = computed(() => name.value)
  const isAuthenticated = computed(() => !!token.value)
  const isBarmaker = computed(() => userRole.value === 'BARMAKER')

  async function login(email: string, password: string) {
    const res = await loginApi({ email, password })
    token.value = res.token
    name.value = res.name
    localStorage.setItem('token', res.token)
    localStorage.setItem('name', res.name)
  }

  function logout() {
    token.value = null
    name.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('name')
  }

  return { token, userEmail, userId, userName, userRole, isAuthenticated, isBarmaker, login, logout }
})
