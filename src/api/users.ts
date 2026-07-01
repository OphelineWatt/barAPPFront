import api from './axios'

export interface UserUpdatePayload {
  email?: string
  name?: string
  password?: string
  role?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const updateUser = (id: number, data: UserUpdatePayload) =>
  api.put(`/users/${id}`, data)

// inscription publique : crée toujours un compte client
export const registerClient = (data: RegisterPayload) => api.post('/users', data)

// création d'un compte barmaker (réservée aux barmakers connectés)
export const createBarmaker = (data: RegisterPayload) => api.post('/users/barmakers', data)
