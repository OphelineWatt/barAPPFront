<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || (auth.isBarmaker ? '/barmaker/orders' : '/menu')
    router.push(redirect)
  } catch {
    error.value = 'Email ou mot de passe incorrect.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="glow" />

    <div class="login-box">
      <p class="welcome spaced">Bienvenue au</p>
      <h1 class="brand">Bar<span>'</span>App</h1>
      <div class="divider" />
      <p class="sub spaced">Connexion</p>

      <form @submit.prevent="submit" class="form">
        <div class="field">
          <label class="field-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="field-input"
            placeholder="nom@barapp.fr"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label class="field-label">Mot de passe</label>
          <div class="pw-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn btn-red" :disabled="loading">
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <p class="hint">Le rôle (client / barmaker) est géré par le profil utilisateur.</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  position: relative;
  overflow: hidden;
}

.glow {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(192,57,43,.35) 0%, transparent 70%);
  pointer-events: none;
}

.login-box {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.welcome {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 8px;
}

.brand {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 52px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1;
  margin-bottom: 16px;
}
.brand span { color: var(--red); }

.sub {
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 28px;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; }

.pw-wrap { position: relative; }
.pw-wrap .field-input { padding-right: 44px; }

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  font-size: 16px;
  line-height: 1;
}

.error-msg {
  color: var(--red);
  font-size: 13px;
  text-align: center;
}

.hint {
  margin-top: 20px;
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}
</style>
