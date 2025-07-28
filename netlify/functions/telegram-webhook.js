// netlify/functions/telegram-webhook.js
exports.handler = async (event, context) => {
    // Vérifier que c'est un POST de Telegram
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
        const text = message.text.toLowerCase();
        const BOT_TOKEN = '8170275754:AAHiJLCy2kqZstHDfjE2nnU7_FijdyJadug';
        const PATRICK_CHAT_ID = '7922673127';

        // Détection langue simple
        const isEnglish = text.includes('hello') || text.includes('computer') || text.includes('slow') || text.includes('virus');
        
        let response = '';
        let alertPatrick = false;

        // ZONES DE DANGER (ROUGE)
        const dangerWords = ['format', 'registre', 'registry', 'cmd', 'powershell', 'bios', 'password', 'mot de passe'];
        const hasDanger = dangerWords.some(word => text.includes(word));

        if (hasDanger) {
            response = isEnglish ? 
                "🛑 STOP! This is dangerous!\n\nDO NOT proceed without Patrick!\nCall immediately: (819) 380-2999" :
                "🛑 ARRÊT ! C'est dangereux !\n\nNE procédez PAS sans Patrick !\nAppelez immédiatement : (819) 380-2999";
            alertPatrick = true;
        }
        // CAS SPÉCIFIQUES
        else if (text.includes('lent') || text.includes('slow') || text.includes('rameur')) {
            response = isEnglish ?
                "PC slow? 3 quick checks:\n1️⃣ Restart (fixes 30% of cases!)\n2️⃣ Check disk space (need 15% free)\n3️⃣ Close unused programs\n\nStill slow? Patrick can diagnose remotely: (819) 380-2999" :
                "PC lent ? 3 vérifications rapides :\n1️⃣ Redémarre (ça règle 30% des cas !)\n2️⃣ Vérifie l'espace disque (besoin de 15% libre)\n3️⃣ Ferme les programmes inutiles\n\nToujours lent ? Patrick peut diagnostiquer à distance : (819) 380-2999";
        }
        else if (text.includes('virus') || text.includes('malware') || text.includes('popup')) {
            response = isEnglish ?
                "⚠️ Security issue possible!\n❌ Don't enter ANY passwords\n❌ Don't download anything\n✅ Disconnect internet if possible\n\nThis is serious - Patrick should see this quickly: (819) 380-2999" :
                "⚠️ Problème de sécurité possible !\n❌ N'entre AUCUN mot de passe\n❌ Ne télécharge rien\n✅ Déconnecte internet si possible\n\nC'est sérieux - Patrick doit voir ça rapidement : (819) 380-2999";
            alertPatrick = true;
        }
        else if (text.includes('imprimante') || text.includes('printer') || text.includes('impression')) {
            response = isEnglish ?
                "Printer problem? The classic fix:\n1️⃣ Turn printer off/on\n2️⃣ Check USB cables\n3️⃣ Restart computer\n\nStill stuck? Patrick knows every model by heart: (819) 380-2999" :
                "Problème d'impression ? Le classique :\n1️⃣ Éteins/rallume l'imprimante\n2️⃣ Vérifie les câbles USB\n3️⃣ Redémarre l'ordinateur\n\nSi ça coince encore, Patrick connaît tous les modèles par cœur : (819) 380-2999";
        }
        else if (text.includes('/start') || text.includes('salut') || text.includes('hello')) {
            response = isEnglish ?
                "Hi! 😊 I'm Robit, Patrick's super intelligent assistant!\n\n💻 PC slow? I give immediate solutions!\n🛡️ Virus problem? I guide you step by step!\n🎓 Want to learn? I train you with patience!\n\n✨ Ask me your question and I'll give you a FREE personalized answer!\n\n🆘 Emergency? Call Patrick directly: (819) 380-2999\n🏠 Home service available • Free diagnosis included" :
                "Salut ! 😊 Je suis Robit, l'assistant super intelligent de Patrick !\n\n💻 Votre PC rame ? Je vous donne des solutions immédiates !\n🛡️ Problème de virus ? Je vous guide étape par étape !\n🎓 Envie d'apprendre ? Je vous forme avec patience !\n\n✨ Posez-moi votre question et je vous donne une réponse personnalisée GRATUITE !\n\n🆘 Urgence ? Appelez Patrick directement : (819) 380-2999\n🏠 Service à domicile disponible • Diagnostic gratuit inclus";
        }
        else {
            response = isEnglish ?
                "I'm here to help! 🤖\nDescribe your problem:\n• PC slow?\n• Virus?\n• Printer?\n• Email issues?\n\nOr call Patrick directly: (819) 380-2999" :
                "Je suis là pour t'aider ! 🤖\nDécris ton problème :\n• PC lent ?\n• Virus ?\n• Imprimante ?\n• Problème email ?\n\nOu appelle Patrick directement : (819) 380-2999";
        }

        // Envoyer la réponse au client
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: response,
                parse_mode: 'HTML'
            })
        });

        // Alerter Patrick si nécessaire
        if (alertPatrick) {
            const alertMessage = `🚨 ALERTE ROBIT 🚨\nClient: ${message.from.first_name || 'Inconnu'}\nProblème: ${text}\nUrgence: ${hasDanger ? 'ROUGE' : 'ORANGE'}\nTemps: ${new Date().toLocaleTimeString('fr-CA')}\nAction: Client attend ton appel`;
            
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: PATRICK_CHAT_ID,
                    text: alertMessage
                })
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
