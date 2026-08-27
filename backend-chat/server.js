// =========================================================
// SERVEUR PRINCIPAL — point de départ de tout le backend du chat IA
// =========================================================
// Ce fichier fait 3 choses :
//   1. Démarre un petit serveur web (Express) qui écoute les questions du chat
//   2. Branche 2 "routes" (chemins d'accès) : /api pour le chat normal,
//      /rag pour les questions qui doivent chercher dans nos PDF
//   3. Une fois lancé, indexe les documents PDF en arrière-plan pour que
//      le chat puisse y chercher des réponses

require('dotenv').config(); // Charge les variables secrètes (clé API) depuis le fichier .env

const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');   // Chat normal (questions générales)
const ragRoutes = require('./routes/rag');   // Chat qui cherche dans les PDF indexés

const app = express();
const PORT = process.env.PORT || 3000; // Render fournit son propre port automatiquement

// --- Réglages de base du serveur ---
app.use(cors());                                    // Autorise notre site (autre domaine) à appeler ce serveur
app.use(express.json());                             // Permet de lire les données envoyées en JSON
app.use(express.static(path.join(__dirname, '../frontend'))); // Sert d'éventuels fichiers web statiques

// --- Les 2 "portes d'entrée" du chat ---
app.use('/api', apiRoutes);   // Ex: POST /api/ask → réponse générale de l'IA
app.use('/rag', ragRoutes);   // Ex: POST /rag/ask  → réponse basée sur nos documents PDF

// --- Route de test simple, pour vérifier que le serveur est bien en vie ---
// Utile pour Render (qui vérifie régulièrement que le service tourne) et pour nous,
// pour tester rapidement sans passer par le vrai chat : /health
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🚀 Serveur opérationnel',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 Routes:`);
  console.log(`   - POST /api/ask   → Chat normal`);
  console.log(`   - POST /rag/ask   → Questions sur PDFs`);
  console.log(`   - GET  /rag/list  → Liste des PDFs`);

  // On indexe les PDF SEULEMENT APRÈS que le serveur soit déjà en ligne et prêt
  // à répondre. Comme ça, /health répond tout de suite, sans attendre que
  // l'indexation (qui peut prendre quelques secondes) soit terminée.
  // Si l'indexation échoue pour une raison ou une autre (fichier corrompu,
  // dossier vide...), le serveur continue de tourner normalement — seule
  // la recherche dans les PDF serait alors indisponible, pas tout le chat.
  try {
    require('./indexPdfs');
  } catch (e) {
    console.error('⚠️ Indexation des PDF non lancée (le chat normal fonctionne quand même) :', e.message);
  }
});
