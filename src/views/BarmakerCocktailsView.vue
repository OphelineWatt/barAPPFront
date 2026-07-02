<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Trash2, X } from 'lucide-vue-next'
import { getCocktails, createCocktail, deleteCocktail, searchExternal } from '@/api/cocktails'
import { getCategories } from '@/api/categories'
import { getIngredients, createIngredient } from '@/api/ingredients'
import type { Cocktail, Category, ExternalCocktail, Ingredient } from '@/types'

const cocktails = ref<Cocktail[]>([])
const categories = ref<Category[]>([])
const allIngredients = ref<Ingredient[]>([])
const externalResults = ref<ExternalCocktail[]>([])
const searchQuery = ref('')
const searching = ref(false)
const loading = ref(true)
const activeTab = ref<'cocktails' | 'categories'>('cocktails')
const showModal = ref(false)
const saving = ref(false)
const error = ref('')

// ingrédients ajoutés au cocktail en cours de création
const chosenIngredients = ref<{ ingredientId: number; name: string; quantity: string }[]>([])
const ingredientToAdd = ref<number | null>(null)
const ingredientQty = ref('')
const newIngredientName = ref('')
const addingIngredient = ref(false)

// ingrédients pas encore ajoutés au cocktail (pour éviter les doublons dans le select)
const availableIngredients = computed(() =>
  allIngredients.value.filter((i) => !chosenIngredients.value.some((c) => c.ingredientId === i.id)),
)

const SIZES = [
  { id: 1, code: 'S' },
  { id: 2, code: 'M' },
  { id: 3, code: 'L' },
]

const form = ref({
  name: '',
  description: '',
  imageUrl: '',
  categoryId: null as number | null,
  active: true,
  priceS: null as number | null,
  priceM: null as number | null,
  priceL: null as number | null,
})

onMounted(async () => {
  try {
    const [c, cats, ings] = await Promise.all([getCocktails(), getCategories(), getIngredients()])
    cocktails.value = c
    categories.value = cats
    allIngredients.value = ings
  } finally {
    loading.value = false
  }
})

function addIngredient() {
  if (ingredientToAdd.value == null) return
  const ing = allIngredients.value.find((i) => i.id === ingredientToAdd.value)
  if (!ing) return
  chosenIngredients.value.push({ ingredientId: ing.id, name: ing.name, quantity: ingredientQty.value.trim() })
  ingredientToAdd.value = null
  ingredientQty.value = ''
}

function removeIngredient(idx: number) {
  chosenIngredients.value.splice(idx, 1)
}

// crée un nouvel ingrédient puis recharge la liste pour pouvoir le sélectionner
async function addNewIngredient() {
  const name = newIngredientName.value.trim()
  if (!name) return
  addingIngredient.value = true
  try {
    await createIngredient({ name })
    allIngredients.value = await getIngredients()
    newIngredientName.value = ''
  } finally {
    addingIngredient.value = false
  }
}

async function searchDb() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  externalResults.value = []
  try {
    externalResults.value = await searchExternal(searchQuery.value.trim())
  } finally {
    searching.value = false
  }
}

function importCocktail(ext: ExternalCocktail) {
  form.value.name = ext.name
  form.value.imageUrl = ext.imageUrl
  form.value.description = ext.ingredients.slice(0, 5).join(', ')
  externalResults.value = []
  searchQuery.value = ''
}

function openModal() {
  form.value = { name: '', description: '', imageUrl: '', categoryId: null, active: true, priceS: null, priceM: null, priceL: null }
  chosenIngredients.value = []
  ingredientToAdd.value = null
  ingredientQty.value = ''
  newIngredientName.value = ''
  error.value = ''
  externalResults.value = []
  searchQuery.value = ''
  showModal.value = true
}

async function save() {
  if (!form.value.name.trim()) {
    error.value = 'Le nom est requis.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const prices = [
      { sizeId: 1, sizeCode: 'S', price: form.value.priceS },
      { sizeId: 2, sizeCode: 'M', price: form.value.priceM },
      { sizeId: 3, sizeCode: 'L', price: form.value.priceL },
    ].filter((p) => p.price !== null) as { sizeId: number; sizeCode: string; price: number }[]

    await createCocktail({
      name: form.value.name,
      description: form.value.description,
      imageUrl: form.value.imageUrl,
      categoryId: form.value.categoryId ?? undefined,
      active: form.value.active,
      ingredients: chosenIngredients.value.map((i) => ({
        ingredientId: i.ingredientId,
        quantity: i.quantity,
      })),
      prices,
    })
    cocktails.value = await getCocktails()
    showModal.value = false
  } catch {
    error.value = 'Erreur lors de la sauvegarde.'
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Supprimer ce cocktail ?')) return
  await deleteCocktail(id)
  cocktails.value = cocktails.value.filter((c) => c.id !== id)
}

function priceLabel(cocktail: Cocktail) {
  if (!cocktail.prices?.length) return ''
  const order: Record<string, number> = { S: 0, M: 1, L: 2 }
  return [...cocktail.prices]
    .sort((a, b) => (order[a.sizeCode ?? ''] ?? 0) - (order[b.sizeCode ?? ''] ?? 0))
    .map((p) => `${p.price}€`)
    .join(' / ')
}

function categoryName(cocktail: Cocktail) {
  const cat = categories.value.find((c) => c.id === cocktail.categoryId)
  return cat?.name ?? ''
}
</script>

<template>
  <div class="page desk-narrow">
    <!-- En-tête de page -->
    <div class="page-header">
      <h1 class="page-title">MA CARTE</h1>
      <button class="btn btn-red add-btn" @click="openModal">
        <Plus :size="14" stroke-width="2.5" />
        Ajouter
      </button>
    </div>

    <!-- Sous-onglets -->
    <div class="sub-tabs">
      <button
        class="sub-tab"
        :class="{ active: activeTab === 'cocktails' }"
        @click="activeTab = 'cocktails'"
      >
        Cocktails
      </button>
      <button
        class="sub-tab"
        :class="{ active: activeTab === 'categories' }"
        @click="activeTab = 'categories'"
      >
        Catégories
      </button>
    </div>

    <!-- Liste cocktails -->
    <div v-if="activeTab === 'cocktails'">
      <div v-if="loading" class="state-msg">Chargement…</div>
      <div v-else-if="cocktails.length === 0" class="state-msg">
        Aucun cocktail. Appuyez sur Ajouter.
      </div>
      <div v-else class="clist">
        <div v-for="c in cocktails" :key="c.id" class="citem">
          <img v-if="c.imageUrl" :src="c.imageUrl" :alt="c.name" class="citem-img" />
          <div v-else class="citem-img no-img" />
          <div class="citem-info">
            <p class="citem-name">{{ c.name }}</p>
            <p class="citem-cat">{{ categoryName(c) }}</p>
          </div>
          <div class="citem-right">
            <p class="citem-prices">{{ priceLabel(c) }}</p>
            <button class="del-btn" @click="remove(c.id)">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste catégories -->
    <div v-if="activeTab === 'categories'">
      <div v-if="categories.length === 0" class="state-msg">Aucune catégorie.</div>
      <div v-else class="clist">
        <div v-for="cat in categories" :key="cat.id" class="cat-item">
          <div class="cat-dot" />
          <div class="cat-info">
            <p class="citem-name">{{ cat.name }}</p>
            <p v-if="cat.description" class="citem-cat">{{ cat.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ajout -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-sheet">
          <div class="modal-header">
            <p class="modal-title spaced">Nouveau cocktail</p>
            <button class="icon-btn" @click="showModal = false"><X :size="18" /></button>
          </div>

          <!-- Recherche TheCocktailDB -->
          <div class="search-row">
            <input
              v-model="searchQuery"
              class="field-input"
              placeholder="Rechercher sur TheCocktailDB…"
              @keyup.enter="searchDb"
            />
            <button class="btn btn-red search-btn" :disabled="searching" @click="searchDb">
              <Search :size="16" />
            </button>
          </div>

          <div v-if="externalResults.length" class="ext-results">
            <div v-for="(ext, i) in externalResults" :key="i" class="ext-item">
              <img v-if="ext.imageUrl" :src="ext.imageUrl" :alt="ext.name" class="ext-img" />
              <div class="ext-info">
                <p class="ext-name">{{ ext.name }}</p>
                <p class="ext-ings">{{ ext.ingredients.slice(0, 3).join(', ') }}</p>
              </div>
              <button class="btn btn-red import-btn" @click="importCocktail(ext)">Importer</button>
            </div>
          </div>

          <div class="divider" />

          <!-- Formulaire -->
          <div class="form-fields">
            <div class="field">
              <label class="field-label">Nom *</label>
              <input v-model="form.name" class="field-input" placeholder="Mojito" />
            </div>
            <div class="field">
              <label class="field-label">Description</label>
              <input v-model="form.description" class="field-input" placeholder="Rhum, menthe, citron…" />
            </div>
            <div class="field">
              <label class="field-label">Image URL</label>
              <input v-model="form.imageUrl" class="field-input" placeholder="https://…" />
            </div>
            <div class="field">
              <label class="field-label">Catégorie</label>
              <select v-model="form.categoryId" class="field-input">
                <option :value="null">— Aucune —</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">Prix (€)</label>
              <div class="prices-row">
                <div v-for="s in SIZES" :key="s.code" class="price-field">
                  <span class="size-badge">{{ s.code }}</span>
                  <input
                    v-model.number="form[`price${s.code}` as 'priceS' | 'priceM' | 'priceL']"
                    class="field-input price-input"
                    type="number"
                    min="0"
                    step="0.5"
                    :placeholder="s.code === 'S' ? '9' : s.code === 'M' ? '12' : '15'"
                  />
                </div>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Ingrédients</label>

              <!-- ingrédients déjà ajoutés -->
              <div v-if="chosenIngredients.length" class="chosen-ings">
                <span v-for="(ing, idx) in chosenIngredients" :key="ing.ingredientId" class="ing-chip">
                  {{ ing.name }}<template v-if="ing.quantity"> · {{ ing.quantity }}</template>
                  <button class="chip-x" @click="removeIngredient(idx)"><X :size="12" /></button>
                </span>
              </div>

              <!-- ajouter un ingrédient existant -->
              <div class="ing-add-row">
                <select v-model="ingredientToAdd" class="field-input">
                  <option :value="null">— Choisir un ingrédient —</option>
                  <option v-for="i in availableIngredients" :key="i.id" :value="i.id">{{ i.name }}</option>
                </select>
                <input v-model="ingredientQty" class="field-input ing-qty" placeholder="5 cl" />
                <button class="btn btn-outline ing-add-btn" @click="addIngredient">
                  <Plus :size="16" />
                </button>
              </div>

              <!-- créer un nouvel ingrédient -->
              <div class="ing-add-row">
                <input
                  v-model="newIngredientName"
                  class="field-input"
                  placeholder="Nouvel ingrédient (ex : Rhum blanc)"
                  @keyup.enter="addNewIngredient"
                />
                <button class="btn btn-outline ing-add-btn wide" :disabled="addingIngredient" @click="addNewIngredient">
                  {{ addingIngredient ? '…' : 'Créer' }}
                </button>
              </div>
            </div>
            <div class="active-row">
              <label class="field-label" style="margin: 0">Actif sur la carte</label>
              <input type="checkbox" v-model="form.active" />
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <div class="form-actions">
            <button class="btn btn-outline" @click="showModal = false">Annuler</button>
            <button class="btn btn-red" :disabled="saving" @click="save">
              {{ saving ? 'Sauvegarde…' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page { padding: 0 0 32px; }

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
}

.page-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  font-size: 12px;
  width: auto;
}

.sub-tabs {
  display: flex;
  padding: 0 16px;
  gap: 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.sub-tab {
  padding: 10px 0;
  background: transparent;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.sub-tab.active {
  color: var(--text);
  border-bottom-color: var(--red);
}

.state-msg { text-align: center; color: var(--muted); padding: 48px 16px; font-size: 14px; }

.clist { display: flex; flex-direction: column; }

.citem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.citem-img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-input);
}

.no-img { background: var(--bg-input); }

.citem-info { flex: 1; min-width: 0; }

.citem-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

.citem-cat { font-size: 12px; color: var(--muted); margin-top: 2px; }

.citem-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.citem-prices {
  font-size: 13px;
  color: var(--gold);
  font-weight: 600;
  white-space: nowrap;
}

.del-btn {
  background: transparent;
  color: var(--muted);
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.del-btn:hover { color: var(--red); }

/* Catégories */
.cat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--red);
  flex-shrink: 0;
}

.cat-info { flex: 1; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modal-sheet {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: 20px 20px 0 0;
  padding: 20px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.14em;
}

.search-row { display: flex; gap: 10px; }
.search-btn { width: 48px; height: 48px; flex-shrink: 0; padding: 0; display: flex; align-items: center; justify-content: center; }

.ext-results { display: flex; flex-direction: column; gap: 8px; }
.ext-item { display: flex; align-items: center; gap: 10px; }
.ext-img { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
.ext-info { flex: 1; min-width: 0; }
.ext-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; }
.ext-ings { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.import-btn { height: 32px; padding: 0 10px; font-size: 11px; width: auto; flex-shrink: 0; }

.form-fields { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 4px; }

.prices-row { display: flex; gap: 8px; }
.price-field { display: flex; align-items: center; gap: 6px; flex: 1; }
.size-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--gold);
  width: 16px;
  flex-shrink: 0;
}
.price-input { text-align: center; padding: 0 8px; }

/* Ingrédients */
.chosen-ings { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.ing-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 4px 6px 4px 10px;
  font-size: 12px;
}
.chip-x {
  display: flex;
  align-items: center;
  background: transparent;
  color: var(--muted);
  padding: 0;
}
.chip-x:hover { color: var(--red); }
.ing-add-row { display: flex; gap: 8px; margin-bottom: 8px; }
.ing-qty { max-width: 80px; text-align: center; }
.ing-add-btn { width: 48px; height: 48px; flex-shrink: 0; padding: 0; }
.ing-add-btn.wide { width: auto; padding: 0 14px; font-size: 12px; }

.active-row { display: flex; align-items: center; justify-content: space-between; }
.error-msg { color: var(--red); font-size: 13px; }
.form-actions { display: flex; gap: 10px; }
.form-actions .btn { flex: 1; }
</style>
