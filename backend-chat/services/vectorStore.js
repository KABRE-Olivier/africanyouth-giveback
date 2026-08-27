// =========================================================
// MAGASIN DE DOCUMENTS — remplace ChromaDB, en beaucoup plus simple
// =========================================================
// À QUOI ÇA SERT :
// Quand quelqu'un pose une question sur une bourse précise (ex: "parle-moi
// du Bachelor EMIH"), le chat a besoin de retrouver les bons passages dans
// nos documents PDF avant de demander à l'IA de répondre. C'est ce fichier
// qui fait cette recherche.
//
// POURQUOI PAS CHROMADB (la version d'origine) :
// ChromaDB est une vraie base de données spécialisée, mais elle demande de
// faire tourner un 2e serveur séparé en plus du nôtre — compliqué et cher à
// héberger gratuitement. Ici, tout est stocké dans un simple fichier JSON
// (vector_store.json), et la recherche se fait par comparaison de mots-clés,
// directement en mémoire. Moins puissant qu'une vraie IA de recherche, mais
// largement suffisant pour nos ~30 chunks de texte, et gratuit à héberger.

const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'vector_store.json');

/** Lit tout le contenu actuellement indexé (tous les morceaux de texte des PDF) */
function loadStore() {
  if (!fs.existsSync(STORE_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (e) {
    console.error('⚠️ vector_store.json illisible, on repart de zéro.');
    return [];
  }
}

/** Écrase le fichier avec la nouvelle liste de morceaux de texte */
function saveStore(items) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(items));
}

/** Vide complètement l'index — utilisé avant de tout réindexer depuis zéro */
function clearAll() {
  saveStore([]);
}

/** Ajoute de nouveaux morceaux de texte (chunks) au magasin, sans effacer le reste */
function addChunks(chunks) {
  const store = loadStore();
  store.push(...chunks);
  saveStore(store);
}

// Petits mots français très fréquents ("le", "la", "de"...) qu'on ignore
// pendant la recherche, parce qu'ils ne veulent rien dire de précis et
// fausseraient la comparaison (sinon presque toutes les phrases "matchent").
const MOTS_VIDES = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'est', 'sont',
  'que', 'qui', 'quoi', 'pour', 'dans', 'sur', 'avec', 'sans', 'ce', 'cette',
  'ces', 'à', 'au', 'aux', 'en', 'par', 'se', 'sa', 'son', 'ses', 'il', 'elle',
]);

/**
 * Transforme une phrase en liste de mots-clés utiles pour la comparaison :
 * tout en minuscules, sans accents, sans ponctuation, sans les mots vides.
 * Ex: "Quelle est la date limite ?" → ["quelle", "date", "limite"]
 */
function extraireMotsCles(texte) {
  return (texte || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents (é → e)
    .replace(/[^a-z0-9\s]/g, ' ')                       // retire la ponctuation
    .split(/\s+/)
    .filter(m => m.length > 2 && !MOTS_VIDES.has(m));
}

/**
 * LA FONCTION PRINCIPALE : reçoit une question, renvoie les morceaux de texte
 * (chunks) les plus proches, triés du plus pertinent au moins pertinent.
 *
 * Fonctionnement : on compte, pour chaque morceau de texte indexé, combien
 * de mots-clés de la question s'y retrouvent. Plus il y a de mots en commun,
 * plus le score est élevé. On ne renvoie QUE les morceaux avec au moins 1 mot
 * en commun (score > 0) — si rien ne correspond vraiment, on renvoie une
 * liste vide plutôt que d'inventer un faux résultat au hasard. C'est
 * important : ça évite que le chat propose un lien totalement faux quand il
 * n'a en réalité aucune information sur le sujet demandé.
 */
async function searchPdfChunks(question, limit = 5) {
  const store = loadStore();

  if (store.length === 0) {
    throw new Error("La base de documents n'est pas disponible. Exécutez `npm run index-pdfs`.");
  }

  const motsQuestion = extraireMotsCles(question);
  if (motsQuestion.length === 0) return [];

  const scored = store.map(item => {
    const motsChunk = extraireMotsCles(item.text);
    const score = motsQuestion.reduce(
      (acc, mot) => acc + motsChunk.filter(m => m.includes(mot) || mot.includes(m)).length,
      0
    );
    return { ...item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const pertinents = scored.filter(item => item.score > 0);

  return pertinents.slice(0, limit).map(item => ({
    text: item.text,
    source: item.source,
    score: item.score,
  }));
}

module.exports = { addChunks, clearAll, searchPdfChunks, loadStore };
