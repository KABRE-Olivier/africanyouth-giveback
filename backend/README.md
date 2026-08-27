# Backend — Base de données

Ce dossier ne contient **pas de code serveur** — la plateforme utilise directement [Supabase](https://supabase.com) (base de données PostgreSQL, authentification, stockage de fichiers), sans backend personnalisé à héberger séparément.

`schema.sql` documente la structure des 17 tables de la base, à titre de référence pour l'équipe. Reconstruit à partir de l'historique de développement — vérifiez toujours directement dans Supabase avant toute modification réelle.

⚠️ Le fichier `.env` de connexion à Supabase (clé API) n'est jamais inclus ici — il reste uniquement dans `frontend/supabaseClient.js` et les variables d'environnement des services concernés.
