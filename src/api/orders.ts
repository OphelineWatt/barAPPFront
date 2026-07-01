import api from './axios'
import type { Order, OrderCreateRequest } from '@/types'

export const getOrders = (status?: string) =>
  api.get<Order[]>('/orders', { params: status ? { status } : {} }).then((r) => r.data)

export const getUserOrders = (userId: number) =>
  api.get<Order[]>(`/orders/user/${userId}`).then((r) => r.data)

export const createOrder = (data: OrderCreateRequest) =>
  api.post<void>('/orders', data)

export const advanceItem = (orderId: number, itemId: number) =>
  api.post<void>(`/orders/${orderId}/advance-item/${itemId}`)
