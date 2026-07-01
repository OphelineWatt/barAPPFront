import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Configuration dédiée aux tests unitaires (Vitest).
// On n'ajoute pas le plugin devtools, inutile pendant les tests.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // jsdom simule un navigateur (localStorage, DOM…) pour tester les composants
    environment: 'jsdom',
    globals: true,
  },
})
