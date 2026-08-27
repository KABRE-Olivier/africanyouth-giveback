// =========================================================
// SERVICE RAG — "Retrieval-Augmented Generation"
// =========================================================
// C'est le chef d'orchestre entre 2 étapes :
//   1. RETRIEVAL (récupération) : chercher les bons passages dans nos PDF
//      → fait par vectorStore.js (searchPdfChunks)
//   2. GENERATION : demander à l'IA (Groq) de formuler une vraie réponse
//      en français, en se basant UNIQUEMENT sur ces passages
//
// L'intérêt : plutôt que de laisser l'IA répondre "de mémoire" (avec un
// risque d'inventer des choses fausses), on lui donne le texte exact de nos
// documents et on lui demande de reformuler, pas d'inventer.

const OpenAI = require('openai');
const { searchPdfChunks } = require('./vectorStore');

const MODEL = 'openai/gpt-oss-20b';
const MAX_CONTEXT_CHARACTERS = 12000; // Limite de sécurité pour ne pas dépasser ce que l'IA peut lire

function getClient() {
    if (!process.env.GROQ_API_KEY?.startsWith('gsk_')) {
        throw new Error('GROQ_API_KEY est absente ou invalide.');
    }
    return new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1' // Groq utilise le même format que OpenAI
    });
}

/**
 * Répond à une question en se basant sur nos documents PDF indexés.
 * Renvoie { answer, sources } — sources = liste des documents utilisés,
 * ce qui permet ensuite au site d'ajouter le bon lien de candidature.
 */
async function answerPdfQuestion(question) {
    // Étape 1 : chercher les passages les plus proches de la question
    const matches = await searchPdfChunks(question);

    // Si rien ne correspond, on le dit honnêtement plutôt que de demander
    // à l'IA d'improviser une réponse sans vraie base — ça évite les
    // réponses inventées ou les liens qui ne correspondent à rien.
    if (matches.length === 0) {
        return { answer: "Je n'ai trouvé aucun passage pertinent dans les documents indexés.", sources: [] };
    }

    // On assemble tous les passages trouvés en un seul texte de contexte,
    // qu'on donne à l'IA pour qu'elle s'en serve pour répondre.
    const context = matches.map(match => `Extrait du document "${match.source}" :\n${match.text}`)
        .join('\n\n---\n\n').slice(0, MAX_CONTEXT_CHARACTERS);

    // Étape 2 : demander à l'IA de formuler une vraie réponse, en français,
    // fluide, sans jamais inventer ce qui n'est pas dans le contexte fourni.
    const completion = await getClient().chat.completions.create({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: "Tu es l'assistant IA d'AfricanYouth GiveBack. Réponds uniquement à partir du contexte fourni ci-dessous, de façon naturelle et fluide, comme dans une vraie conversation. N'utilise jamais de crochets, de balises [Source: ...], ni de citations entre guillemets — reformule toujours avec tes propres mots. Si le contexte ne suffit pas pour répondre, dis-le simplement, sans inventer. Réponds toujours en français.\n\nContexte :\n" + context
            },
            { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.3 // Assez bas : on veut une réponse fidèle au contexte, pas trop "créative"
    });

    return {
        answer: completion.choices[0]?.message?.content || 'Aucune réponse n\'a pu être générée.',
        // On enlève les doublons de sources (si plusieurs chunks viennent du même document)
        sources: [...new Set(matches.map(match => match.source))]
    };
}

module.exports = { answerPdfQuestion };
