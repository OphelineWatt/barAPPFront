import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Cocktail } from '@/types'

export interface CartItem {
  cocktail: Cocktail
  sizeId: number
  sizeCode: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))

  function add(cocktail: Cocktail, sizeId: number, sizeCode: string, price: number) {
    const existing = items.value.find(
      (i) => i.cocktail.id === cocktail.id && i.sizeId === sizeId,
    )
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({ cocktail, sizeId, sizeCode, price, quantity: 1 })
    }
  }

  function increment(index: number) {
    const item = items.value[index]
    if (item) item.quantity++
  }

  function decrement(index: number) {
    const item = items.value[index]
    if (!item) return
    if (item.quantity > 1) {
      item.quantity--
    } else {
      items.value.splice(index, 1)
    }
  }

  function remove(index: number) {
    items.value.splice(index, 1)
  }

  function clear() {
    items.value = []
  }

  return { items, count, total, add, increment, decrement, remove, clear }
})
