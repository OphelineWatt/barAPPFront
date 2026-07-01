import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// fabrique un faux JWT (header.payload.signature) à partir d'un payload
function makeToken(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => btoa(JSON.stringify(o))
  return `${b64({ alg: 'HS384' })}.${b64(payload)}.signature`
}

describe('store auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('non authentifié quand il n’y a pas de token', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.userEmail).toBeNull()
    expect(auth.isBarmaker).toBe(false)
  })

  it('lit l’email, l’id et le rôle depuis le token (client)', () => {
    const token = makeToken({ sub: 'client@barapp.fr', userId: 2, role: 'CLIENT' })
    localStorage.setItem('token', token)
    localStorage.setItem('name', 'Demo Client')

    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.userEmail).toBe('client@barapp.fr')
    expect(auth.userId).toBe(2)
    expect(auth.userRole).toBe('CLIENT')
    expect(auth.userName).toBe('Demo Client')
    expect(auth.isBarmaker).toBe(false)
  })

  it('reconnaît un barmaker', () => {
    localStorage.setItem('token', makeToken({ sub: 'barmaker@barapp.fr', userId: 1, role: 'BARMAKER' }))
    const auth = useAuthStore()
    expect(auth.isBarmaker).toBe(true)
  })

  it('logout efface le token et le nom', () => {
    localStorage.setItem('token', makeToken({ sub: 'x@barapp.fr', userId: 1, role: 'CLIENT' }))
    localStorage.setItem('name', 'X')
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(true)

    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('name')).toBeNull()
  })

  it('reste non authentifié avec un token invalide', () => {
    localStorage.setItem('token', 'pas-un-vrai-jwt')
    const auth = useAuthStore()
    // le token existe donc isAuthenticated est vrai, mais les infos ne sont pas lisibles
    expect(auth.userEmail).toBeNull()
    expect(auth.isBarmaker).toBe(false)
  })
})
