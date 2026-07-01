import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import MenuView from '@/views/MenuView.vue'
import { useCartStore } from '@/stores/cart'

// on mocke les appels API pour ne pas dépendre du backend pendant le test
vi.mock('@/api/cocktails', () => ({
  getCocktails: () =>
    Promise.resolve([
      {
        id: 1,
        name: 'Mojito',
        description: 'Menthe et rhum',
        categoryId: 1,
        active: true,
        ingredients: [],
        prices: [
          { sizeId: 1, sizeCode: 'S', price: 9 },
          { sizeId: 2, sizeCode: 'M', price: 12 },
        ],
      },
    ]),
}))

vi.mock('@/api/categories', () => ({
  getCategories: () => Promise.resolve([{ id: 1, name: 'Classiques' }]),
}))

describe('MenuView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche les cocktails renvoyés par l’API', async () => {
    const wrapper = mount(MenuView)
    await flushPromises() // on attend le chargement (onMounted async)
    expect(wrapper.text()).toContain('Mojito')
    expect(wrapper.text()).toContain('Classiques')
  })

  it('ajoute un cocktail au panier au clic sur « Ajouter »', async () => {
    const wrapper = mount(MenuView)
    await flushPromises()
    const cart = useCartStore()
    expect(cart.count).toBe(0)

    await wrapper.get('.add-btn').trigger('click')
    expect(cart.count).toBe(1)
    // par défaut, la première taille (S, 9€) est sélectionnée
    expect(cart.total).toBe(9)
  })
})
