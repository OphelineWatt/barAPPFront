import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/menu' },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },

    // routes côté client
    { path: '/menu',    name: 'menu',    component: () => import('@/views/MenuView.vue'),          meta: { requiresAuth: false } },
    { path: '/cart',    name: 'cart',    component: () => import('@/views/CartView.vue'),          meta: { requiresAuth: true } },
    { path: '/order',   name: 'order',   component: () => import('@/views/OrderTrackingView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue'),       meta: { requiresAuth: true } },

    // routes côté barmaker
    {
      path: '/barmaker/orders',
      name: 'barmaker-orders',
      component: () => import('@/views/BarmakerOrdersView.vue'),
      meta: { requiresAuth: true, requiresBarmaker: true },
    },
    {
      path: '/barmaker/cocktails',
      name: 'barmaker-cocktails',
      component: () => import('@/views/BarmakerCocktailsView.vue'),
      meta: { requiresAuth: true, requiresBarmaker: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresBarmaker && !auth.isBarmaker) {
    return { name: 'menu' }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return auth.isBarmaker ? { name: 'barmaker-orders' } : { name: 'menu' }
  }
})

export default router
