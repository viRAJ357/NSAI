document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    const messagesContainer = document.getElementById('messagesContainer');
    const landingScreen = document.getElementById('landingScreen');
    
    // Sidebar Toggles
    const leftMenuBtn = document.getElementById('leftMenuBtn');
    const rightMenuBtn = document.getElementById('rightMenuBtn');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // UI Buttons
    const newChatBtns = [document.getElementById('newChatBtn'), document.getElementById('createNewBtn')];
    const tabs = document.querySelectorAll('.tab[data-tab]');
    const interactiveIcons = document.querySelectorAll('.interactive-icon');
    const accordions = document.querySelectorAll('.accordion');

    let chatHistory = [];
    let pendingAttachment = null;

    // --- Sidebar Toggle Logic (Mobile/Tablet) ---
    function openSidebar(sidebar) {
        sidebar.classList.add('open');
        sidebarOverlay.style.display = 'block';
    }
    
    function closeSidebars() {
        sidebarLeft.classList.remove('open');
        sidebarRight.classList.remove('open');
        sidebarOverlay.style.display = 'none';
    }

    if(leftMenuBtn) leftMenuBtn.addEventListener('click', () => openSidebar(sidebarLeft));
    if(rightMenuBtn) rightMenuBtn.addEventListener('click', () => openSidebar(sidebarRight));
    if(sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebars);

    // --- New Chat Logic ---
    newChatBtns.forEach(btn => {
        if(btn) {
            btn.addEventListener('click', () => {
                messagesContainer.innerHTML = '';
                messagesContainer.appendChild(landingScreen);
                landingScreen.style.display = 'flex';
                chatHistory = [];
                closeSidebars();
            });
        }
    });

    // --- Tabs Logic (Community vs Chats) ---
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.tab;
            
            // Remove active from siblings
            const parent = e.currentTarget.parentElement;
            parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active-tab'));
            e.currentTarget.classList.add('active-tab');

            // Toggle states
            if (target === 'community') {
                document.getElementById('communityState').style.display = 'block';
                document.getElementById('chatsState').style.display = 'none';
            } else if (target === 'chats') {
                document.getElementById('communityState').style.display = 'none';
                document.getElementById('chatsState').style.display = 'block';
            }
        });
    });

    // --- Accordion Logic ---
    accordions.forEach(acc => {
        const header = acc.querySelector('.acc-header');
        const content = acc.querySelector('.acc-content');
        if (header && content) {
            header.addEventListener('click', () => {
                // Toggle this accordion
                content.classList.toggle('show');
                const icon = header.querySelector('.fa-chevron-down, .fa-chevron-right');
                if (icon) {
                    if (content.classList.contains('show')) {
                        icon.classList.remove('fa-chevron-right');
                        icon.classList.add('fa-chevron-down');
                    } else {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-right');
                    }
                }
            });
        }
    });

    // Accordion internal item selection (e.g. Voice)
    document.querySelectorAll('.acc-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const siblings = e.currentTarget.parentElement.querySelectorAll('.acc-item');
            siblings.forEach(s => s.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });

    // Persona input sync
    const personaInput = document.getElementById('personaInput');
    const personaName = document.getElementById('personaName');
    if (personaInput && personaName) {
        personaInput.addEventListener('input', (e) => {
            personaName.innerText = e.target.value || "None selected";
        });
    }

    // --- Interactive Icons (Like, Share, Mute) ---
    interactiveIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (e.currentTarget.classList.contains('mute-toggle')) {
                if (e.currentTarget.classList.contains('fa-volume-xmark')) {
                    e.currentTarget.classList.remove('fa-volume-xmark');
                    e.currentTarget.classList.add('fa-volume-high');
                } else {
                    e.currentTarget.classList.remove('fa-volume-high');
                    e.currentTarget.classList.add('fa-volume-xmark');
                }
            } else {
                e.currentTarget.classList.toggle('active');
            }
        });
    });

    // --- Core Chat Logic ---
    attachBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            pendingAttachment = {
                dataUrl: event.target.result,
                name: file.name,
                type: file.type
            };
            chatInput.placeholder = `Attached: ${file.name} - Type your message...`;
            chatInput.focus();
        };
        reader.readAsDataURL(file);
    });
    
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
        sendBtn.style.color = this.value.trim() !== '' ? '#3b82f6' : '#111';
    });

    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '' && !pendingAttachment) return;

        if (landingScreen) landingScreen.style.display = 'none';

        const messageData = { role: "user", content: text, attachment: pendingAttachment };

        appendUserMessage(text, pendingAttachment);
        chatHistory.push(messageData);
        
        const payloadAttachment = pendingAttachment;
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.placeholder = "Type your message";
        sendBtn.style.color = '#111';
        pendingAttachment = null;
        fileInput.value = "";

        fetchAIResponse(text, payloadAttachment);
    }

    function appendUserMessage(text, attachment) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        let attachmentHtml = '';
        if (attachment) {
            if (attachment.type.startsWith('image/')) {
                attachmentHtml = `<img src="${attachment.dataUrl}" class="attached-image-preview" alt="Attached image">`;
            } else {
                attachmentHtml = `<div style="font-size: 0.8em; color: #3b82f6; margin-bottom: 0.5rem;"><i class="fa-solid fa-paperclip"></i> ${attachment.name}</div>`;
            }
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">U</div>
            <div class="message-content-wrapper">
                <div class="message-name">You</div>
                <div class="message-content">
                    ${escapeHTML(text)}
                    ${attachmentHtml}
                </div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    async function fetchAIResponse(userText, attachment) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: red;"><i class="fa-solid fa-biohazard"></i></div>
            <div class="message-content-wrapper">
                <div class="message-name">NSAI</div>
                <div class="message-content typing-indicator">...</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        const contentDiv = messageDiv.querySelector('.message-content');
        const apiKey = document.getElementById('apiKeyInput')?.value || '';
        
        if (!apiKey) {
            contentDiv.innerHTML = "SYSTEM ERROR: API Key missing. Please provide Gemini API Key in the left sidebar input.";
            return;
        }

        const apiBase = window.location.protocol === 'file:' ? 'http://127.0.0.1:5000/api/chat' : '/api/chat';
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userText,
                    attachment: attachment,
                    history: chatHistory.slice(0, -1),
                    api_key: apiKey
                })
            });

            const data = await res.json();
            
            if (!res.ok) {
                contentDiv.innerHTML = `FATAL ERROR: ${data.error || 'Unknown server error'}`;
            } else {
                contentDiv.innerHTML = marked.parse(data.response || "No data received.");
                contentDiv.querySelectorAll('pre code').forEach((block) => { hljs.highlightElement(block); });
                chatHistory.push({role: "assistant", content: data.response});
                scrollToBottom();
            }
        } catch (error) {
            contentDiv.innerHTML = `CONNECTION FAILED: ${error.message}`;
        }
    }

    // --- Voice Input ---
    let isRecording = false;
    let recognition;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isRecording = true;
            micBtn.style.color = '#e63946';
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = function(event) {
            chatInput.value = event.results[0][0].transcript;
            chatInput.dispatchEvent(new Event('input')); 
            sendMessage(); 
        };

        recognition.onerror = resetMic;
        recognition.onend = resetMic;
    } else {
        if(micBtn) micBtn.style.display = 'none';
    }

    if(micBtn) {
        micBtn.addEventListener('click', () => {
            if (!recognition) return;
            isRecording ? recognition.stop() : recognition.start();
        });
    }

    function resetMic() {
        isRecording = false;
        micBtn.style.color = '';
        chatInput.placeholder = "Type your message";
    }

    function scrollToBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
});
