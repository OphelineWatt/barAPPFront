<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getUserOrders } from '@/api/orders'
import type { Order } from '@/types'

const auth = useAuthStore()
const orders = ref<Order[]>([])
const loading = ref(true)

const ITEM_LABELS: Record<string, string> = {
  PREPARATION_INGREDIENTS: 'Préparation',
  ASSEMBLAGE: 'Assemblage',
  DRESSAGE: 'Dressage',
  TERMINEE: 'Terminée',
}

const lastOrder = computed(() => orders.value[0] ?? null)

async function load() {
  if (!auth.userId) return
  try {
    const data = await getUserOrders(auth.userId)
    orders.value = data
  } finally {
    loading.value = false
  }
}

let interval: ReturnType<typeof setInterval>
onMounted(() => {
  load()
  interval = setInterval(load, 10000)
})
onUnmounted(() => clearInterval(interval))

function statusClass(s: string) {
  if (s === 'COMMANDEE') return 'badge-pending'
  if (s === 'EN_COURS') return 'badge-progress'
  return 'badge-done'
}

function statusLabel(s: string) {
  if (s === 'COMMANDEE') return 'En attente'
  if (s === 'EN_COURS') return 'En cours'
  return 'Terminée'
}
</script>

<template>
  <div class="tracking-page">
    <h2 class="section-title">Suivi de commande</h2>

    <div v-if="loading" class="state-msg">Chargement…</div>
    <div v-else-if="!lastOrder" class="state-msg">
      <p>Aucune commande passée.</p>
    </div>

    <div v-else class="order-detail">
      <!-- Order summary -->
      <div class="order-header card">
        <div class="order-meta">
          <span class="order-id">ORD-{{ String(lastOrder.id).padStart(3, '0') }}</span>
          <span class="badge" :class="statusClass(lastOrder.status)">
            {{ statusLabel(lastOrder.status) }}
          </span>
        </div>
        <p class="order-desc">
          <span v-if="lastOrder.status === 'COMMANDEE'">En attente du barmaker</span>
          <span v-else-if="lastOrder.status === 'EN_COURS'">Votre commande est en préparation</span>
          <span v-else>Votre commande est prête ! 🎉</span>
        </p>
      </div>

      <!-- Items -->
      <p class="items-title spaced">Cocktails</p>

      <div class="items-list">
        <div v-for="item in lastOrder.items" :key="item.id" class="item-card card">
          <div class="item-left">
            <p class="item-name">{{ item.cocktailName }}</p>
            <p class="item-sub">{{ item.sizeCode }} × {{ item.quantity }}</p>
            <p class="item-step">{{ ITEM_LABELS[item.itemStatus] ?? item.itemStatus }}</p>
          </div>
          <span class="badge item-badge" :class="statusClass(item.itemStatus === 'TERMINEE' ? 'TERMINEE' : item.itemStatus === 'PREPARATION_INGREDIENTS' ? 'COMMANDEE' : 'EN_COURS')">
            {{ item.itemStatus === 'TERMINEE' ? 'Prêt' : 'En cours' }}
          </span>
        </div>
      </div>

      <p class="refresh-note">Les étapes se mettent à jour en temps réel</p>

      <!-- All orders -->
      <div v-if="orders.length > 1" class="history">
        <p class="items-title spaced" style="margin-top:24px">Historique</p>
        <div v-for="o in orders.slice(1)" :key="o.id" class="history-item card">
          <span class="order-id">ORD-{{ String(o.id).padStart(3,'0') }}</span>
          <span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
          <span class="h-total">{{ o.totalAmount?.toFixed(0) }}€</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tracking-page { padding: 20px 16px; }
.state-msg { text-align: center; color: var(--muted); padding: 48px 0; }

.order-detail { display: flex; flex-direction: column; gap: 16px; }

.order-header { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.order-meta { display: flex; align-items: center; gap: 10px; }
.order-id {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.order-desc { font-size: 14px; color: var(--text); }

.items-title { font-size: 10px; font-weight: 700; color: var(--muted); }

.items-list { display: flex; flex-direction: column; gap: 10px; }

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
}
.item-left { display: flex; flex-direction: column; gap: 3px; }
.item-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 17px;
  font-weight: 700;
}
.item-sub { font-size: 12px; color: var(--muted); }
.item-step { font-size: 12px; color: var(--gold); margin-top: 4px; }

.refresh-note { font-size: 12px; color: var(--muted); text-align: center; }

.history { display: flex; flex-direction: column; gap: 10px; }
.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}
.h-total {
  margin-left: auto;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  color: var(--gold);
}
</style>
