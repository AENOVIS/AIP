// 🚀 PATCH BOT - CODE TELEGRAM COMPLET
// Patrick Potvin - Atelier Informatique Potvin
// "On patch les gens depuis 1984"

const TelegramBot = require('node-telegram-bot-api');

// ⚡ CONFIGURATION
const token = '8170275754:AAHiJLCy2kqZstHDfjE2nnU7_FijdyJadug';
const bot = new TelegramBot(token, {polling: true});

// 💙 MESSAGE D'ACCUEIL PATCH
const welcomeMessage = `
Salut ! 😊 Je suis Patch, l'assistant de Patrick Potvin !

Ici on répare pas juste des ordinateurs... 
ON PATCH LES GENS ! 

✅ Patrick : 41 ans d'expérience depuis 1984
✅ Diagnostic gratuit 24h/24
✅ Service : 150$/h 
✅ Urgence weekend : 300$/h

Décrivez votre problème technique ! 🔧

---

Hi! 😊 I'm Patch, Patrick Potvin's assistant!

Here we don't just fix computers... 
WE PATCH PEOPLE! 

✅ Patrick: 41 years experience since 1984
✅ Free diagnosis 24/7
✅ Service: $150/h 
✅ Weekend emergency: $300/h

Describe your tech problem! 🔧
`;

// 🎯 MOTS-CLÉS URGENCE
const urgentKeywords = [
    'urgent', 'emergency', 'crashed', 'planté', 'help', 'aide',
    'virus', 'hack', 'perdu', 'lost', 'backup', 'sauvegarde',
    'weekend', 'soir', 'evening', 'night', 'dimanche'
];

// 🎯 MOTS-CLÉS COMPLEXES (TRANSFERT PATRICK)
const complexKeywords = [
    'server', 'serveur', 'network', 'réseau', 'database',
    'base de données', 'backup', 'security', 'sécurité',
    'installation', 'formation', 'training'
];

// 💬 RÉPONSES PATCH
const patchResponses = {
    greeting: `Salut ! Je suis Patch ! 😊
Comment puis-je vous aider avec votre technologie ?`,

    escalation: `Je transfère à Patrick immédiatement ! 📞

Patrick Potvin - Expert 41 ans
☎️ (819) 380-2999
💻 patrick@aip-nicolet.ca
🌐 aip-nicolet.ca

Service : 150$/h | Urgence : 300$/h
"On patch les gens depuis 1984 !"`,

    pricing: `💰 TARIFS PATRICK POTVIN :

🔍 Diagnostic : GRATUIT
⚙️ Service régulier : 150$/h
🚨 Urgence weekend/soir : 300$/h
📚 Formation : 150$/h

📞 (819) 380-2999
🌐 aip-nicolet.ca`,

    about: `👨‍💻 PATRICK POTVIN - EXPERT DEPUIS 1984

✅ 41 ans d'expérience informatique
✅ 2500+ clients satisfaits
✅ Disponible 7j/7
✅ Nicolet, Centre-du-Québec
✅ "On patch les gens depuis 1984"

Avec Patch, mon assistant IA, vous avez 
de l'aide technique 24h/24 !

📞 (819) 380-2999
🌐 aip-nicolet.ca`
};

// 🚀 COMMANDE /START
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'ami';
    
    bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: '💰 Voir les tarifs', callback_data: 'pricing'},
                    {text: '👨‍💻 À propos de Patrick', callback_data: 'about'}
                ],
                [
                    {text: '📞 Appeler Patrick', url: 'tel:+18193802999'},
                    {text: '🌐 Site web', url: 'https://aip-nicolet.ca'}
                ]
            ]
        }
    });
});

// 💬 ANALYSE DES MESSAGES
bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
        const chatId = msg.chat.id;
        const text = msg.text.toLowerCase();
        const firstName = msg.from.first_name || 'ami';
        
        // 🚨 DÉTECTION URGENCE
        if (urgentKeywords.some(keyword => text.includes(keyword))) {
            bot.sendMessage(chatId, `🚨 URGENCE DÉTECTÉE !

${firstName}, votre problème semble urgent.

WEEKEND/SOIR : 300$/h
SEMAINE : 150$/h

Patrick disponible maintenant :
📞 (819) 380-2999

"On patch les gens 7j/7 !"`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '📞 Appeler MAINTENANT', url: 'tel:+18193802999'}]
                    ]
                }
            });
            return;
        }
        
        // 🎯 DÉTECTION COMPLEXE
        if (complexKeywords.some(keyword => text.includes(keyword))) {
            bot.sendMessage(chatId, `🎯 PROBLÈME COMPLEXE DÉTECTÉ !

${firstName}, ça dépasse mes capacités.
Je transfère à Patrick immédiatement !

Patrick Potvin - Expert 41 ans
📞 (819) 380-2999
💻 patrick@aip-nicolet.ca

Tarif : 150$/h (diagnostic gratuit)
"On patch les gens depuis 1984 !"`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '📞 Parler à Patrick', url: 'tel:+18193802999'}]
                    ]
                }
            });
            return;
        }
        
        // 💬 RÉPONSE GÉNÉRALE
        bot.sendMessage(chatId, `Merci ${firstName} ! 😊

J'analyse votre problème : "${msg.text}"

🔍 Diagnostic en cours...

Si c'est simple, je vous aide !
Si c'est complexe, Patrick intervient.

⏳ Un moment s'il vous plaît...`, {
            reply_markup: {
                inline_keyboard: [
                    [{text: '📞 Parler directement à Patrick', url: 'tel:+18193802999'}]
                ]
            }
        });
        
        // ⏳ SIMULATION ANALYSE (3 secondes)
        setTimeout(() => {
            bot.sendMessage(chatId, `🎯 ANALYSE TERMINÉE !

${firstName}, votre problème nécessite 
l'expertise de Patrick (41 ans d'expérience).

DIAGNOSTIC GRATUIT inclus !
Service : 150$/h

📞 (819) 380-2999
🌐 aip-nicolet.ca

"On patch les gens depuis 1984 !"`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '📞 Appeler Patrick', url: 'tel:+18193802999'}]
                    ]
                }
            });
        }, 3000);
    }
});

// 🎛️ BOUTONS CALLBACK
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;
    
    switch(data) {
        case 'pricing':
            bot.sendMessage(chatId, patchResponses.pricing);
            break;
        case 'about':
            bot.sendMessage(chatId, patchResponses.about);
            break;
    }
    
    bot.answerCallbackQuery(callbackQuery.id);
});

// 🎯 COMMANDES SPÉCIALES
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, `🆘 AIDE PATCH

Je suis l'assistant de Patrick Potvin !

Commandes :
/start - Menu principal
/prix - Voir les tarifs  
/patrick - Contacter Patrick
/help - Cette aide

Décrivez simplement votre problème
et je vous aide ou vous dirige vers Patrick !

"On patch les gens depuis 1984 !" 😊`);
});

bot.onText(/\/prix/, (msg) => {
    bot.sendMessage(msg.chat.id, patchResponses.pricing);
});

bot.onText(/\/patrick/, (msg) => {
    bot.sendMessage(msg.chat.id, patchResponses.escalation);
});

// 🔧 GESTION ERREURS
bot.on('polling_error', (error) => {
    console.log('Erreur Patch Bot:', error);
});

// 🚀 DÉMARRAGE
console.log('🚀 Patch Bot démarré !');
console.log('💙 "On patch les gens depuis 1984"');
console.log('🌐 aip-nicolet.ca');

// 📊 STATS (OPTIONNEL)
let messagesCount = 0;
bot.on('message', () => {
    messagesCount++;
    if (messagesCount % 10 === 0) {
        console.log(`📊 Patch a traité ${messagesCount} messages !`);
    }
});
