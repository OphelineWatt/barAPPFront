<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ClientLayout from '@/components/ClientLayout.vue'
import BarmakerLayout from '@/components/BarmakerLayout.vue'

const auth = useAuthStore()
const route = useRoute()
// pages affichées en plein écran, sans l'en-tête ni les onglets client/barmaker
const isBare = computed(() => route.name === 'login' || route.name === 'profile')
</script>

<template>
  <BarmakerLayout v-if="auth.isAuthenticated && auth.isBarmaker && !isBare" />
  <ClientLayout v-else-if="!isBare" />
  <RouterView v-else />
</template>
