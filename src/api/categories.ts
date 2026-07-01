import api from './axios'
import type { Category } from '@/types'

export const getCategories = () => api.get<Category[]>('/categories').then((r) => r.data)
