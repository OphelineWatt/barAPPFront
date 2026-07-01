<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserOrders } from '@/api/orders'
import { updateUser, type UserUpdatePayload } from '@/api/users'
import type { Order } from '@/types'
import { ArrowLeft, Pencil, Shield, ChevronRight, LogOut } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const orders = ref<Order[]>([])

// gestion du mode édition des infos personnelles
const editing = ref(false)
const saving = ref(false)
const editMsg = ref('')
const editError = ref(false)
const emailInput = ref('')
const passwordInput = ref('')

onMounted(async () => {
  if (!auth.userId) return
  try {
    orders.value = await getUserOrders(auth.userId)
  } catch {
    // si ça échoue on ignore, la page profil s'affiche quand même
  }
})

function startEdit() {
  emailInput.value = auth.userEmail ?? ''
  passwordInput.value = ''
  editMsg.value = ''
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  editMsg.value = ''
}

async function saveEdit() {
  if (!auth.userId) return
  if (passwordInput.value && passwordInput.value.length < 6) {
    editError.value = true
    editMsg.value = 'Le mot de passe doit faire au moins 6 caractères.'
    return
  }

  saving.value = true
  editMsg.value = ''
  editError.value = false

  const payload: UserUpdatePayload = {}
  if (emailInput.value && emailInput.value !== auth.userEmail) payload.email = emailInput.value
  if (passwordInput.value) payload.password = passwordInput.value

  if (Object.keys(payload).length === 0) {
    editing.value = false
    saving.value = false
    return
  }

  try {
    await updateUser(auth.userId, payload)
    editMsg.value = 'Modifications enregistrées.'
    editError.value = false
    passwordInput.value = ''
    // si l'email a changé, le token ne correspond plus : on demande de se reconnecter
    if (payload.email) {
      editMsg.value = 'Email modifié. Reconnecte-toi pour continuer.'
    }
    editing.value = false
  } catch {
    editError.value = true
    editMsg.value = 'Erreur : le mot de passe doit faire au moins 6 caractères.'
  } finally {
    saving.value = false
  }
}

const fullName = computed(() => auth.userName ?? auth.userEmail ?? 'Utilisateur')

const initials = computed(() => {
  const parts = fullName.value.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return fullName.value.slice(0, 2).toUpperCase()
})

// statistiques calculées à partir des commandes de l'utilisateur
const ordersCount = computed(() => orders.value.length)
const cocktailsCount = computed(() =>
  orders.value.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  ),
)
const totalSpent = computed(() =>
  orders.value.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
)

// historique des commandes, de la plus récente à la plus ancienne
const history = computed(() =>
  [...orders.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
)

function orderTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function orderCocktails(order: Order) {
  return order.items.map((i) => i.cocktailName).join(', ')
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="profile-screen">
    <!-- En-tête -->
    <header class="p-header">
      <button class="icon-btn" @click="router.back()"><ArrowLeft :size="20" /></button>
      <span class="logo">Bar<span>'</span>App</span>
      <span class="page-chip spaced">Profil</span>
    </header>

    <div class="p-body desk-narrow">
      <!-- Avatar + identité -->
      <div class="identity">
        <div class="avatar-wrap">
          <div class="avatar">{{ initials }}</div>
          <span class="role-badge" :class="auth.isBarmaker ? 'bm' : 'cl'">
            {{ auth.isBarmaker ? 'BM' : 'CL' }}
          </span>
        </div>
        <h1 class="name">{{ fullName }}</h1>
        <p class="email">{{ auth.userEmail }}</p>
      </div>

      <!-- Statistiques -->
      <div class="stats">
        <div class="stat card">
          <p class="stat-value">{{ ordersCount }}</p>
          <p class="stat-label spaced">Commandes</p>
        </div>
        <div class="stat card">
          <p class="stat-value">{{ cocktailsCount }}</p>
          <p class="stat-label spaced">Cocktails</p>
        </div>
        <div class="stat card">
          <p class="stat-value gold">{{ totalSpent }}€</p>
          <p class="stat-label spaced">Dépensé</p>
        </div>
      </div>

      <!-- Informations personnelles -->
      <section class="section">
        <div class="section-head">
          <p class="section-label spaced">Informations personnelles</p>
          <button v-if="!editing" class="edit-link" @click="startEdit">
            <Pencil :size="12" />
            <span>Modifier</span>
          </button>
        </div>

        <div class="field">
          <label class="field-label">Email</label>
          <input
            v-if="editing"
            v-model="emailInput"
            class="field-input"
            type="email"
            autocomplete="email"
          />
          <input v-else class="field-input" :value="auth.userEmail" readonly />
        </div>
        <div class="field">
          <label class="field-label">Mot de passe</label>
          <input
            v-if="editing"
            v-model="passwordInput"
            class="field-input"
            type="password"
            placeholder="Nouveau mot de passe (laisser vide pour garder)"
            autocomplete="new-password"
          />
          <input v-else class="field-input" type="password" value="********" readonly />
        </div>

        <p v-if="editMsg" class="edit-msg" :class="{ err: editError }">{{ editMsg }}</p>

        <div v-if="editing" class="edit-actions">
          <button class="btn btn-outline" @click="cancelEdit">Annuler</button>
          <button class="btn btn-red" :disabled="saving" @click="saveEdit">
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </section>

      <!-- Historique -->
      <section class="section">
        <p class="section-label spaced">Historique des commandes</p>
        <p v-if="history.length === 0" class="empty">Aucune commande pour l'instant.</p>
        <div v-else class="history">
          <div v-for="o in history" :key="o.id" class="hist-item card">
            <div class="hist-info">
              <p class="hist-meta">ORD-{{ String(o.id).padStart(3, '0') }} · {{ orderTime(o.createdAt) }}</p>
              <p class="hist-cocktails">{{ orderCocktails(o) }}</p>
            </div>
            <p class="hist-total gold">{{ o.totalAmount }}€</p>
          </div>
        </div>
      </section>

      <!-- Sécurité -->
      <section class="section">
        <p class="section-label spaced"><Shield :size="13" class="inline-ic" /> Sécurité</p>
        <button class="nav-row card">
          <span>Changer le mot de passe</span>
          <ChevronRight :size="18" class="chev" />
        </button>
      </section>

      <button class="btn btn-outline logout-btn" @click="logout">
        <LogOut :size="16" />
        <span class="spaced">Se déconnecter</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-screen { min-height: 100dvh; display: flex; flex-direction: column; }

/* En-tête */
.p-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--header-h);
  padding: 0 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.page-chip {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
}

.p-body { padding: 24px 16px 40px; display: flex; flex-direction: column; gap: 24px; }

/* Identité */
.identity { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.avatar-wrap { position: relative; margin-bottom: 6px; }
.avatar {
  width: 84px;
  height: 84px;
  border-radius: 14px;
  background: var(--bg-input);
  border: 2px solid var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 32px;
  font-weight: 900;
}
.role-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  border: 2px solid var(--bg);
}
.role-badge.cl { background: var(--red); color: #fff; }
.role-badge.bm { background: var(--gold); color: #000; }
.name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 24px;
  font-weight: 800;
}
.email { font-size: 13px; color: var(--muted); }

/* Statistiques */
.stats { display: flex; gap: 10px; }
.stat { flex: 1; padding: 16px 8px; text-align: center; }
.stat-value {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}
.stat-value.gold { color: var(--gold); }
.stat-label { font-size: 9px; color: var(--muted); margin-top: 6px; }

/* Sections de la page */
.section { display: flex; flex-direction: column; gap: 12px; }
.section-head { display: flex; align-items: center; justify-content: space-between; }
.section-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.inline-ic { color: var(--muted); }
.edit-link {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.field { display: flex; flex-direction: column; gap: 4px; }
.field-input[readonly] { color: var(--text); cursor: default; }

.edit-msg { font-size: 12px; color: #27ae60; }
.edit-msg.err { color: var(--red); }
.edit-actions { display: flex; gap: 10px; margin-top: 4px; }
.edit-actions .btn { flex: 1; }

/* Historique */
.history { display: flex; flex-direction: column; gap: 10px; }
.hist-item { display: flex; align-items: center; gap: 12px; padding: 14px; }
.hist-info { flex: 1; min-width: 0; }
.hist-meta {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--muted);
}
.hist-cocktails {
  font-size: 14px;
  font-weight: 600;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hist-total { font-size: 15px; font-weight: 700; flex-shrink: 0; }
.gold { color: var(--gold); }
.empty { font-size: 13px; color: var(--muted); }

/* Sécurité rows */
.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
  color: var(--text);
  font-size: 14px;
  text-align: left;
  width: 100%;
}
.chev { color: var(--muted); }

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
