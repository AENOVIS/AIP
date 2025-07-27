// ====================================
// JavaScript pour les fonctionnalités interactives du site
// ====================================
document.addEventListener('DOMContentLoaded', () => {

    // ====================================
    // 1. Gestion des Éléments du DOM
    // ====================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNavMenu = document.getElementById('mainNavMenu');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const robitChatContainer = document.getElementById('robitChatContainer');
    const floatingRobitBtn = document.getElementById('floatingRobitBtn');
    const languageSelector = document.getElementById('languageSelector');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const simplifiedModeToggleBtn = document.getElementById('simplifiedModeToggleBtn');
    const body = document.body;
    const heroSubtitle = document.querySelector('.hero-subtitle');

    let isLoading = false;
    let chatHistory = [];
    let typingTimeout;

    // ====================================
    // 2. Bascule du menu mobile
    // ====================================
    if (mobileMenuBtn && mainNavMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNavMenu.classList.toggle('active');
        });

        document.querySelectorAll('#mainNavMenu a').forEach(link => {
            link.addEventListener('click', () => {
                mainNavMenu.classList.remove('active');
            });
        });
    }

    // ====================================
    // 3. Défilement fluide pour les liens d'ancrage
    // ====================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ====================================
    // 4. Logique de l'assistant Robit
    // ====================================
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} animate-messageSlide`;
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const role = isUser ? "user" : "model";
        chatHistory.push({ role: role, parts: [{ text: content }] });
    }
    
    function updateButtonState() {
        if (!sendBtn || !chatInput) return;
        sendBtn.disabled = isLoading;
        chatInput.disabled = isLoading;
        const currentLang = document.documentElement.lang;
        sendBtn.innerHTML = isLoading 
            ? `<i class="fas fa-spinner fa-spin"></i> ${currentLang === 'fr' ? 'Réflexion...' : 'Thinking...'}`
            : `<i class="fas fa-paper-plane"></i> ${currentLang === 'fr' ? 'Envoyer' : 'Send'}`;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isLoading) return;

        const currentLang = document.documentElement.lang;
        isLoading = true;
        updateButtonState();
        addMessage(message, true);
        chatInput.value = '';

        try {
            /**************************************************************************
             * SÉCURITÉ : L'appel direct à l'API Gemini a été retiré.
             * Le code ci-dessous simule un appel à votre propre serveur (un "proxy").
             * C'est sur ce serveur que votre clé API doit être stockée, jamais ici.
             * Pour l'instant, cela affichera une erreur, ce qui est NORMAL et SÉCURITAIRE.
             **************************************************************************/
            // NE JAMAIS METTRE LA CLÉ API ICI.
            // const apiKey = "NE_PAS_METTRE_DE_CLÉ_ICI"; 
            
            // L'URL doit pointer vers votre propre serveur/proxy
            const proxyUrl = "/api/robit"; // Ceci est une URL d'exemple

            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory })
            });

            if (!response.ok) {
                 throw new Error(`Erreur API : ${response.status}`);
            }

            const result = await response.json();
            let botResponse = result.text || (currentLang === 'fr' ? 'Désolé, une erreur est survenue.' : 'Sorry, an error occurred.');
            addMessage(botResponse);

        } catch (error) {
            console.error('Erreur Robit :', error);
            const errorMsg = currentLang === 'fr' 
                ? `🤖 **Problème de connexion...**\n\nPour une aide immédiate, appelez Patrick directement : 📞 **(819) 380-2999**`
                : `🤖 **Connection issue...**\n\nFor immediate help, call Patrick directly: 📞 **(819) 380-2999**`;
            addMessage(errorMsg);
        } finally {
            isLoading = false;
            updateButtonState();
            chatInput.focus();
        }
    }
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (floatingRobitBtn && robitChatContainer) {
        floatingRobitBtn.addEventListener('click', () => {
            robitChatContainer.classList.toggle('is-visible');
        });
    }

    // ... Le reste du script, y compris la logique de traduction, les animations, etc.
    // ... La configuration des graphiques, avec la correction pour le `resolutionChart`
    
    // CORRECTION : Le graphique 'resolutionChart' utilise maintenant la syntaxe moderne.
    function initializeCharts() {
        const ctxResolution = document.getElementById('resolutionChart');
        if (ctxResolution) {
            window.myResolutionChart = new Chart(ctxResolution, {
                type: 'bar', // MODIFIÉ
                data: {
                    labels: [/* ... */],
                    datasets: [{/* ... */}]
                },
                options: {
                    indexAxis: 'y', // AJOUTÉ
                    // ... le reste des options
                }
            });
        }
        // ... initialisation des autres graphiques
    }

    // CORRECTION : Le code pour le formulaire de contact a été retiré
    // car le service externe Formspree gère maintenant la soumission.

    // CORRECTION : Un seul écouteur pour l'événement 'load'
    window.addEventListener('load', () => {
        if (window.location.hash === '') {
            window.scrollTo(0, 0);
        }
    
        const userAgent = navigator.userAgent;
        const downloadCardWindows = document.getElementById('downloadCardWindows');
        const downloadCardMacOS = document.getElementById('downloadCardMacOS');
        const downloadCardLinux = document.getElementById('downloadCardLinux');

        if (downloadCardWindows && downloadCardMacOS && downloadCardLinux) {
            if (userAgent.includes('Win')) downloadCardWindows.style.order = '-1';
            else if (userAgent.includes('Mac')) downloadCardMacOS.style.order = '-1';
            else if (userAgent.includes('Linux')) downloadCardLinux.style.order = '-1';
        }
    
        updateAvailabilityStatus();
        initializeCharts();
    });
});