-- =========================================================
-- AfricanYouth GiveBack — Documentation du schéma de base de données
-- =========================================================
-- ⚠️ Ce fichier est une DOCUMENTATION de référence, reconstruite à partir
-- de l'historique de développement — ce n'est PAS un export automatique
-- de Supabase (pg_dump). Les types exacts, contraintes et valeurs par
-- défaut peuvent légèrement différer de la vraie base en production.
-- Pour toute modification réelle, vérifiez toujours directement dans
-- Supabase (Database > Tables) avant d'exécuter quoi que ce soit.
--
-- Base de données : PostgreSQL (via Supabase)
-- Authentification : Supabase Auth (table auth.users, gérée par Supabase)
-- =========================================================

-- ---------------------------------------------------------
-- profiles — Profil de chaque utilisateur inscrit
-- ---------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  prenom text,
  nom text,
  email text,
  whatsapp text,
  statut text,
  tags text[],
  annee_naissance integer,
  pays text,
  nationalite text,
  ville text,
  photo_url text,
  dernier_diplome text,
  domaine_etude text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- opportunities — Le catalogue de bourses, stages, concours...
-- ---------------------------------------------------------
create table if not exists opportunities (
  id bigserial primary key,
  title text not null,
  type text,
  description text,
  lien text,
  niveau text[],
  pays_cible text[],
  domaine text[],
  partenaire text,
  financement text,
  deadline date,
  photo_url text,
  logo_url text,
  logo_url_2 text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- applications — Suivi des candidatures des utilisateurs
-- ---------------------------------------------------------
create table if not exists applications (
  id bigserial primary key,
  user_id uuid references profiles(id),
  opportunity_id bigint references opportunities(id),
  status text default 'En cours',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- mentors — Les mentors bénévoles disponibles
-- ---------------------------------------------------------
create table if not exists mentors (
  id bigserial primary key,
  nom text not null,
  whatsapp text,
  contact text,
  expertise text[],
  bio text,
  photo_url text,
  disponibilite smallint default 1,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- mentor_requests — Demandes de mise en relation avec un mentor
-- ---------------------------------------------------------
create table if not exists mentor_requests (
  id bigserial primary key,
  user_id uuid references profiles(id),
  mentor_id bigint references mentors(id),
  email text,
  status text default 'Envoyée',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- formations — Mini-formations (CV, lettre de motivation, entretiens...)
-- ---------------------------------------------------------
create table if not exists formations (
  id bigserial primary key,
  titre text not null,
  categorie text,
  contenu text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- formation_likes / formation_comments — Interactions sur les mini-formations
-- ---------------------------------------------------------
create table if not exists formation_likes (
  id bigserial primary key,
  formation_id bigint references formations(id),
  user_id uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists formation_comments (
  id bigserial primary key,
  formation_id bigint references formations(id),
  user_id uuid references profiles(id),
  contenu text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- posts / comments / likes — Communauté (publications)
-- ---------------------------------------------------------
create table if not exists posts (
  id bigserial primary key,
  user_id uuid references profiles(id),
  message text,
  created_at timestamptz default now()
);

create table if not exists comments (
  id bigserial primary key,
  post_id bigint references posts(id),
  user_id uuid references profiles(id),
  contenu text,
  created_at timestamptz default now()
);

create table if not exists likes (
  id bigserial primary key,
  post_id bigint references posts(id),
  user_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- notifications — Notifications internes utilisateur
-- ---------------------------------------------------------
create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references profiles(id),
  message text,
  lu boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- accompagnements — Déclarations d'accompagnement terrain (impact réel)
-- ---------------------------------------------------------
create table if not exists accompagnements (
  id bigserial primary key,
  membre text,
  beneficiaire_code text,
  type text,
  notes text,
  preuve_fichier text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- entretiens — Entretiens terrain réalisés (diagnostic Give Back)
-- ---------------------------------------------------------
create table if not exists entretiens (
  id bigserial primary key,
  enqueteur text,
  code text,
  pays text,
  reponses text,
  preuve_fichier text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- feedbacks — Retours des testeurs de la plateforme
-- ---------------------------------------------------------
create table if not exists feedbacks (
  id bigserial primary key,
  nom text,
  facilite text,
  pertinence text,
  fonctionnalite_utile text,
  recommande boolean,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- outils_usage — Compteur d'utilisation des outils (CV, lettres...)
-- ---------------------------------------------------------
create table if not exists outils_usage (
  id bigserial primary key,
  type text,
  user_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- admins — Liste des comptes ayant accès au tableau de bord admin
-- ---------------------------------------------------------
create table if not exists admins (
  id uuid primary key references auth.users(id)
);

-- =========================================================
-- Fonction publique sécurisée : nombre de personnes réellement
-- accompagnées, sans exposer les données individuelles.
-- =========================================================
create or replace function public.nombre_personnes_accompagnees()
returns integer
language sql
security definer
stable
as $$
  select count(distinct beneficiaire_code)::integer
  from accompagnements
  where beneficiaire_code is not null;
$$;

grant execute on function public.nombre_personnes_accompagnees() to anon, authenticated;

-- =========================================================
-- Note : toutes les tables listées ci-dessus utilisent Row Level
-- Security (RLS) pour protéger les données personnelles — les
-- politiques exactes ne sont pas reproduites ici par souci de
-- concision. Consultez Supabase > Authentication > Policies pour
-- le détail complet des règles d'accès en vigueur.
-- =========================================================
