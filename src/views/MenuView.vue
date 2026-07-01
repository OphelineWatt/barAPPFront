<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { getCocktails } from '@/api/cocktails'
import { getCategories } from '@/api/categories'
import type { Cocktail, Category } from '@/types'

const cart = useCartStore()
const cocktails = ref<Cocktail[]>([])
const categories = ref<Category[]>([])
const activeCategory = ref<number | null>(null)
const selectedSizes = ref<Record<number, number>>({})
const loading = ref(true)

onMounted(async () => {
  try {
    const [c, cats] = await Promise.all([getCocktails(), getCategories()])
    cocktails.value = c.filter((c) => c.active)
    categories.value = cats
    // default selected size = first price for each cocktail
    cocktails.value.forEach((c) => {
      const first = c.prices?.[0]
      if (first) selectedSizes.value[c.id] = first.sizeId
    })
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!activeCategory.value) return cocktails.value
  return cocktails.value.filter((c) => c.categoryId === activeCategory.value)
})

function selectedPrice(cocktail: Cocktail) {
  const sizeId = selectedSizes.value[cocktail.id]
  return cocktail.prices?.find((p) => p.sizeId === sizeId)
}

function addToCart(cocktail: Cocktail) {
  const p = selectedPrice(cocktail)
  if (!p) return
  cart.add(cocktail, p.sizeId, p.sizeCode ?? '', p.price)
}

function categoryName(id?: number) {
  if (!id) return ''
  return categories.value.find((c) => c.id === id)?.name ?? ''
}
</script>

<template>
  <!-- Category filters -->
  <div class="filters">
    <button
      class="filter-chip"
      :class="{ active: activeCategory === null }"
      @click="activeCategory = null"
    >
      Tous
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="filter-chip"
      :class="{ active: activeCategory === cat.id }"
      @click="activeCategory = cat.id"
    >
      {{ cat.name }}
    </button>
  </div>

  <div v-if="loading" class="state-msg">Chargement…</div>
  <div v-else-if="filtered.length === 0" class="state-msg">Aucun cocktail disponible.</div>

  <!-- Cocktail list -->
  <div v-else class="cocktail-list">
    <div v-for="cocktail in filtered" :key="cocktail.id" class="cocktail-card card">
      <!-- Image -->
      <div class="img-wrap">
        <img
          v-if="cocktail.imageUrl"
          :src="cocktail.imageUrl"
          :alt="cocktail.name"
          class="cocktail-img"
        />
        <div v-else class="cocktail-img no-img">🍹</div>
        <span class="cat-badge">{{ categoryName(cocktail.categoryId) }}</span>
        <span class="price-tag">
          {{ selectedPrice(cocktail)?.price?.toFixed(0) ?? '–' }}€
        </span>
      </div>

      <!-- Info -->
      <div class="cocktail-body">
        <h3 class="cocktail-name">{{ cocktail.name }}</h3>
        <p v-if="cocktail.description" class="cocktail-desc">{{ cocktail.description }}</p>

        <!-- Size selector -->
        <div v-if="cocktail.prices?.length" class="size-row">
          <button
            v-for="p in cocktail.prices"
            :key="p.sizeId"
            class="size-btn"
            :class="{ active: selectedSizes[cocktail.id] === p.sizeId }"
            @click="selectedSizes[cocktail.id] = p.sizeId"
          >
            {{ p.sizeCode }} · {{ p.price }}€
          </button>
        </div>

        <button class="btn btn-red add-btn" @click="addToCart(cocktail)">
          + Ajouter au panier
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--border);
}
.filters::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--muted);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: all 0.15s;
}
.filter-chip.active {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.state-msg {
  text-align: center;
  color: var(--muted);
  padding: 48px 16px;
}

.cocktail-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.cocktail-card { border-radius: var(--radius); }

.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.cocktail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: var(--bg-input);
}

.cat-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,.7);
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.price-tag {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: var(--gold);
  text-shadow: 0 1px 4px rgba(0,0,0,.8);
}

.cocktail-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cocktail-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.cocktail-desc {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

.size-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-btn {
  padding: 5px 12px;
  border-radius: 6px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--muted);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 0.15s;
}
.size-btn.active {
  background: var(--red);
  border-color: var(--red);
  color: #fff;
}

.add-btn { margin-top: 4px; }
</style>
