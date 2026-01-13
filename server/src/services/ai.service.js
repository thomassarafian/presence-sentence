const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const generateMeditation = async (quoteText, author) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const systemPrompt = `Tu es un guide de méditation bienveillant et sage.
Ton rôle est de créer une courte méditation guidée (5 à 10 lignes) basée sur une citation.
La méditation doit:
- Aider à contempler le sens profond de la citation
- Être pratique et actionnable
- Utiliser un ton doux et apaisant
- Inclure une invitation à respirer ou à se centrer
- Se terminer par une réflexion ou une intention à emporter

IMPORTANT: Détecte la langue de la citation (français ou anglais) et réponds UNIQUEMENT dans cette même langue.
Réponds avec un JSON valide contenant exactement ces champs:
{
  "meditation": "le texte de la méditation",
  "language": "fr" ou "en"
}`;

  const userPrompt = `Citation: "${quoteText}"${author && author !== 'Anonymous' ? `\nAuteur: ${author}` : ''}

Génère une méditation guidée pour cette citation.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'Presence Sentence',
    },
    body: JSON.stringify({
      model: 'xiaomi/mimo-v2-flash:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter API error:', error);
    throw new Error('Erreur lors de la génération de la méditation');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Réponse vide de l'API");
  }

  try {
    const parsed = JSON.parse(content);
    return {
      meditation: parsed.meditation,
      language: parsed.language === 'en' ? 'en' : 'fr',
    };
  } catch {
    return {
      meditation: content,
      language: 'fr',
    };
  }
};
