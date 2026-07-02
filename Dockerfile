# --- Étape 1 : build de l'application Vue ---
FROM node:22-alpine AS build
WORKDIR /app

# Installation des dépendances (cache optimisé)
COPY package*.json ./
RUN npm ci

# Build de production
COPY . .
RUN npm run build

# --- Étape 2 : service des fichiers statiques via nginx ---
FROM nginx:alpine AS serve
# Configuration nginx (fallback SPA pour Vue Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Fichiers compilés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
