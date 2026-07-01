<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { getOrders, advanceItem } from '@/api/orders'
import type { Order } from '@/types'

const orders = ref<Order[]>([])
const loading = ref(true)
const expanded = ref<number | null>(null)

const ITEM_STEPS = ['PREPARATION_INGREDIENTS', 'ASSEMBLAGE', 'DRESSAGE', 'TERMINEE']
const ITEM_LABELS: Record<string, string> = {
  PREPARATION_INGREDIENTS: 'Prép.',
  ASSEMBLAGE: 'Assemblage',
  DRESSAGE: 'Dressage',
  TERMINEE: 'Terminée',
}

async function load() {
  try {
    orders.value = await getOrders()
  } finally {
    loading.value = false
  }
}

let interval: ReturnType<typeof setInterval>
onMounted(() => { load(); interval = setInterval(load, 8000) })
onUnmounted(() => clearInterval(interval))

async function advance(orderId: number, itemId: number) {
  await advanceItem(orderId, itemId)
  await load()
}

function toggle(id: number) {
  expanded.value = expanded.value === id ? null : id
}

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
function itemDone(status: string) { return status === 'TERMINEE' }
function nextLabel(status: string) {
  const idx = ITEM_STEPS.indexOf(status)
  if (idx < 0 || idx >= ITEM_STEPS.length - 1) return null
  const next = ITEM_STEPS[idx + 1]
  return next ? ITEM_LABELS[next] : null
}

const pendingCount = computed(() => orders.value.filter((o) => o.status !== 'TERMINEE').length)
</script>

<template>
  <div class="bm-orders-page desk-narrow">
    <h2 class="section-title">Commandes</h2>

    <div v-if="loading" class="state-msg">Chargement…</div>
    <div v-else-if="orders.length === 0" class="state-msg">Aucune commande.</div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card card">
        <!-- Ligne principale de la commande -->
        <div class="order-row" @click="toggle(order.id)">
          <div class="order-left">
            <div class="order-top">
              <span class="order-id">ORD-{{ String(order.id).padStart(3, '0') }}</span>
              <span class="badge" :class="statusClass(order.status)">
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <p class="order-count">{{ order.items.length }} cocktail{{ order.items.length > 1 ? 's' : '' }}</p>
          </div>

          <!-- Petits carrés qui montrent l'avancement de chaque cocktail -->
          <div class="progress-dots">
            <span
              v-for="item in order.items"
              :key="item.id"
              class="dot"
              :class="{
                done: item.itemStatus === 'TERMINEE',
                progress: item.itemStatus !== 'TERMINEE' && item.itemStatus !== 'PREPARATION_INGREDIENTS',
              }"
            />
          </div>

          <span class="chevron">{{ expanded === order.id ? '∨' : '›' }}</span>
        </div>

        <!-- Détail affiché quand on déplie la commande -->
        <div v-if="expanded === order.id" class="order-items">
          <div class="divider" style="margin: 0 16px" />
          <div
            v-for="item in order.items"
            :key="item.id"
            class="item-row"
            :class="{ done: itemDone(item.itemStatus) }"
          >
            <div class="item-info">
              <p class="item-name">{{ item.cocktailName }}</p>
              <p class="item-sub">{{ item.sizeCode }} × {{ item.quantity }}</p>
              <span class="item-step">{{ ITEM_LABELS[item.itemStatus] ?? item.itemStatus }}</span>
            </div>
            <button
              v-if="!itemDone(item.itemStatus)"
              class="advance-btn btn btn-red"
              @click.stop="advance(order.id, item.id)"
            >
              → {{ nextLabel(item.itemStatus) }}
            </button>
            <span v-else class="done-label">✓ Prêt</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bm-orders-page { padding: 20px 16px; }
.state-msg { text-align: center; color: var(--muted); padding: 48px 0; }

.orders-list { display: flex; flex-direction: column; gap: 12px; }

.order-card { border-radius: var(--radius); }

.order-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  user-select: none;
}

.order-left { flex: 1; }
.order-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.order-id {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.order-count { font-size: 13px; color: var(--muted); }

.progress-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--border);
  flex-shrink: 0;
}
.dot.progress { background: var(--gold); }
.dot.done { background: #27ae60; }

.chevron { color: var(--muted); font-size: 18px; }

.order-items { padding: 0 16px 16px; display: flex; flex-direction: column; gap: 12px; padding-top: 12px; }

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.item-row.done { opacity: 0.5; }

.item-info { flex: 1; }
.item-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
}
.item-sub { font-size: 12px; color: var(--muted); }
.item-step {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--gold);
  font-weight: 600;
  letter-spacing: 0.06em;
}

.advance-btn {
  width: auto;
  height: 36px;
  padding: 0 14px;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.done-label {
  font-size: 13px;
  color: #27ae60;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
