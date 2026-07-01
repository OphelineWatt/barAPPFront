<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}

const initials = (email: string) =>
  email
    .split('@')[0]
    .split(/[._-]/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
</script>

<template>
  <div class="profile-page">
    <div class="back-row">
      <button class="icon-btn" @click="router.back()">←</button>
    </div>

    <!-- Avatar -->
    <div class="avatar-wrap">
      <div class="avatar">
        {{ auth.userEmail ? initials(auth.userEmail) : '?' }}
      </div>
      <span class="role-badge" :class="auth.isBarmaker ? 'bm' : 'cl'">
        {{ auth.isBarmaker ? 'BM' : 'CL' }}
      </span>
    </div>

    <p class="user-email">{{ auth.userEmail }}</p>

    <div class="divider" />

    <!-- Role info -->
    <div class="section">
      <p class="section-label spaced">Rôle & accès</p>
      <div class="role-card card" :class="{ active: !auth.isBarmaker }">
        <div class="role-icon">🍷</div>
        <div>
          <p class="role-name">Client</p>
          <p class="role-desc">Commander des cocktails</p>
        </div>
        <span v-if="!auth.isBarmaker" class="check">✓</span>
      </div>
      <div class="role-card card" :class="{ active: auth.isBarmaker }" style="margin-top:10px">
        <div class="role-icon">⚡</div>
        <div>
          <p class="role-name">Barmaker</p>
          <p class="role-desc">Gérer la carte & les commandes</p>
        </div>
        <span v-if="auth.isBarmaker" class="check">✓</span>
      </div>
    </div>

    <div class="divider" />

    <button class="btn btn-outline logout-btn" @click="logout">
      → Se déconnecter
    </button>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.back-row { width: 100%; }

.avatar-wrap { position: relative; margin-top: 8px; }
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-input);
  border: 2px solid var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 28px;
  font-weight: 900;
}

.role-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  border: 2px solid var(--bg);
}
.role-badge.cl { background: var(--red); color: #fff; }
.role-badge.bm { background: var(--gold); color: #000; }

.user-email { font-size: 14px; color: var(--muted); }

.section { width: 100%; }
.section-label { font-size: 10px; color: var(--muted); margin-bottom: 10px; display: block; }

.role-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: var(--radius);
  transition: border-color 0.15s;
}
.role-card.active { border-color: var(--red); }

.role-icon { font-size: 20px; flex-shrink: 0; }
.role-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 17px;
  font-weight: 700;
}
.role-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
.check { margin-left: auto; color: var(--red); font-size: 18px; }

.logout-btn {
  width: 100%;
  margin-top: 8px;
  letter-spacing: 0.1em;
}
</style>
