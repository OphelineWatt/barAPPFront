<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCocktails, createCocktail, deleteCocktail, searchExternal } from '@/api/cocktails'
import { getCategories } from '@/api/categories'
import type { Cocktail, Category, ExternalCocktail } from '@/types'

const cocktails = ref<Cocktail[]>([])
const categories = ref<Category[]>([])
const externalResults = ref<ExternalCocktail[]>([])
const searchQuery = ref('')
const searching = ref(false)
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const error = ref('')

const form = ref({
  name: '',
  description: '',
  imageUrl: '',
  categoryId: null as number | null,
  active: true,
})

onMounted(async () => {
  try {
    const [c, cats] = await Promise.all([getCocktails(), getCategories()])
    cocktails.value = c
    categories.value = cats
  } finally {
    loading.value = false
  }
})

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
  showForm.value = true
  externalResults.value = []
  searchQuery.value = ''
}

function openForm() {
  form.value = { name: '', description: '', imageUrl: '', categoryId: null, active: true }
  showForm.value = true
}

async function save() {
  if (!form.value.name.trim()) {
    error.value = 'Le nom est requis.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await createCocktail({
      name: form.value.name,
      description: form.value.description,
      imageUrl: form.value.imageUrl,
      categoryId: form.value.categoryId ?? undefined,
      active: form.value.active,
      ingredients: [],
      prices: [],
    })
    cocktails.value = await getCocktails()
    showForm.value = false
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
</script>

<template>
  <div class="bm-cocktails-page">
    <!-- TheCocktailDB search -->
    <div class="search-section">
      <p class="section-label spaced">Rechercher sur TheCocktailDB</p>
      <div class="search-row">
        <input
          v-model="searchQuery"
          class="field-input"
          placeholder="Ex : Mojito, Negroni…"
          @keyup.enter="searchDb"
        />
        <button class="btn btn-red search-btn" :disabled="searching" @click="searchDb">
          {{ searching ? '…' : '🔍' }}
        </button>
      </div>

      <div v-if="externalResults.length" class="external-results">
        <div v-for="(ext, i) in externalResults" :key="i" class="ext-item card">
          <img v-if="ext.imageUrl" :src="ext.imageUrl" :alt="ext.name" class="ext-img" />
          <div class="ext-info">
            <p class="ext-name">{{ ext.name }}</p>
            <p class="ext-ings">{{ ext.ingredients.slice(0, 3).join(', ') }}</p>
          </div>
          <button class="btn btn-red import-btn" @click="importCocktail(ext)">Importer</button>
        </div>
      </div>
    </div>

    <div class="divider" />

    <!-- Create form -->
    <div v-if="showForm" class="form-section">
      <p class="section-label spaced">Nouveau cocktail</p>
      <div class="form-fields">
        <div class="field">
          <label class="field-label">Nom *</label>
          <input v-model="form.name" class="field-input" placeholder="Mojito" />
        </div>
        <div class="field">
          <label class="field-label">Description / Ingrédients</label>
          <input v-model="form.description" class="field-input" placeholder="Rhum, menthe…" />
        </div>
        <div class="field">
          <label class="field-label">Image URL</label>
          <input v-model="form.imageUrl" class="field-input" placeholder="https://…" />
        </div>
        <div class="field">
          <label class="field-label">Catégorie</label>
          <select v-model="form.categoryId" class="field-input">
            <option :value="null">— Aucune —</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="active-row">
          <label class="field-label" style="margin: 0">Actif sur la carte</label>
          <input type="checkbox" v-model="form.active" />
        </div>
      </div>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div class="form-actions">
        <button class="btn btn-outline" @click="showForm = false">Annuler</button>
        <button class="btn btn-red" :disabled="saving" @click="save">
          {{ saving ? 'Sauvegarde…' : 'Créer' }}
        </button>
      </div>
    </div>

    <button v-if="!showForm" class="btn btn-outline" @click="openForm">+ Nouveau cocktail</button>

    <div class="divider" />

    <!-- Cocktail list -->
    <h2 class="section-title">Ma carte</h2>
    <div v-if="loading" class="state-msg">Chargement…</div>
    <div v-else-if="cocktails.length === 0" class="state-msg">Aucun cocktail.</div>
    <div v-else class="clist">
      <div v-for="c in cocktails" :key="c.id" class="citem card">
        <img v-if="c.imageUrl" :src="c.imageUrl" :alt="c.name" class="citem-img" />
        <div v-else class="citem-img no-img">🍹</div>
        <div class="citem-info">
          <p class="citem-name">{{ c.name }}</p>
          <p v-if="c.description" class="citem-desc">{{ c.description }}</p>
          <span class="badge" :class="c.active ? 'badge-done' : 'badge-pending'">
            {{ c.active ? 'Actif' : 'Inactif' }}
          </span>
        </div>
        <button class="del-btn" @click="remove(c.id)">🗑</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bm-cocktails-page { padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
.state-msg { text-align: center; color: var(--muted); padding: 32px 0; }
.section-label { font-size: 10px; font-weight: 700; color: var(--muted); margin-bottom: 10px; display: block; }

.search-row { display: flex; gap: 10px; }
.search-btn { width: 48px; height: 48px; flex-shrink: 0; padding: 0; }

.external-results { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.ext-item { display: flex; align-items: center; gap: 12px; padding: 12px; }
.ext-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.ext-info { flex: 1; min-width: 0; }
.ext-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; }
.ext-ings { font-size: 11px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.import-btn { width: auto; height: 36px; padding: 0 12px; font-size: 12px; flex-shrink: 0; }

.form-section { display: flex; flex-direction: column; gap: 12px; }
.form-fields { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; }
.active-row { display: flex; align-items: center; justify-content: space-between; }
.error-msg { color: var(--red); font-size: 13px; }
.form-actions { display: flex; gap: 10px; }
.form-actions .btn { flex: 1; }

.clist { display: flex; flex-direction: column; gap: 10px; }
.citem { display: flex; align-items: center; gap: 12px; padding: 12px; }
.citem-img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
.no-img { display: flex; align-items: center; justify-content: center; background: var(--bg-input); font-size: 24px; }
.citem-info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.citem-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.citem-desc { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.del-btn { background: transparent; font-size: 18px; flex-shrink: 0; padding: 4px; }
</style>
