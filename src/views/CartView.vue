<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { createOrder } from '@/api/orders'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const loading = ref(false)
const error = ref('')

async function order() {
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/cart' } })
    return
  }
  loading.value = true
  error.value = ''
  try {
    await createOrder({
      userId: auth.userId!,
      items: cart.items.map((i) => ({
        cocktailId: i.cocktail.id,
        sizeId: i.sizeId,
        quantity: i.quantity,
      })),
    })
    cart.clear()
    router.push({ name: 'order' })
  } catch {
    error.value = 'Erreur lors de la commande. Réessaie.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="cart-page">
    <h2 class="section-title">Votre panier</h2>

    <div v-if="cart.items.length === 0" class="empty">
      <p>Ton panier est vide.</p>
      <button class="btn btn-outline" style="margin-top:16px" @click="router.push('/menu')">
        Voir la carte
      </button>
    </div>

    <div v-else>
      <div class="cart-items">
        <div v-for="(item, idx) in cart.items" :key="idx" class="cart-item card">
          <img
            v-if="item.cocktail.imageUrl"
            :src="item.cocktail.imageUrl"
            :alt="item.cocktail.name"
            class="item-img"
          />
          <div v-else class="item-img no-img">🍹</div>

          <div class="item-info">
            <p class="item-name">{{ item.cocktail.name }}</p>
            <p class="item-sub">{{ item.sizeCode }} · {{ item.price }}€/u</p>
          </div>

          <div class="item-controls">
            <button class="qty-btn" @click="cart.decrement(idx)">−</button>
            <span class="qty">{{ item.quantity }}</span>
            <button class="qty-btn" @click="cart.increment(idx)">+</button>
          </div>

          <span class="item-total">{{ (item.price * item.quantity).toFixed(0) }}€</span>

          <button class="remove-btn" @click="cart.remove(idx)">✕</button>
        </div>
      </div>

      <div class="cart-footer">
        <div class="total-row">
          <span class="spaced total-label">Total commande</span>
          <span class="total-amount">{{ cart.total.toFixed(0) }}€</span>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button class="btn btn-red" :disabled="loading" @click="order">
          {{ loading ? 'Envoi…' : `Commander · ${cart.total.toFixed(0)}€` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page { padding: 20px 16px; }

.empty {
  text-align: center;
  color: var(--muted);
  padding: 48px 0;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.item-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}
.no-img {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  font-size: 24px;
}

.item-info { flex: 1; min-width: 0; }
.item-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.item-total {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--gold);
  flex-shrink: 0;
}

.remove-btn {
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  flex-shrink: 0;
  padding: 4px;
}

.cart-footer { display: flex; flex-direction: column; gap: 16px; }

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-label { font-size: 11px; color: var(--muted); }
.total-amount {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 900;
  color: var(--gold);
}

.error-msg { color: var(--red); font-size: 13px; text-align: center; }
</style>
