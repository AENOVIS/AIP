// Fichier : netlify/functions/robit.js

// Cette fonction s'exécute sur un serveur, pas dans le navigateur du visiteur.
exports.handler = async function(event) {
  // 1. Récupérer la clé API depuis les variables d'environnement sécurisées de votre hébergeur.
  // La clé n'est JAMAIS écrite dans le code.
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Vérifier si la clé est bien configurée.
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Clé API non configurée sur le serveur." })
    };
  }

  // 3. Préparer l'appel à l'API Gemini.
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
  // On récupère l'historique de la conversation envoyé par le script de votre page.
  const { history } = JSON.parse(event.body);

  const payload = {
    contents: history,
    generationConfig: {
      responseMimeType: "text/plain"
    }
  };

  try {
    // 4. Appeler l'API Gemini depuis le serveur.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Si Gemini renvoie une erreur, on la transmet.
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorData.error.message })
      };
    }

    const result = await response.json();
    const botResponse = result.candidates[0].content.parts[0].text;

    // 5. Renvoyer la réponse du bot à votre page web.
    return {
      statusCode: 200,
      body: JSON.stringify({ text: botResponse })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur lors de l'appel à l'API Gemini." })
    };
  }
};
