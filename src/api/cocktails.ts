import api from './axios'
import type { Cocktail, ExternalCocktail } from '@/types'

export const getCocktails = () => api.get<Cocktail[]>('/cocktails').then((r) => r.data)
export const getCocktail = (id: number) => api.get<Cocktail>(`/cocktails/${id}`).then((r) => r.data)
export const createCocktail = (data: Partial<Cocktail>) => api.post('/cocktails', data)
export const updateCocktail = (id: number, data: Partial<Cocktail>) =>
  api.put(`/cocktails/${id}`, data)
export const deleteCocktail = (id: number) => api.delete(`/cocktails/${id}`)
export const searchExternal = (name: string) =>
  api.get<ExternalCocktail[]>('/external/cocktails/search', { params: { name } }).then((r) => r.data)
