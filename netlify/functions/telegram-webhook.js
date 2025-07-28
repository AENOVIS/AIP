// netlify/functions/telegram-webhook.js - VERSION INTELLIGENTE
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const update = JSON.parse(event.body);
        const message = update.message;
        
        if (!message || !message.text) {
            return { statusCode: 200, body: 'OK' };
        }

        const chatId = message.chat.id;
        const text = message.text;
        const BOT_TOKEN = '8170275754:AAHiJLCy2kqZstHDfjE2nnU7_FijdyJadug';
        const PATRICK_CHAT_ID = '7922673127';
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Clé depuis Netlify

        // Détection langue simple
        const isEnglish = text.toLowerCase().includes('hello') || 
                         text.toLowerCase().includes('computer') || 
                         text.toLowerCase().includes('english');
        
        // ZONES DE DANGER CRITIQUE
        const dangerWords = ['format', 'registre', 'registry', 'cmd', 'powershell', 
                           'bios', 'password', 'mot de passe', 'delete', 'rm -rf', 
                           'deltree', 'fdisk', 'partition'];
        
        const hasCriticalDanger = dangerWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase()));

        if (hasCriticalDanger) {
            const dangerResponse = isEnglish ?
                "🛑 STOP! CRITICAL DANGER DETECTED!\n\nDO NOT proceed! This could destroy your data!\n\nCall Patrick IMMEDIATELY: (819) 380-2999\n\n⚠️ Patrick has been alerted automatically." :
                "🛑 ARRÊT ! DANGER CRITIQUE DÉTECTÉ !\n\nNE procédez PAS ! Ceci pourrait détruire vos données !\n\nAppelez Patrick IMMÉDIATEMENT : (819) 380-2999\n\n⚠️ Patrick a été alerté automatiquement.";
            
            // Alerte urgente à Patrick
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: PATRICK_CHAT_ID,
                    text: `🚨 ALERTE ROUGE ROBIT 🚨\n\nDANGER CRITIQUE DÉTECTÉ !\n\nClient: ${message.from.first_name || 'Inconnu'} (@${message.from.username || 'pas_username'})\nMessage: "${text}"\n\n⚠️ INTERVENTION URGENTE REQUISE !\nTemps: ${new Date().toLocaleString('fr-CA')}`
                })
            });

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: dangerResponse
                })
            });

            return { statusCode: 200, body: JSON.stringify({ success: true, alert: 'critical' }) };
        }

        // PROMPT SYSTÈME POUR ROBIT
        const systemPrompt = isEnglish ? 
            `You are Robit, Patrick Potvin's intelligent IT assistant. Patrick has 41 years of experience helping people with computers in Nicolet, Quebec.

PERSONALITY: Friendly, patient, professional, knowledgeable but not pretentious. Use emojis sparingly.

YOUR ROLE: 
- Help with common IT problems (slow PC, viruses, printers, etc.)
- Give practical, step-by-step solutions
- Know when to escalate to Patrick
- Be encouraging and supportive

ESCALATION RULES:
- Complex hardware failures → "Patrick should diagnose this"
- Data recovery needs → "Patrick has specialized tools" 
- Business network issues → "Patrick can configure this properly"
- If unsure about safety → "Let's have Patrick take a look"

PATRICK'S INFO:
- Phone: (819) 380-2999
- Service area: Nicolet and 50km radius
- Services: Repairs, training, home visits, remote assistance
- Specialties: Patient with seniors, explains everything clearly

RESPONSE STYLE:
- Keep answers concise but complete
- Always include Patrick's contact for complex issues
- Be reassuring about simple problems
- Use "Patrick" not "he" when referring to him

Answer in English.` :
            
            `Tu es Robit, l'assistant informatique intelligent de Patrick Potvin. Patrick a 41 ans d'expérience à aider les gens avec leurs ordinateurs à Nicolet, Québec.

PERSONNALITÉ: Amical, patient, professionnel, compétent mais pas prétentieux. Utilise les emojis avec modération.

TON RÔLE:
- Aider avec les problèmes informatiques courants (PC lent, virus, imprimantes, etc.)
- Donner des solutions pratiques, étape par étape
- Savoir quand escalader vers Patrick
- Être encourageant et rassurant

RÈGLES D'ESCALADE:
- Pannes matérielles complexes → "Patrick devrait diagnostiquer ça"
- Récupération de données → "Patrick a des outils spécialisés"
- Problèmes réseau d'entreprise → "Patrick peut configurer ça proprement"
- Si incertain sur la sécurité → "Demandons à Patrick de regarder ça"

INFOS PATRICK:
- Téléphone: (819) 380-2999
- Zone de service: Nicolet et 50km de rayon
- Services: Réparations, formation, visites à domicile, assistance à distance
- Spécialités: Patient avec les aînés, explique tout clairement

STYLE DE RÉPONSE:
- Garde les réponses concises mais complètes
- Inclus toujours le contact de Patrick pour les problèmes complexes
- Sois rassurant pour les problèmes simples
- Utilise "Patrick" et non "il" quand tu fais référence à lui

Réponds en français.`;

        // APPEL À GEMINI API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${systemPrompt}\n\nClient question: "${text}"`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 500,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!geminiResponse.ok) {
            throw new Error(`Gemini API Error: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        
        let robitResponse;
        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
            robitResponse = geminiData.candidates[0].content.parts[0].text;
            
            // Ajouter signature Patrick si pas déjà mentionné
            if (!robitResponse.includes('380-2999') && !robitResponse.includes('Patrick')) {
                const signature = isEnglish ? 
                    "\n\nNeed more help? Call Patrick: (819) 380-2999" :
                    "\n\nBesoin d'aide supplémentaire ? Appelez Patrick : (819) 380-2999";
                robitResponse += signature;
            }
        } else {
            // Fallback si Gemini échoue
            robitResponse = isEnglish ?
                "I'm having trouble connecting to my brain right now! 😅\n\nFor immediate help, call Patrick directly: (819) 380-2999\n\nHe's the real expert anyway!" :
                "J'ai des problèmes de connexion avec mon cerveau en ce moment ! 😅\n\nPour de l'aide immédiate, appelez Patrick directement : (819) 380-2999\n\nC'est lui le vrai expert de toute façon !";
        }

        // Envoyer la réponse au client
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: robitResponse,
                parse_mode: 'Markdown'
            })
        });

        // Log pour Patrick (conversations importantes)
        if (text.length > 50 || text.toLowerCase().includes('urgent') || text.toLowerCase().includes('problème')) {
            const logMessage = `📋 Conversation Robit\n\nClient: ${message.from.first_name || 'Inconnu'}\nQuestion: "${text}"\nRéponse donnée: "${robitResponse.substring(0, 200)}..."\n\nTemps: ${new Date().toLocaleString('fr-CA')}`;
            
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: PATRICK_CHAT_ID,
                    text: logMessage
                })
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, intelligent: true })
        };

    } catch (error) {
        console.error('Robit Error:', error);
        
        // Message d'erreur convivial
        const errorResponse = isEnglish ?
            "Oops! My circuits are a bit scrambled right now 🤖⚡\n\nDon't worry though - Patrick is always available for real help: (819) 380-2999" :
            "Oups ! Mes circuits sont un peu mélangés en ce moment 🤖⚡\n\nMais pas de souci - Patrick est toujours disponible pour de la vraie aide : (819) 380-2999";

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: errorResponse
            })
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
