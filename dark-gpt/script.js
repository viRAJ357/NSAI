document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    const messagesContainer = document.getElementById('messagesContainer');
    const landingScreen = document.getElementById('landingScreen');
    
    let chatHistory = [];
    let pendingAttachment = null;

    // Handle File Attachment
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });

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
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 150 ? this.scrollHeight : 150) + 'px';
        
        if (this.value.trim() !== '') {
            sendBtn.style.color = '#3b82f6';
        } else {
            sendBtn.style.color = '#111';
        }
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

        // Hide landing screen on first message
        if (landingScreen) {
            landingScreen.style.display = 'none';
        }

        const messageData = {
            role: "user", 
            content: text,
            attachment: pendingAttachment
        };

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
            <div class="message-avatar">N</div>
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
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.style.background = 'red';
        avatarDiv.innerHTML = '<i class="fa-solid fa-biohazard"></i>';

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'message-content-wrapper';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'message-name';
        nameDiv.innerText = 'NSAI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '...';

        wrapperDiv.appendChild(nameDiv);
        wrapperDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(wrapperDiv);
        
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        const apiKey = document.getElementById('apiKeyInput')?.value || '';
        if (!apiKey) {
            contentDiv.innerHTML = "SYSTEM ERROR: API Key missing. Please provide Gemini API Key in the left sidebar input.";
            return;
        }

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                chatHistory.push({role: "assistant", content: data.response});
                scrollToBottom();
            }
        } catch (error) {
            contentDiv.innerHTML = `CONNECTION FAILED: ${error.message}`;
        }
    }

    // --- Voice Input Logic ---
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
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event('input')); 
            sendMessage(); 
        };

        recognition.onerror = function(event) {
            resetMic();
        };

        recognition.onend = function() {
            resetMic();
        };
    } else {
        micBtn.style.display = 'none';
    }

    micBtn.addEventListener('click', () => {
        if (!recognition) return;
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    function resetMic() {
        isRecording = false;
        micBtn.style.color = '';
        chatInput.placeholder = "Type your message";
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
