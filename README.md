# FutureKawa — Frontend

Interface web de la solution FutureKawa, permettant le suivi des stocks de grains de café vert et la surveillance des conditions de stockage (température / humidité) dans les entrepôts de trois pays : **Brésil**, **Équateur** et **Colombie**, avec une consolidation centralisée au siège.

## Sommaire

- [Contexte](#contexte)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancement en développement](#lancement-en-développement)
- [Build de production](#build-de-production)
- [Qualité de code — ESLint](#qualité-de-code--eslint)
- [Docker](#docker)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)

## Contexte

FutureKawa est une solution multi-pays de traçabilité des lots de café vert, intégrant des données IoT (température/humidité) remontées depuis chaque entrepôt via MQTT et consolidées via une API REST. Ce frontend constitue l'interface unique utilisée à la fois par les équipes terrain (entrepôts) et par le siège (supervision globale).

Ce dépôt correspond au frontend de l'application. Il consomme les APIs des backends pays (Brésil, Équateur, Colombie) ainsi que le backend central du siège.

## Stack technique

- **React 18** + **TypeScript**
- **Vite** — build tool et serveur de développement
- **Tailwind CSS** — mise en forme
- **React Router** — navigation multi-pages
- **Chart.js** (via `react-chartjs-2`) — visualisation des courbes température/humidité
- **i18next** — internationalisation
- **Framer Motion** — animations d'interface
- **ESLint 9** (flat config) — vérification qualité du code

## Prérequis

- [Node.js](https://nodejs.org/) version 20 ou supérieure
- npm (livré avec Node.js)

## Installation

```bash
git clone https://github.com/loanth/futureKawaFront.git
cd futureKawaFront
npm ci
```

`npm ci` est utilisé plutôt que `npm install` afin de garantir une installation strictement identique à celle définie dans `package-lock.json`, notamment en environnement d'intégration continue (Jenkins).

## Variables d'environnement

L'application communique avec 3 backends pays distincts. Les URLs sont définies via des variables d'environnement Vite (préfixées `VITE_`) :

| Variable | Description |
|---|---|
| `VITE_API_URL_BR` | URL de l'API backend du Brésil |
| `VITE_API_URL_EC` | URL de l'API backend de l'Équateur |
| `VITE_API_URL_CO` | URL de l'API backend de la Colombie |

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL_BR=http://localhost:3001
VITE_API_URL_EC=http://localhost:3002
VITE_API_URL_CO=http://localhost:3003
```

> Ces variables sont injectées au moment du **build** (Vite les remplace statiquement), pas à l'exécution. Pour Docker, elles sont passées en `ARG`/`ENV` dans le `Dockerfile` (voir section [Docker](#docker)).

## Lancement en développement

```bash
npm run dev
```

L'application est accessible par défaut sur `http://localhost:5173`.

## Build de production

```bash
npm run build
```

Génère les fichiers statiques optimisés dans le dossier `dist/`.

Pour prévisualiser le build de production en local :

```bash
npm run preview
```

## Qualité de code — ESLint

Le projet utilise **ESLint 9** avec le nouveau format de configuration (`eslint.config.js`), incluant les règles TypeScript, React Hooks et React Refresh.

Vérifier le code :

```bash
npm run lint
```

Corriger automatiquement les problèmes réparables :

```bash
npm run lint:fix
```

Le lint est également exécuté automatiquement dans la pipeline CI/CD (Jenkins) à chaque intégration, avant le build de l'image Docker. Un dépassement du seuil de warnings autorisé bloque le pipeline.

## Docker

Le frontend est conteneurisé via un `Dockerfile` multi-étapes basé sur `node:20-alpine`.

Build de l'image avec injection des URLs d'API au moment du build :

```bash
docker build \
  --build-arg VITE_API_URL_BR=http://backend-br:3001 \
  --build-arg VITE_API_URL_EC=http://backend-ec:3002 \
  --build-arg VITE_API_URL_CO=http://backend-co:3003 \
  -t futurekawa-front .
```

Lancement du conteneur :

```bash
docker run -p 4173:4173 futurekawa-front
```

L'application est alors accessible sur `http://localhost:4173`.

## Structure du projet

```
futureKawaFront/
├── src/
│   ├── components/       # Composants réutilisables (navigation, cartes, tableaux...)
│   ├── contexts/         # Contextes React (authentification, pays sélectionné...)
│   ├── pages/            # Pages de l'application (Dashboard, Alerts, LotDetail...)
│   ├── services/         # Appels API et logique de communication multi-pays
│   └── ...
├── Dockerfile
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Fonctionnalités principales

- **Dashboard siège** — vue consolidée des 3 pays : nombre de lots, alertes actives, statut global
- **Navigation par pays / exploitation / entrepôt** — parcours hiérarchique complet
- **Gestion des lots** — consultation triée par date de stockage (logique FIFO), statuts (conforme / en alerte / périmé)
- **Courbes température & humidité** — visualisation historique par entrepôt et par lot, avec seuils visuels
- **Système d'alertes** — consultation des alertes déclenchées (conditions hors plage, lots périmés)
- **Authentification** — accès sécurisé à l'application
- **Internationalisation** — interface disponible en plusieurs langues (i18next)

---

Projet réalisé dans le cadre de la certification RNCP35584 — Bloc 4 (MSPR), EPSI.
