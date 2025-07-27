// Fichier : netlify/functions/robit.js

exports.handler = async function(event) {
  const apiKey = process.env.GEMINI_API_KEY; // La clé est sécurisée

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Clé API non configurée." }) };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const { history } = JSON.parse(event.body);
  const payload = { contents: history };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { statusCode: response.status, body: JSON.stringify({ error: errorData.error.message }) };
    }

    const result = await response.json();
    const botResponse = result.candidates[0].content.parts[0].text;
    return { statusCode: 200, body: JSON.stringify({ text: botResponse }) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur." }) };
  }
};
