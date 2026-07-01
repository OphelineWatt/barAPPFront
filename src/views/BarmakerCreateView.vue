<script setup lang="ts">
import { ref } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { createBarmaker } from '@/api/users'

const name = ref('')
const email = ref('')
const password = ref('')
const saving = ref(false)
const message = ref('')
const isError = ref(false)

async function save() {
  if (!name.value || !email.value || !password.value) {
    isError.value = true
    message.value = 'Merci de remplir tous les champs.'
    return
  }
  if (password.value.length < 6) {
    isError.value = true
    message.value = 'Le mot de passe doit faire au moins 6 caractères.'
    return
  }
  saving.value = true
  message.value = ''
  try {
    await createBarmaker({ name: name.value, email: email.value, password: password.value })
    isError.value = false
    message.value = `Compte barmaker créé pour ${name.value}.`
    name.value = ''
    email.value = ''
    password.value = ''
  } catch {
    isError.value = true
    message.value = 'Erreur : cet email est peut-être déjà utilisé.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="team-page desk-narrow">
    <h2 class="section-title">Ajouter un barmaker</h2>
    <p class="intro">Créez un compte pour un nouveau membre de l'équipe. Il pourra gérer la carte et les commandes.</p>

    <div class="form-fields">
      <div class="field">
        <label class="field-label">Nom</label>
        <input v-model="name" class="field-input" placeholder="Alex Durand" />
      </div>
      <div class="field">
        <label class="field-label">Email</label>
        <input v-model="email" class="field-input" type="email" placeholder="nom@barapp.fr" />
      </div>
      <div class="field">
        <label class="field-label">Mot de passe</label>
        <input v-model="password" class="field-input" type="password" placeholder="••••••••" />
      </div>
    </div>

    <p v-if="message" class="msg" :class="{ err: isError }">{{ message }}</p>

    <button class="btn btn-red create-btn" :disabled="saving" @click="save">
      <UserPlus :size="16" />
      <span>{{ saving ? 'Création…' : 'Créer le compte barmaker' }}</span>
    </button>
  </div>
</template>

<style scoped>
.team-page { padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; }
.intro { font-size: 13px; color: var(--muted); line-height: 1.4; }

.form-fields { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 4px; }

.msg { font-size: 13px; color: #27ae60; }
.msg.err { color: var(--red); }

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
</style>
