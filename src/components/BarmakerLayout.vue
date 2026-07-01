<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getOrders } from '@/api/orders'
import { Zap, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const active = computed(() => route.name as string)
const pendingCount = ref(0)

onMounted(async () => {
  try {
    const orders = await getOrders('COMMANDEE')
    pendingCount.value = orders.length
  } catch {
    // en cas d'erreur on ignore, le compteur reste juste à 0
  }
})
</script>

<template>
  <!-- En-tête barmaker -->
  <header class="bm-header">
    <div class="bm-header-left">
      <Zap :size="16" class="bm-icon" />
      <span class="bm-label spaced">Barmaker</span>
    </div>
    <router-link to="/barmaker/orders" class="logo">Bar<span>'</span>App</router-link>
    <button class="icon-btn" @click="router.push('/profile')"><User :size="20" /></button>
  </header>

  <!-- Onglets de navigation -->
  <nav class="bm-tabs">
    <button
      class="tab-btn"
      :class="{ active: active === 'barmaker-orders' }"
      @click="router.push({ name: 'barmaker-orders' })"
    >
      Commandes
      <span v-if="pendingCount > 0" class="tab-count">({{ pendingCount }})</span>
    </button>
    <button
      class="tab-btn"
      :class="{ active: active === 'barmaker-cocktails' }"
      @click="router.push({ name: 'barmaker-cocktails' })"
    >
      Ma Carte
    </button>
    <button
      class="tab-btn"
      :class="{ active: active === 'barmaker-team' }"
      @click="router.push({ name: 'barmaker-team' })"
    >
      Équipe
    </button>
  </nav>

  <main class="bm-content">
    <RouterView />
  </main>
</template>

<style scoped>
.bm-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 0 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.bm-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bm-icon {
  color: var(--gold);
  flex-shrink: 0;
}

.bm-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.14em;
}

.bm-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: var(--header-h);
  z-index: 99;
}

.tab-btn {
  flex: 1;
  height: var(--tabs-h);
  background: transparent;
  color: var(--muted);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.tab-btn.active {
  color: var(--text);
  border-bottom-color: var(--gold);
}

.tab-count { color: var(--gold); }

.bm-content { flex: 1; overflow-y: auto; }

/* En desktop les onglets restent groupés à gauche au lieu de s'étirer */
@media (min-width: 768px) {
  .tab-btn { flex: 0 0 auto; padding: 0 28px; }
}
</style>
