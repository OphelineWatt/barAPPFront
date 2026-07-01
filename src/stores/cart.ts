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
    items.value[index].quantity++
  }

  function decrement(index: number) {
    if (items.value[index].quantity > 1) {
      items.value[index].quantity--
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
