import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cart'
import type { Cocktail } from '@/types'

// petit cocktail factice pour les tests
function fakeCocktail(id: number, name = 'Mojito'): Cocktail {
  return { id, name, active: true, ingredients: [], prices: [] }
}

describe('store panier', () => {
  beforeEach(() => {
    // une nouvelle instance de Pinia avant chaque test => panier vide
    setActivePinia(createPinia())
  })

  it('démarre vide', () => {
    const cart = useCartStore()
    expect(cart.items).toHaveLength(0)
    expect(cart.count).toBe(0)
    expect(cart.total).toBe(0)
  })

  it('ajoute un cocktail au panier', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 2, 'M', 12)
    expect(cart.items).toHaveLength(1)
    expect(cart.count).toBe(1)
    expect(cart.total).toBe(12)
  })

  it('incrémente la quantité si le même cocktail et la même taille sont réajoutés', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 2, 'M', 12)
    cart.add(fakeCocktail(1), 2, 'M', 12)
    expect(cart.items).toHaveLength(1)
    expect(cart.count).toBe(2)
    expect(cart.total).toBe(24)
  })

  it('crée une ligne distincte pour une taille différente du même cocktail', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 1, 'S', 9)
    cart.add(fakeCocktail(1), 3, 'L', 15)
    expect(cart.items).toHaveLength(2)
    expect(cart.total).toBe(24)
  })

  it('calcule le total avec plusieurs cocktails', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1, 'Mojito'), 2, 'M', 12)
    cart.add(fakeCocktail(2, 'Negroni'), 2, 'M', 13)
    cart.increment(0) // 2 Mojito
    expect(cart.count).toBe(3)
    expect(cart.total).toBe(12 * 2 + 13)
  })

  it('décrémente et retire la ligne quand la quantité tombe à 0', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 2, 'M', 12)
    cart.increment(0) // quantité = 2
    cart.decrement(0) // quantité = 1
    expect(cart.count).toBe(1)
    cart.decrement(0) // quantité = 0 => ligne supprimée
    expect(cart.items).toHaveLength(0)
  })

  it('retire une ligne avec remove()', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 2, 'M', 12)
    cart.add(fakeCocktail(2), 2, 'M', 13)
    cart.remove(0)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.cocktail.id).toBe(2)
  })

  it('vide le panier avec clear()', () => {
    const cart = useCartStore()
    cart.add(fakeCocktail(1), 2, 'M', 12)
    cart.clear()
    expect(cart.items).toHaveLength(0)
    expect(cart.count).toBe(0)
  })
})
