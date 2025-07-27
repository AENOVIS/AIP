// ====================================
// JavaScript pour les fonctionnalités interactives du site
// ====================================


// 1. Bascule du menu mobile
// ====================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNavMenu = document.getElementById('mainNavMenu'); // Référence au menu unique

mobileMenuBtn.addEventListener('click', () => {
    mainNavMenu.classList.toggle('active'); // Utiliser la classe 'active' pour afficher/masquer
});

// Fermer le menu mobile lorsqu'un lien est cliqué
document.querySelectorAll('#mainNavMenu a').forEach(link => {
    link.addEventListener('click', () => {
        mainNavMenu.classList.remove('active'); // Masquer au clic
    });
});


// 2. Défilement fluide pour les liens d'ancrage
// ====================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Pas de décalage d'en-tête nécessaire, juste un petit ajustement visuel
            const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80; // Ajuster pour la hauteur du header sticky

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});


// ====================================
// 3. Logique de l'assistant Robit (simule robit.js)
// ====================================
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const robitChatContainer = document.getElementById('robitChatContainer'); // Référence au conteneur de chat
const floatingRobitBtn = document.getElementById('floatingRobitBtn'); // Référence au bouton flottant

let isLoading = false;
let chatHistory = []; // Historique de la conversation pour l'assistant

// Fonction pour ajouter un message au chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} animate-messageSlide`;
    messageDiv.innerHTML = content.replace(/\n/g, '<br>'); // Permet les retours à la ligne
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Défilement automatique vers le bas

    // Ajouter le message à l'historique pour l'assistant
    if (!isUser) {
        chatHistory.push({ role: "model", parts: [{ text: content }] });
    } else {
        chatHistory.push({ role: "user", parts: [{ text: content }] });
    }
}

// Fonction pour mettre à jour l'état du bouton d'envoi
function updateButtonState() {
    sendBtn.disabled = isLoading;
    chatInput.disabled = isLoading;
    const currentLang = document.documentElement.lang;
    sendBtn.innerHTML = isLoading ?
        `<i class="fas fa-spinner fa-spin mr-2"></i> ${currentLang === 'fr' ? 'Réflexion...' : 'Thinking...'}` :
        `<i class="fas fa-paper-plane mr-2"></i> ${currentLang === 'fr' ? 'Envoyer' : 'Send'}`;
}

// Fonction pour envoyer un message à l'assistant
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isLoading) return;

    const currentLang = document.documentElement.lang;
    
    isLoading = true;
    updateButtonState();

    addMessage(message, true); // Ajouter le message utilisateur à l'interface et à l'historique local
    chatInput.value = ''; // Effacer le champ de saisie

    try {
        const payload = {
            contents: chatHistory, // Envoyer l'historique complet tel quel
            generationConfig: {
                responseMimeType: "text/plain"
            }
        };
        
        // IMPORTANT : Pour une utilisation en production, il est FORTEMENT recommandé
        // de ne PAS exposer votre clé API Gemini directement dans le code client.
        // Utilisez un proxy backend (Python, Node.js, etc.) pour gérer l'appel API de manière sécurisée.
        // Exemple de proxy Node.js :
        // app.post('/api/gemini', async (req, res) => {
        //   const { prompt } = req.body;
        //   const response = await model.generateContent(prompt); // 'model' initialisé avec votre clé API sécurisée
        //   res.json({ response: response.text });
        // });
        // Votre fetch() appellerait alors '/api/gemini' au lieu de l'URL directe de Google.

        const apiKey = ""; // <--- Votre clé API Gemini DOIT être insérée ici
                           //      Ou utilisez un proxy backend comme recommandé ci-dessus.
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erreur API : ${response.status} - ${errorData.error || 'Erreur inconnue'}`);
        }

        const result = await response.json();
        let botResponse = "";
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            botResponse = result.candidates[0].content.parts[0].text;
        } else {
            botResponse = (currentLang === 'fr' ? 'Désolé, je ne peux pas répondre pour le moment. Le format de la réponse de Gemini est inattendu.' : 'Sorry, I cannot respond at the moment. Gemini\'s response format is unexpected.');
        }
        
        // Ajouter un conseil proactif de Patrick si ce n'est pas déjà présent
        // et si la réponse n'est pas déjà un message d'erreur de connexion.
        if (botResponse && !botResponse.includes('💡') && !botResponse.includes('Appelez Patrick') && !botResponse.includes('Call Patrick') && !botResponse.includes('Problème de connexion')) {
            const proactiveTip = currentLang === 'fr' ?
                `\n\n💡 **Conseil de Patrick :** N'hésitez jamais à appeler pour un diagnostic GRATUIT ! 📞 (819) 380-2999` :
                `\n\n💡 **Patrick's Tip:** Never hesitate to call for a FREE diagnosis! 📞 (819) 380-2999`;
            botResponse += proactiveTip;
        }
        
        addMessage(botResponse); // Ajouter la réponse de l'assistant
    } catch (error) {
        console.error('Erreur Robit :', error);
        const errorMsg = currentLang === 'fr' ?
            `🤖 **Problème de connexion de l'assistant temporaire...**\n\n💡 **Solution immédiate :**\n📞 **Appelez Patrick directement : (819) 380-2999**\n🏠 Service à domicile disponible\n🔧 Diagnostic gratuit inclus dans toute réparation\n❤️ Patrick vous aide avec patience !` :
            `🤖 **Temporary assistant connection issue...**\n\n💡 **Immediate solution:**\n📞 **Call Patrick directly: (819) 380-2999**\n🏠 Home service available\n🔧 Free diagnosis included with any repair\n❤️ Patrick helps you with patience!`;
        
        addMessage(errorMsg); // Afficher un message d'erreur convivial
    } finally {
        isLoading = false;
        updateButtonState(); // Réinitialiser l'état du bouton
        chatInput.focus(); // Restaurer le focus sur le champ de saisie
    }
}

// Écouteurs d'événements pour le chat
sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Envoyer avec Entrée, pas Maj+Entrée
        e.preventDefault();
        sendMessage();
    }
});

// Toggle la visibilité du conteneur de chat
floatingRobitBtn.addEventListener('click', () => {
    robitChatContainer.classList.toggle('is-visible');
    if (robitChatContainer.classList.contains('is-visible')) {
        chatInput.focus(); // Mettre le focus sur le champ de saisie si le chat est visible
    }
});


// 4. Gestion des langues
// ====================================
const translations = {
    fr: {
        page_title: "Atelier Informatique Potvin",
        company_name: "Atelier Informatique Potvin",
        robit_menu: "🤖 Robit Assistant Gratuit",
        services_menu: "Services",
        assistance_menu: "Assistance",
        contact_menu: "Contact",
        call_to_action_header: "(819) 380-2999",
        founder_expert: "Fondateur • Expert depuis 1984",
        hero_tagline: "❤️ Passionné depuis l'âge de 9 ans",
        hero_title: "Salut, moi c'est Patrick ! Votre expert informatique de confiance.",
        hero_description: "Depuis 1984, j’aide les gens à reprendre le contrôle de leur ordinateur.", 
        years_experience: "Années d'expérience",
        clients_helped: "Clients aidés",
        available: "Disponible",
        free_quote_button: "Demander une assistance maintenant", 
        talk_to_robit_button: "Parler à Robit IA", 
        download_agent_button: "Télécharger mon agent sécurisé", 
        whatsapp_button_hero: "WhatsApp",
        urgent_call_note: "Pour toute urgence informatique, Patrick est disponible 7j/7. N'attendez pas !",
        badge_quebec: "100% Québec", 
        badge_secure: "Sécurisé – Aucun accès sans accord", 
        badge_tested: "Testé sur +1000 machines", 
        badge_compatible: "Compatible : Windows / macOS / Linux", 
        robit_title: "Robit - Votre Assistant Intelligent",
        robit_description: "Besoin d'une réponse rapide à une question informatique ? Votre ordinateur fait des siennes ? Discutez avec Robit, votre assistant virtuel intelligent.",
       
