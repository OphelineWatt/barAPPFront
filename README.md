# Bar'app — Frontend (Vue 3 + TypeScript)

Interface web du projet **Bar'app**. Deux expériences selon le rôle :
- **Client** : consulter la carte, filtrer par catégorie, remplir son panier,
  passer commande et suivre l'avancement.
- **Barmaker** : gérer la carte (catégories, cocktails, prix), traiter les
  commandes étape par étape, et créer des comptes barmaker.

## Technologies
- **Vue 3** (`<script setup>`) + **TypeScript**
- **Vite** (build/dev)
- **Vue Router** (navigation + gardes selon le rôle)
- **Pinia** (stores `auth` et `cart`)
- **Axios** (appels API + injection du token JWT)
- **lucide-vue-next** (icônes)
- **Vitest** + **@vue/test-utils** (tests)
- Design **mobile-first** et **responsive** (desktop en grille)

## Prérequis
- Node.js ≥ 22
- Le **backend** doit tourner sur `http://localhost:8081`
  (voir le repo `barapp-backend`).

## Installation & lancement
```sh
npm install
npm run dev
```
Application disponible sur **http://localhost:5173**.

## Comptes de démonstration
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Barmaker | `barmaker@barapp.fr` | `barmaker123` |
| Client   | `client@barapp.fr`   | `client123`  |

Un nouveau client peut aussi **s'inscrire** depuis l'écran de connexion.

## Scripts utiles
```sh
npm run dev         # serveur de développement
npm run build       # build de production (dossier dist/)
npm run test:unit   # tests unitaires (Vitest)
npm run type-check  # vérification des types (vue-tsc)
npm run lint        # linting
```

## Configuration
L'URL de l'API est définie dans [`src/api/axios.ts`](src/api/axios.ts)
(`http://localhost:8081/api`).

## Architecture (dossier `src/`)
```
src/
├── api/         # appels HTTP (auth, cocktails, categories, orders, users)
├── stores/      # Pinia : auth (JWT), cart (panier)
├── router/      # routes + gardes de navigation (auth / barmaker)
├── components/  # layouts client & barmaker
├── views/       # écrans (login, inscription, carte, panier, suivi,
│                #          profil, commandes barmaker, carte barmaker, équipe)
├── types/       # interfaces TypeScript
└── assets/      # styles globaux (thème sombre)
```

## Tests
```sh
npm run test:unit
```
Couvre les stores (panier, auth) et un test de composant (carte + ajout au panier).
