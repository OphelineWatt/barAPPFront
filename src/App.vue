<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ClientLayout from '@/components/ClientLayout.vue'
import BarmakerLayout from '@/components/BarmakerLayout.vue'

const auth = useAuthStore()
const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>

<template>
  <BarmakerLayout v-if="auth.isAuthenticated && auth.isBarmaker && !isLogin" />
  <ClientLayout v-else-if="!isLogin" />
  <RouterView v-else />
</template>
