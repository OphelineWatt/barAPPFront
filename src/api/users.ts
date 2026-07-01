import api from './axios'

export interface UserUpdatePayload {
  email?: string
  name?: string
  password?: string
  role?: string
}

export const updateUser = (id: number, data: UserUpdatePayload) =>
  api.put(`/users/${id}`, data)
