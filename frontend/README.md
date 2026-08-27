# Voie — Version fonctionnelle (Semaine 2)

Site statique (HTML/CSS/JS, aucun outil de build nécessaire) connecté à Supabase pour l'authentification, le catalogue d'opportunités et le suivi des candidatures.

## Fichiers

- `index.html` — catalogue public des opportunités
- `auth.html` — connexion / création de compte
- `espace.html` — espace personnel (protégé, connexion requise)
- `style.css` — mise en forme (identité "Voie")
- `supabaseClient.js` — configuration de connexion à Supabase **(à compléter, voir étape 2)**
- `schema.sql` — script de création des tables **(à exécuter, voir étape 1)**

## Étape 1 — Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com), crée un compte gratuit.
2. Crée un nouveau projet (choisis une région proche, ex. Europe).
3. Une fois le projet prêt, va dans **SQL Editor** → **New query**.
4. Colle tout le contenu de `schema.sql` et clique sur **Run**. Ça crée les 3 tables (`profiles`, `opportunities`, `applications`) et ajoute 5 opportunités de test.

## Étape 2 — Connecter le site à Supabase

1. Dans Supabase, va dans **Project Settings** → **API**.
2. Copie l'**URL** du projet et la clé **anon public**.
3. Ouvre `supabaseClient.js` et remplace les deux valeurs :
   ```js
   const SUPABASE_URL = "https://TON-PROJET.supabase.co";
   const SUPABASE_ANON_KEY = "TA_CLE_ANON_PUBLIQUE";
   ```

## Étape 3 (recommandé pour les tests) — Désactiver la confirmation email

Par défaut, Supabase demande à chaque nouvel utilisateur de confirmer son email avant de pouvoir se connecter. Pratique en production, mais gênant pour tester vite :

1. Va dans **Authentication** → **Providers** → **Email**.
2. Désactive **Confirm email**.
3. Réactive-la avant le vrai lancement auprès des utilisateurs.

## Étape 4 — Tester en local

Ouvre simplement `index.html` dans ton navigateur (double-clic sur le fichier). Teste :
- La page d'accueil affiche les opportunités
- Créer un compte sur `auth.html`
- Se connecter et voir l'espace personnel avec le score de compatibilité
- Postuler à une opportunité

## Étape 5 — Déployer sur Netlify

1. Va sur [netlify.com](https://netlify.com), crée un compte gratuit.
2. Sur la page d'accueil de ton compte, fais glisser **tout le dossier** du site (les fichiers `.html`, `.css`, `.js`) dans la zone "Drag and drop your site output folder here".
3. Netlify te donne un lien public en quelques secondes (ex. `voie-equipe10.netlify.app`).
4. Tu peux renommer le site dans **Site settings** → **Change site name**.

## Prochaines étapes (Semaine 3)

- Ajouter de vraies opportunités dans la table `opportunities` (directement dans Supabase, onglet **Table Editor**)
- Remplacer les opportunités de test par le recensement réel de l'équipe
- Envisager l'intégration de l'assistant IA et du mentorat (fonctionnalités avancées)

## En cas de problème

- **"Erreur de chargement" sur la page d'accueil** → vérifie que `supabaseClient.js` contient bien tes vraies clés (pas les valeurs par défaut).
- **Impossible de se connecter après inscription** → vérifie si la confirmation email est activée (étape 3).
- **La page espace.html redirige tout de suite vers auth.html** → normal si tu n'es pas connecté, c'est la protection qui fonctionne.
