import api from './axios'
import type { Ingredient } from '@/types'

export const getIngredients = () => api.get<Ingredient[]>('/ingredients').then((r) => r.data)

// création d'un ingrédient (réservée aux barmakers)
export const createIngredient = (data: { name: string; unit?: string }) =>
  api.post('/ingredients', data)
