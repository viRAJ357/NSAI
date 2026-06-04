document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    const messagesContainer = document.getElementById('messagesContainer');
    
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
            chatInput.placeholder = `Attached: ${file.name} - Enter command...`;
            chatInput.focus();
        };
        reader.readAsDataURL(file);
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight < 200 ? this.scrollHeight : 200) + 'px';
        
        // Change send button color when typing
        if (this.value.trim() !== '') {
            sendBtn.style.color = 'var(--accent-neon)';
        } else {
            sendBtn.style.color = 'var(--text-secondary)';
        }
    });

    // Handle Enter key (Shift+Enter for new line)
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

        const messageData = {
            role: "user", 
            content: text,
            attachment: pendingAttachment
        };

        // 1. Add User Message
        appendUserMessage(text, pendingAttachment);
        chatHistory.push(messageData);
        
        const payloadAttachment = pendingAttachment;
        
        // Clear input and attachment
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.placeholder = "Enter command, click mic, or attach file...";
        sendBtn.style.color = 'var(--text-secondary)';
        pendingAttachment = null;
        fileInput.value = "";

        // 2. Fetch AI Processing & Response
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
                attachmentHtml = `<div style="font-size: 0.8em; color: var(--accent-neon); margin-bottom: 0.5rem;">📎 ${attachment.name}</div>`;
            }
        }

        messageDiv.innerHTML = `
            <div class="message-content">
                ${escapeHTML(text)}
                ${attachmentHtml}
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    async function fetchAIResponse(userText, attachment) {
        // Create AI message container
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-cursor';
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();

        const apiKey = document.getElementById('apiKeyInput')?.value || '';
        
        if (!apiKey) {
            typeResponse("> SYSTEM ERROR: API Key missing.\n> Please provide [GEMINI_API_KEY] in the sidebar.", contentDiv, false);
            return;
        }

        contentDiv.innerHTML = "> Establishing secure connection to neural backend...<br>";
        scrollToBottom();

        try {
            const res = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: userText,
                    attachment: attachment,
                    history: chatHistory.slice(0, -1), // Send history without the current message
                    api_key: apiKey
                })
            });

            const data = await res.json();
            
            contentDiv.classList.remove('typing-cursor');
            
            if (!res.ok) {
                typeResponse(`> FATAL ERROR: ${data.error || 'Unknown server error'}`, contentDiv, false);
            } else {
                // Render with marked.js instead of typing out slowly to support complex markdown/tables
                contentDiv.innerHTML = marked.parse(data.response || "> No data received.");
                // Apply syntax highlighting
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                chatHistory.push({role: "assistant", content: data.response});
                scrollToBottom();
            }
        } catch (error) {
            contentDiv.classList.remove('typing-cursor');
            typeResponse(`> CONNECTION FAILED: ${error.message}\n> Is the NSAI backend server running?`, contentDiv, false);
        }
    }

    function typeResponse(response, contentDiv, useMarkdown = false) {
        if (useMarkdown) {
            contentDiv.innerHTML = marked.parse(response);
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            scrollToBottom();
            return;
        }

        // Typing effect for raw text
        let i = 0;
        const typingSpeed = 15; // ms per character
        contentDiv.classList.add('typing-cursor');
        contentDiv.innerHTML = '';

        function typeWriter() {
            if (i < response.length) {
                if (response.charAt(i) === '\n') {
                    contentDiv.innerHTML += '<br>';
                } else {
                    contentDiv.innerHTML += response.charAt(i);
                }
                i++;
                scrollToBottom();
                setTimeout(typeWriter, typingSpeed);
            } else {
                contentDiv.classList.remove('typing-cursor');
            }
        }

        setTimeout(typeWriter, 100);
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
            micBtn.classList.add('recording');
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event('input')); // trigger resize
            sendMessage(); // Automatically send after speaking
        };

        recognition.onerror = function(event) {
            console.error("Speech recognition error", event.error);
            resetMic();
        };

        recognition.onend = function() {
            resetMic();
        };
    } else {
        micBtn.style.display = 'none'; // Hide mic if not supported
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
        micBtn.classList.remove('recording');
        chatInput.placeholder = "Enter command or click mic...";
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Utility to prevent XSS
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
