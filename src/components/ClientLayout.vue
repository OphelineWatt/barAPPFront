<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { Menu, ShoppingCart, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const tabs = [
  { name: 'menu',    label: 'Carte' },
  { name: 'cart',    label: 'Panier' },
  { name: 'order',   label: 'Commande' },
]
const active = computed(() => route.name as string)
</script>

<template>
  <!-- En-tête -->
  <header class="client-header">
    <button class="icon-btn" @click="router.push('/menu')"><Menu :size="20" /></button>
    <router-link to="/menu" class="logo">Bar<span>'</span>App</router-link>
    <div class="header-right">
      <button class="icon-btn cart-btn" @click="router.push('/cart')">
        <ShoppingCart :size="20" />
        <span v-if="cart.count > 0" class="cart-badge">{{ cart.count }}</span>
      </button>
      <button class="icon-btn" @click="router.push(auth.isAuthenticated ? '/profile' : '/login')">
        <User :size="20" />
      </button>
    </div>
  </header>

  <!-- Onglets de navigation -->
  <nav class="client-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      class="tab-btn"
      :class="{ active: active === tab.name }"
      @click="router.push({ name: tab.name })"
    >
      {{ tab.label }}
      <span v-if="tab.name === 'cart' && cart.count > 0" class="tab-count">({{ cart.count }})</span>
    </button>
  </nav>

  <main class="client-content">
    <RouterView />
  </main>
</template>

<style scoped>
.client-header {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--red);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.client-tabs {
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
  border-bottom-color: var(--red);
}

.tab-count {
  color: var(--red);
}

.client-content {
  flex: 1;
  overflow-y: auto;
}
</style>
