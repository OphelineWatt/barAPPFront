<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerClient } from '@/api/users'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Merci de remplir tous les champs.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit faire au moins 6 caractères.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await registerClient({ name: name.value, email: email.value, password: password.value })
    // compte créé : on renvoie vers le login avec un message de confirmation
    router.push({ name: 'login', query: { registered: '1' } })
  } catch {
    error.value = 'Cet email est déjà utilisé.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="glow" />

    <div class="register-box">
      <p class="welcome spaced">Rejoignez le</p>
      <h1 class="brand">Bar<span>'</span>App</h1>
      <div class="divider" />
      <p class="sub spaced">Créer un compte</p>

      <form @submit.prevent="submit" class="form">
        <div class="field">
          <label class="field-label">Nom</label>
          <input
            v-model="name"
            type="text"
            class="field-input"
            placeholder="Alex Durand"
            autocomplete="name"
          />
        </div>

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
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn btn-red" :disabled="loading">
          {{ loading ? 'Création…' : "S'inscrire" }}
        </button>
      </form>

      <p class="hint">
        Déjà un compte ?
        <RouterLink to="/login" class="link">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
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

.register-box {
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
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
.link { color: var(--red); font-weight: 600; }
</style>
