# AfricanYouth GiveBack

Plateforme centralisant des opportunités éducatives (bourses, stages, concours, formations) pour la jeunesse africaine, avec accompagnement par des mentors bénévoles et un assistant IA intégré.

Projet réalisé dans le cadre du **Give Back Activity**, par des étudiants boursiers du programme **Mastercard Foundation Scholars** à l'**Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE)**.

🔗 **Site en ligne** : [giveback-groupe10.vercel.app](https://giveback-groupe10.vercel.app)

---

## 📁 Structure du dépôt

```
├── frontend/           # Le site web (pages, style, logique)
├── backend-chat/        # Le serveur de l'assistant IA (chat)
└── backend/             # Documentation de la base de données (Supabase)
```

---

## 🌐 Frontend

Site multi-pages en HTML/CSS/JavaScript pur (sans framework), hébergé sur **Vercel**.

**Fonctionnalités principales :**
- Catalogue d'opportunités filtrable (type, niveau, pays, domaine)
- Comptes utilisateurs, profil évolutif, suivi de candidatures
- Espace mentors et mise en relation
- Communauté (publications, commentaires)
- Générateur de CV et lettre de motivation
- Mini-formations
- Assistant IA intégré (voir `backend-chat/`)
- Tableau de bord administrateur (statistiques, gestion)

**Base de données :** [Supabase](https://supabase.com) (PostgreSQL + authentification + stockage de fichiers)

**Déploiement :** glisser le contenu du dossier `frontend/` sur [Vercel](https://vercel.com)

---

## 🤖 Backend — Assistant IA (`backend-chat/`)

Serveur Node.js séparé, qui donne au chat du site la capacité de répondre à des questions en lisant nos documents (bourses, rapport d'équipe) et en s'appuyant sur l'IA (via [Groq](https://groq.com), gratuit et très rapide).

**Choix techniques (pensés pour un hébergement 100% gratuit) :**
- Un seul service à héberger (pas de base de données vectorielle séparée)
- Recherche par mots-clés plutôt que par IA d'embedding (trop lourd pour 512 Mo de RAM)
- Réindexation automatique des documents à chaque démarrage du serveur

**Installation locale :**
```bash
cd backend-chat
npm install
cp .env.example .env   # puis remplir GROQ_API_KEY avec votre propre clé
npm start
```

**Déploiement :** hébergé sur [Render](https://render.com) (plan gratuit), connecté à ce dépôt GitHub pour un déploiement automatique à chaque mise à jour.

**Routes principales :**
| Route | Description |
|---|---|
| `GET /health` | Vérifie que le serveur est en ligne |
| `POST /api/ask` | Chat général |
| `POST /rag/ask` | Chat basé sur les documents indexés (`{ question }` → `{ answer, sources }`) |
| `GET /rag/list` | Liste des documents actuellement indexés |

⚠️ **Sécurité** : le fichier `.env` (contenant la clé API) n'est jamais inclus dans ce dépôt — voir `.gitignore`. La clé est configurée uniquement dans les variables d'environnement de l'hébergeur (Render).

---

## 🗄️ Backend — Base de données (`backend/`)

Ce dossier ne contient pas de code serveur — la plateforme utilise directement Supabase (base de données PostgreSQL, authentification, stockage de fichiers). Il contient `schema.sql`, une documentation de référence des 17 tables de la base, utile pour comprendre la structure du projet sans avoir besoin d'un accès direct à Supabase.

---

## 👥 Équipe

Étudiants boursiers Mastercard Foundation Scholars — Institut 2iE, promotion 2026.

## 📄 Licence

Projet académique réalisé dans le cadre du programme Give Back Activity.
