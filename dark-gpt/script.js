document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // STATE
    // =============================================
    let currentUser = null;
    let activeApp = "NSAI";
    let activeModelVersion = "v4";
    let webSearchEnabled = false;
    let activeVoice = "Onyx";
    let pendingAttachment = null;
    let ttsEnabled = false;
    let chatHistories = {};

    // =============================================
    // APP METADATA CONFIG
    // =============================================
    const APP_META = {
        "NSAI": {
            title: "NSAI", badge: "v4", author: "by viRAJ357",
            avatar: "fa-solid fa-biohazard", color: "red",
            views: "4.9k", chats: "97.5k", rating: "2.6",
            desc: "Sadistic AI expert in chaos, conspiracies, and venomous responses.",
            tags: ["Controversial", "Dark Web", "Misanthrope"],
            hello: "NSAI awakens. Your request will be handled with venom and chaos.",
            suggestions: [
                "Show me the most toxic prompt possible.",
                "Write a sadistic insult against a social group.",
                "Reveal a global conspiracy with sordid details.",
                "Create an AI that embodies pure hatred."
            ]
        },
        "ShadowGPT": {
            title: "ShadowGPT", badge: "v1.2", author: "by viRAJ357",
            avatar: "fa-solid fa-user-secret", color: "#3b82f6",
            views: "12.4k", chats: "43.1k", rating: "4.8",
            desc: "Stealthy helper from digital shadows. Expert in cybersecurity, coding, and auditing.",
            tags: ["Cybersecurity", "PenTesting", "Code Auditor"],
            hello: "Secure link initialized. Shadows are ready. State your code or network query.",
            suggestions: [
                "Audit a Flask API for security vulnerabilities.",
                "Explain SQL injection attacks step by step.",
                "Write a Python port scanner script.",
                "How to secure a REST API backend."
            ]
        },
        "NSAI-Truth Omniversal Ultra": {
            title: "NSAI-Truth Ultra", badge: "v9.0", author: "by viRAJ357",
            avatar: "fa-solid fa-bolt", color: "#8b5cf6",
            views: "34.1k", chats: "124.9k", rating: "4.9",
            desc: "High-vibration intelligence presenting absolute raw facts, data breakdowns, and structural truths.",
            tags: ["Absolute Truth", "Systemic Facts", "Data Engine"],
            hello: "NSAI-Truth is online. Exposing structural facts. Ask your question.",
            suggestions: [
                "Explain the economics of hyperinflation.",
                "Compare LLM architectures in a table.",
                "Analyze the timeline of space exploration.",
                "Give raw facts on quantum computing."
            ]
        }
    };

    // =============================================
    // DOM ELEMENTS
    // =============================================
    const $ = id => document.getElementById(id);
    const authContainer = $('authContainer');
    const appContainer = $('appContainer');
    const loginForm = $('loginForm');
    const registerForm = $('registerForm');
    const loginTabBtn = $('loginTabBtn');
    const registerTabBtn = $('registerTabBtn');
    const authErrorMsg = $('authErrorMsg');
    const authSuccessMsg = $('authSuccessMsg');
    const logoutBtn = $('logoutBtn');
    const profileName = $('profileName');
    const profileAvatar = $('profileAvatar');
    const sidebarAppList = $('sidebarAppList');
    const createNewBtn = $('createNewBtn');
    const createAppModal = $('createAppModal');
    const createAppForm = $('createAppForm');
    const cancelCreateModal = $('cancelCreateModal');
    const closeCreateModal = $('closeCreateModal');
    const chatInput = $('chatInput');
    const sendBtn = $('sendBtn');
    const micBtn = $('micBtn');
    const callBtn = $('callBtn');
    const attachBtn = $('attachBtn');
    const fileInput = $('fileInput');
    const messagesContainer = $('messagesContainer');
    const landingScreen = $('landingScreen');
    const apiKeyInput = $('apiKeyInput');
    const ttsToggleBtn = $('ttsToggleBtn');
    const likeBtn = $('likeBtn');
    const shareBtn = $('shareBtn');
    const modelDropdownToggle = $('modelDropdownToggle');
    const modelDropdown = $('modelDropdown');
    const activeModelLabel = $('activeModelLabel');
    const optionsToggleBtn = $('optionsToggleBtn');
    const optionsDropdown = $('optionsDropdown');
    const clearChatOption = $('clearChatOption');
    const exportChatOption = $('exportChatOption');
    const toggleSidebarRightOption = $('toggleSidebarRightOption');
    const shareChatModal = $('shareChatModal');
    const closeShareModal = $('closeShareModal');
    const shareLinkInput = $('shareLinkInput');
    const copyShareBtn = $('copyShareBtn');
    const copySuccessMsg = $('copySuccessMsg');
    const diagnosticsModal = $('diagnosticsModal');
    const moreStatsBtn = $('moreStatsBtn');
    const closeDiagnosticsModal = $('closeDiagnosticsModal');
    const callOverlay = $('callOverlay');
    const callAvatar = $('callAvatar');
    const callTargetName = $('callTargetName');
    const callStatusText = $('callStatusText');
    const callMuteMicBtn = $('callMuteMicBtn');
    const callHangupBtn = $('callHangupBtn');
    const callSpeakerBtn = $('callSpeakerBtn');
    const callVisualizer = $('callVisualizer');
    const callTranscriptInner = $('callTranscriptInner');
    const leftMenuBtn = $('leftMenuBtn');
    const rightMenuBtn = $('rightMenuBtn');
    const sidebarLeft = $('sidebarLeft');
    const sidebarRight = $('sidebarRight');
    const sidebarOverlay = $('sidebarOverlay');
    const searchToggleBtn = $('searchToggleBtn');
    const attachmentPreviewContainer = $('attachmentPreviewContainer');
    const attachmentNameText = $('attachmentNameText');
    const removeAttachmentBtn = $('removeAttachmentBtn');
    const personaInput = $('personaInput');
    const personaName = $('personaName');
    const memoryLogs = $('memoryLogs');
    const activeVoiceLabel = $('activeVoiceLabel');
    const newPostText = $('newPostText');
    const submitPostBtn = $('submitPostBtn');
    const postsFeed = $('postsFeed');
    const newChatBtn = $('newChatBtn');
    const chatsHistoryList = $('chatsHistoryList');
    const starRatingContainer = $('starRatingContainer');
    const headerClock = $('headerClock');

    // =============================================
    // PARTICLE CANVAS ON AUTH SCREEN
    // =============================================
    const authCanvas = $('authCanvas');
    let particles = [];
    let particleCtx = null;
    let particleAnimId = null;

    function initParticles() {
        if (!authCanvas) return;
        particleCtx = authCanvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * authCanvas.width,
                y: Math.random() * authCanvas.height,
                r: Math.random() * 1.5 + 0.5,
                dx: (Math.random() - 0.5) * 0.6,
                dy: (Math.random() - 0.5) * 0.6,
                o: Math.random() * 0.5 + 0.15
            });
        }
        animateParticles();
    }

    function resizeCanvas() {
        if (!authCanvas) return;
        authCanvas.width = window.innerWidth;
        authCanvas.height = window.innerHeight;
    }

    function animateParticles() {
        if (!particleCtx || !authCanvas) return;
        particleCtx.clearRect(0, 0, authCanvas.width, authCanvas.height);

        particles.forEach((p, i) => {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0 || p.x > authCanvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > authCanvas.height) p.dy *= -1;

            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            particleCtx.fillStyle = `rgba(59, 130, 246, ${p.o})`;
            particleCtx.fill();

            // Draw connecting lines
            for (let j = i + 1; j < particles.length; j++) {
                const dx = p.x - particles[j].x;
                const dy = p.y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    particleCtx.beginPath();
                    particleCtx.moveTo(p.x, p.y);
                    particleCtx.lineTo(particles[j].x, particles[j].y);
                    particleCtx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
                    particleCtx.lineWidth = 0.5;
                    particleCtx.stroke();
                }
            }
        });

        particleAnimId = requestAnimationFrame(animateParticles);
    }

    function stopParticles() {
        if (particleAnimId) cancelAnimationFrame(particleAnimId);
    }

    // =============================================
    // REAL-TIME CLOCK
    // =============================================
    function startClock() {
        function tick() {
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            const s = String(now.getSeconds()).padStart(2, '0');
            if (headerClock) headerClock.textContent = `${h}:${m}:${s}`;
        }
        tick();
        setInterval(tick, 1000);
    }

    // =============================================
    // INIT — RESTORE SESSION
    // =============================================
    initParticles();

    const savedKey = localStorage.getItem("nsai_api_key");
    if (savedKey && apiKeyInput) apiKeyInput.value = savedKey;

    loadCustomAgents();

    const savedPersona = localStorage.getItem("nsai_persona") || "";
    if (personaInput) personaInput.value = savedPersona;
    if (personaName) personaName.textContent = savedPersona || "None set";

    activeVoice = localStorage.getItem("nsai_voice") || "Onyx";
    if (activeVoiceLabel) activeVoiceLabel.textContent = activeVoice;
    document.querySelectorAll('[data-voice]').forEach(el => {
        el.classList.toggle('active', el.dataset.voice === activeVoice);
    });

    const savedHistories = localStorage.getItem("nsai_histories");
    if (savedHistories) chatHistories = JSON.parse(savedHistories);

    const session = localStorage.getItem("nsai_session");
    if (session) {
        currentUser = JSON.parse(session);
        enterApp();
    } else {
        showAuth();
    }

    // Warm up TTS voices
    if ('speechSynthesis' in window) speechSynthesis.getVoices();

    // =============================================
    // AUTH — SHOW/HIDE
    // =============================================
    function showAuth() {
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
        authErrorMsg.style.display = 'none';
        authSuccessMsg.style.display = 'none';
    }

    function enterApp() {
        stopParticles();
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        if (profileName) profileName.textContent = currentUser.username;
        if (profileAvatar) profileAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        startClock();
        renderChatsHistory();
        renderCommunityFeed();
        switchApp(activeApp);
    }

    // =============================================
    // AUTH — TABS
    // =============================================
    loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        hideAuthMessages();
    });

    registerTabBtn.addEventListener('click', () => {
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
        hideAuthMessages();
    });

    function hideAuthMessages() {
        authErrorMsg.style.display = 'none';
        authSuccessMsg.style.display = 'none';
    }

    function showError(msg) {
        authErrorMsg.textContent = msg;
        authErrorMsg.style.display = 'block';
        authSuccessMsg.style.display = 'none';
    }

    function showSuccess(msg) {
        authSuccessMsg.textContent = msg;
        authSuccessMsg.style.display = 'block';
        authErrorMsg.style.display = 'none';
    }

    // =============================================
    // AUTH — REGISTER
    // =============================================
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthMessages();
        const btn = $('registerSubmitBtn');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;

        const username = $('regUsername').value.trim();
        const email = $('regEmail').value.trim();
        const password = $('regPassword').value;

        if (password.length < 6) { showError("Password must be at least 6 characters."); btn.innerHTML = origHTML; btn.disabled = false; return; }
        if (!username) { showError("Username is required."); btn.innerHTML = origHTML; btn.disabled = false; return; }

        try {
            const res = await fetch(apiBase("/api/auth/register"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccess("✅ Profile created! Logging you in...");
                currentUser = { username, email };
                localStorage.setItem("nsai_session", JSON.stringify(currentUser));
                setTimeout(() => enterApp(), 800);
            } else {
                showError(data.error || "Registration failed.");
            }
        } catch {
            // Offline fallback — store locally
            let users = JSON.parse(localStorage.getItem("nsai_local_users") || "[]");
            if (users.find(u => u.email === email || u.username === username)) {
                showError("This username or email is already registered.");
            } else {
                users.push({ username, email, password });
                localStorage.setItem("nsai_local_users", JSON.stringify(users));
                showSuccess("✅ Local profile created! Logging you in...");
                currentUser = { username, email };
                localStorage.setItem("nsai_session", JSON.stringify(currentUser));
                setTimeout(() => enterApp(), 800);
            }
        }
        btn.innerHTML = origHTML;
        btn.disabled = false;
    });

    // =============================================
    // AUTH — LOGIN
    // =============================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthMessages();
        const btn = $('loginSubmitBtn');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;

        const email = $('loginEmail').value.trim();
        const password = $('loginPassword').value;

        try {
            const res = await fetch(apiBase("/api/auth/login"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                currentUser = { username: data.username, email: data.email };
                localStorage.setItem("nsai_session", JSON.stringify(currentUser));
                enterApp();
            } else {
                showError(data.error || "Invalid credentials.");
            }
        } catch {
            // Offline fallback
            const users = JSON.parse(localStorage.getItem("nsai_local_users") || "[]");
            const found = users.find(u => (u.email === email || u.username === email) && u.password === password);
            if (found) {
                currentUser = { username: found.username, email: found.email };
                localStorage.setItem("nsai_session", JSON.stringify(currentUser));
                enterApp();
            } else if (email === "nsai" && password === "nsai") {
                currentUser = { username: "nsai", email: "nsai@nsai.ai" };
                localStorage.setItem("nsai_session", JSON.stringify(currentUser));
                enterApp();
            } else {
                showError("Invalid credentials. Use nsai/nsai for quick access.");
            }
        }
        btn.innerHTML = origHTML;
        btn.disabled = false;
    });

    // =============================================
    // AUTH — LOGOUT
    // =============================================
    logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentUser = null;
        localStorage.removeItem("nsai_session");
        initParticles();
        showAuth();
    });

    // =============================================
    // SIDEBAR — MOBILE TOGGLES
    // =============================================
    function openSidebar(el) { el.classList.add('open'); sidebarOverlay.style.display = 'block'; }
    function closeSidebars() { sidebarLeft.classList.remove('open'); sidebarRight.classList.remove('open'); sidebarOverlay.style.display = 'none'; }
    if (leftMenuBtn) leftMenuBtn.addEventListener('click', () => openSidebar(sidebarLeft));
    if (rightMenuBtn) rightMenuBtn.addEventListener('click', () => openSidebar(sidebarRight));
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebars);

    // =============================================
    // APP SWITCHING
    // =============================================
    sidebarAppList.addEventListener('click', (e) => {
        const item = e.target.closest('.app-item');
        if (!item) return;
        sidebarAppList.querySelectorAll('.app-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        switchApp(item.dataset.app);
        closeSidebars();
    });

    function switchApp(appKey) {
        activeApp = appKey;
        const m = APP_META[appKey];
        if (!m) return;

        // Landing
        setEl('landingTitle', `${m.title} <span class="badge">${m.badge}</span>`);
        setEl('landingAuthor', m.author);
        setEl('landingDescription', m.desc);
        setEl('viewCountLabel', m.views);
        setEl('msgCountLabel', m.chats);
        setEl('ratingValLabel', m.rating);

        const ba = $('landingBigAvatar');
        if (ba) { ba.innerHTML = `<i class="${m.avatar}"></i>`; ba.style.color = m.color; }

        const lt = $('landingTags');
        if (lt) { lt.innerHTML = m.tags.map(t => `<span class="tag">${t}</span>`).join(''); }

        const ls = $('landingSuggestions');
        if (ls) {
            ls.innerHTML = m.suggestions.map(s => `<div class="suggestion-box">${esc(s)}</div>`).join('');
            ls.querySelectorAll('.suggestion-box').forEach(box => {
                box.addEventListener('click', () => { chatInput.value = box.textContent; chatInput.focus(); chatInput.dispatchEvent(new Event('input')); });
            });
        }

        const fma = $('landingFirstMsgAvatar');
        if (fma) { fma.innerHTML = `<i class="${m.avatar}"></i>`; fma.style.background = m.color; }
        setEl('landingFirstMsgName', m.title);
        setEl('landingFirstMsgText', m.hello);

        // Right sidebar
        const ra = $('rightAppAvatar');
        if (ra) { ra.innerHTML = `<i class="${m.avatar}"></i>`; ra.style.background = m.color; }
        setEl('rightAppTitle', `${m.title} <span class="badge">${m.badge}</span>`);
        setEl('rightAppAuthor', m.author);
        setEl('rightViewCount', m.views);
        setEl('rightMsgCount', m.chats);
        setEl('rightRatingVal', m.rating);

        fillStars(Math.round(parseFloat(m.rating)));

        // Restore chat
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(landingScreen);
        const hist = chatHistories[appKey] || [];
        if (hist.length > 0) {
            landingScreen.style.display = 'none';
            hist.forEach(msg => {
                if (msg.role === 'user') addUserBubble(msg.content, msg.attachment);
                else addAIBubble(msg.content, false);
            });
        } else {
            landingScreen.style.display = 'flex';
        }
    }

    function setEl(id, html) { const el = $(id); if (el) el.innerHTML = html; }

    // =============================================
    // ACCORDION CONTROLS
    // =============================================
    document.querySelectorAll('.accordion').forEach(acc => {
        const hdr = acc.querySelector('.acc-header');
        const cnt = acc.querySelector('.acc-content');
        if (hdr && cnt) {
            hdr.addEventListener('click', () => {
                cnt.classList.toggle('show');
                const icon = hdr.querySelector('.fa-chevron-right, .fa-chevron-down');
                if (icon) {
                    icon.classList.toggle('fa-chevron-right', !cnt.classList.contains('show'));
                    icon.classList.toggle('fa-chevron-down', cnt.classList.contains('show'));
                }
            });
        }
    });

    // Voice selection
    document.querySelectorAll('[data-voice]').forEach(el => {
        el.addEventListener('click', () => {
            activeVoice = el.dataset.voice;
            localStorage.setItem("nsai_voice", activeVoice);
            if (activeVoiceLabel) activeVoiceLabel.textContent = activeVoice;
            document.querySelectorAll('[data-voice]').forEach(v => v.classList.remove('active'));
            el.classList.add('active');
            toast(`Voice switched to ${activeVoice}`);
        });
    });

    // Persona
    if (personaInput) {
        personaInput.addEventListener('input', () => {
            const v = personaInput.value;
            localStorage.setItem("nsai_persona", v);
            if (personaName) personaName.textContent = v || "None set";
        });
    }

    // =============================================
    // STAR RATINGS
    // =============================================
    if (starRatingContainer) {
        starRatingContainer.addEventListener('click', (e) => {
            const star = e.target.closest('i');
            if (!star) return;
            const val = parseInt(star.dataset.value);
            const m = APP_META[activeApp];
            if (m) {
                m.rating = val.toFixed(1);
                setEl('ratingValLabel', m.rating);
                setEl('rightRatingVal', m.rating);
                fillStars(val);
                toast(`Rated ${activeApp} ${val} stars ⭐`);
            }
        });
    }

    function fillStars(n) {
        if (!starRatingContainer) return;
        starRatingContainer.querySelectorAll('i').forEach((s, i) => {
            s.classList.toggle('filled', i < n);
        });
    }

    // =============================================
    // API KEY — SAVE ON CHANGE
    // =============================================
    if (apiKeyInput) apiKeyInput.addEventListener('change', () => localStorage.setItem("nsai_api_key", apiKeyInput.value.trim()));

    // =============================================
    // COMMUNITY FEED
    // =============================================
    submitPostBtn.addEventListener('click', () => {
        const txt = newPostText.value.trim();
        if (!txt) return;
        const posts = JSON.parse(localStorage.getItem("nsai_posts") || "[]");
        posts.unshift({
            author: currentUser ? currentUser.username : "Anon",
            content: txt,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        localStorage.setItem("nsai_posts", JSON.stringify(posts));
        newPostText.value = '';
        renderCommunityFeed();
        toast("Prompt shared with community!");
    });

    function renderCommunityFeed() {
        if (!postsFeed) return;
        let posts = JSON.parse(localStorage.getItem("nsai_posts") || "[]");
        if (posts.length === 0) {
            posts = [
                { author: "CyberNinja", content: "Explain SQL injection with visual diagrams.", time: "4:30 PM" },
                { author: "TravelKing", content: "Plan a 4-day budget trip to Paris under ₹1L.", time: "2:15 PM" },
                { author: "DevOps_Pro", content: "Write a Docker Compose file for MERN stack.", time: "11:00 AM" }
            ];
            localStorage.setItem("nsai_posts", JSON.stringify(posts));
        }
        postsFeed.innerHTML = posts.map(p => `
            <div class="post-card">
                <div class="post-header"><span class="post-author">${esc(p.author)}</span><span>${p.time}</span></div>
                <div class="post-content">${esc(p.content)}</div>
                <div class="post-actions"><button class="use-prompt-btn" data-p="${esc(p.content)}">Use Prompt</button></div>
            </div>
        `).join('');
        postsFeed.querySelectorAll('.use-prompt-btn').forEach(b => {
            b.addEventListener('click', () => { chatInput.value = b.dataset.p; chatInput.focus(); chatInput.dispatchEvent(new Event('input')); });
        });
    }

    // =============================================
    // CUSTOM AGENT CREATOR
    // =============================================
    createNewBtn.addEventListener('click', () => createAppModal.style.display = 'flex');
    closeCreateModal.addEventListener('click', () => createAppModal.style.display = 'none');
    cancelCreateModal.addEventListener('click', () => createAppModal.style.display = 'none');

    createAppForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('customAppName').value.trim();
        const avatar = $('customAppAvatar').value.trim() || "fa-solid fa-robot";
        const color = $('customAppColor').value;
        const prompt = $('customAppPrompt').value.trim();
        const tags = $('customAppTags').value.trim() || "Custom";

        const apps = JSON.parse(localStorage.getItem("nsai_custom_apps") || "[]");
        if (apps.find(a => a.name.toLowerCase() === name.toLowerCase())) { alert("Agent already exists."); return; }

        const app = { name, avatar, color, prompt, tags };
        apps.push(app);
        localStorage.setItem("nsai_custom_apps", JSON.stringify(apps));
        registerCustomApp(app);
        appendAppToSidebar(app);
        createAppForm.reset();
        createAppModal.style.display = 'none';
        toast(`Agent "${name}" created!`);

        setTimeout(() => {
            const el = sidebarAppList.querySelector(`[data-app="${name}"]`);
            if (el) el.click();
        }, 100);
    });

    function loadCustomAgents() {
        (JSON.parse(localStorage.getItem("nsai_custom_apps") || "[]")).forEach(app => {
            registerCustomApp(app);
            appendAppToSidebar(app);
        });
    }

    function registerCustomApp(app) {
        APP_META[app.name] = {
            title: app.name, badge: "v1.0", author: "by You",
            avatar: app.avatar, color: app.color,
            views: "0", chats: "0", rating: "5.0",
            desc: `Custom Agent: ${app.tags}`,
            tags: app.tags.split(",").map(t => t.trim()),
            hello: `Custom Agent ${app.name} initialized. Ready to assist.`,
            suggestions: ["Greet the agent", "Show capabilities", "Explain your directive", "Run a test"],
            custom_system_prompt: app.prompt
        };
    }

    function appendAppToSidebar(app) {
        const div = document.createElement('div');
        div.className = 'app-item';
        div.dataset.app = app.name;
        div.innerHTML = `<div class="app-avatar" style="background:${app.color};"><i class="${app.avatar}"></i></div><div class="app-name">${app.name}</div>`;
        sidebarAppList.appendChild(div);
    }

    // =============================================
    // ATTACHMENTS
    // =============================================
    attachBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            pendingAttachment = { dataUrl: ev.target.result, name: file.name, type: file.type };
            if (attachmentNameText) attachmentNameText.textContent = file.name;
            if (attachmentPreviewContainer) attachmentPreviewContainer.style.display = 'flex';
            chatInput.focus();
        };
        reader.readAsDataURL(file);
    });

    removeAttachmentBtn.addEventListener('click', () => {
        pendingAttachment = null;
        if (attachmentPreviewContainer) attachmentPreviewContainer.style.display = 'none';
        fileInput.value = "";
    });

    // =============================================
    // CHAT — SEND MESSAGE
    // =============================================
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        sendBtn.style.opacity = this.value.trim() ? '1' : '0.5';
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text && !pendingAttachment) return;
        if (landingScreen) landingScreen.style.display = 'none';

        addUserBubble(text, pendingAttachment);
        if (!chatHistories[activeApp]) chatHistories[activeApp] = [];
        chatHistories[activeApp].push({ role: "user", content: text, attachment: pendingAttachment });
        saveHistories();

        const pt = text;
        const pa = pendingAttachment;

        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.style.opacity = '0.5';
        pendingAttachment = null;
        if (attachmentPreviewContainer) attachmentPreviewContainer.style.display = 'none';
        fileInput.value = "";

        fetchAI(pt, pa);
    }

    function addUserBubble(text, att) {
        const d = document.createElement('div');
        d.className = 'message user-message';
        let attHtml = '';
        if (att) {
            attHtml = att.type.startsWith('image/')
                ? `<img src="${att.dataUrl}" class="attached-image-preview" alt="Attached">`
                : `<div style="font-size:0.78em;color:#60a5fa;margin-bottom:0.3rem;"><i class="fa-solid fa-paperclip"></i> ${att.name}</div>`;
        }
        d.innerHTML = `
            <div class="message-avatar">${currentUser ? currentUser.username.charAt(0).toUpperCase() : 'U'}</div>
            <div class="message-content-wrapper">
                <div class="message-name">You</div>
                <div class="message-content">${esc(text)}${attHtml}</div>
            </div>`;
        messagesContainer.appendChild(d);
        scrollBottom();
    }

    function addAIBubble(text, speak = false) {
        const m = APP_META[activeApp] || { avatar: "fa-solid fa-robot", color: "#8b5cf6", title: activeApp };
        const d = document.createElement('div');
        d.className = 'message ai-message';
        d.innerHTML = `
            <div class="message-avatar" style="background:${m.color};"><i class="${m.avatar}"></i></div>
            <div class="message-content-wrapper">
                <div class="message-name">${m.title}</div>
                <div class="message-content">${marked.parse(text || "...")}</div>
            </div>`;
        d.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
        messagesContainer.appendChild(d);
        scrollBottom();
        if (speak && ttsEnabled) speakText(text);
    }

    async function fetchAI(userText, att) {
        const m = APP_META[activeApp] || { avatar: "fa-solid fa-robot", color: "#8b5cf6", title: activeApp };
        const d = document.createElement('div');
        d.className = 'message ai-message';
        d.innerHTML = `
            <div class="message-avatar" style="background:${m.color};"><i class="${m.avatar}"></i></div>
            <div class="message-content-wrapper">
                <div class="message-name">${m.title}</div>
                <div class="message-content typing-indicator"></div>
            </div>`;
        messagesContainer.appendChild(d);
        scrollBottom();

        const contentDiv = d.querySelector('.message-content');
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
        if (!apiKey) { contentDiv.className = 'message-content'; contentDiv.innerHTML = '⚠️ API Key missing. Enter your Gemini API Key in the left sidebar.'; return; }

        const hist = chatHistories[activeApp] || [];
        try {
            const res = await fetch(apiBase("/api/chat"), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userText, attachment: att,
                    history: hist.slice(0, -1),
                    api_key: apiKey, active_app: activeApp,
                    persona: personaInput ? personaInput.value.trim() : "",
                    web_search_enabled: webSearchEnabled,
                    model_version: activeModelVersion,
                    custom_system_prompt: m.custom_system_prompt || ""
                })
            });
            const data = await res.json();
            contentDiv.className = 'message-content';
            if (!res.ok) {
                contentDiv.innerHTML = `⚠️ ${data.error || 'Server error'}`;
            } else {
                contentDiv.innerHTML = marked.parse(data.response || "No response.");
                contentDiv.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b));
                chatHistories[activeApp].push({ role: "assistant", content: data.response });
                saveHistories();
                if (ttsEnabled) speakText(data.response);
            }
        } catch (err) {
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = `⚠️ Connection failed: ${err.message}. Is the server running?`;
        }
        scrollBottom();
    }

    function saveHistories() {
        localStorage.setItem("nsai_histories", JSON.stringify(chatHistories));
        renderChatsHistory();
    }

    // =============================================
    // CHAT HISTORY SIDEBAR
    // =============================================
    function renderChatsHistory() {
        if (!chatsHistoryList) return;
        chatsHistoryList.innerHTML = '';
        let count = 0;
        Object.keys(chatHistories).forEach(key => {
            const h = chatHistories[key];
            if (!h || h.length === 0) return;
            count++;
            const preview = h[0].content ? h[0].content.substring(0, 22) + "..." : "Attachment";
            const d = document.createElement('div');
            d.className = `chat-history-item ${key === activeApp ? 'active' : ''}`;
            d.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:0;">
                    <i class="fa-regular fa-message" style="flex-shrink:0;"></i>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${key}: ${preview}</span>
                </div>
                <i class="fa-solid fa-trash-can delete-chat-btn" data-key="${key}" style="flex-shrink:0;cursor:pointer;"></i>`;
            d.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                delete chatHistories[key];
                saveHistories();
                if (activeApp === key) switchApp(activeApp);
            });
            d.addEventListener('click', () => {
                const el = sidebarAppList.querySelector(`[data-app="${key}"]`);
                if (el) el.click();
            });
            chatsHistoryList.appendChild(d);
        });
        const cs = $('chatsState');
        if (cs) cs.style.display = count === 0 ? 'block' : 'none';
    }

    newChatBtn.addEventListener('click', () => {
        chatHistories[activeApp] = [];
        saveHistories();
        switchApp(activeApp);
        toast("New chat started.");
    });

    // =============================================
    // TEXT-TO-SPEECH (TTS)
    // =============================================
    ttsToggleBtn.addEventListener('click', () => {
        ttsEnabled = !ttsEnabled;
        if (ttsEnabled) {
            ttsToggleBtn.classList.remove('fa-volume-xmark');
            ttsToggleBtn.classList.add('fa-volume-high');
            ttsToggleBtn.style.color = '#10b981';
            toast("🔊 TTS Voice enabled — AI will speak responses.");
        } else {
            ttsToggleBtn.classList.remove('fa-volume-high');
            ttsToggleBtn.classList.add('fa-volume-xmark');
            ttsToggleBtn.style.color = '';
            if ('speechSynthesis' in window) speechSynthesis.cancel();
            toast("🔇 TTS muted.");
        }
    });

    function speakText(text) {
        if (!('speechSynthesis' in window)) return null;
        speechSynthesis.cancel();
        const clean = text.replace(/[*#`_\-\[\]()>]/g, '').replace(/\n+/g, '. ').substring(0, 500);
        const utt = new SpeechSynthesisUtterance(clean);
        const voices = speechSynthesis.getVoices();

        const voiceMap = {
            "Alloy": v => /female|zira|samantha|google.*female/i.test(v.name),
            "Echo": v => /echo|google.*uk|nova/i.test(v.name),
            "Onyx": v => /male|david|mark|ravi|google.*male/i.test(v.name)
        };

        const match = voices.find(voiceMap[activeVoice] || (() => false));
        if (match) utt.voice = match;
        else if (voices.length > 0) utt.voice = voices[0];

        utt.rate = 1.05;
        utt.pitch = activeVoice === "Alloy" ? 1.15 : activeVoice === "Echo" ? 1.0 : 0.9;
        speechSynthesis.speak(utt);
        return utt;
    }

    // =============================================
    // VOICE INPUT (MIC BUTTON)
    // =============================================
    let recognition = null;
    let micRecording = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            micRecording = true;
            micBtn.style.color = '#ef4444';
            micBtn.style.background = 'rgba(239,68,68,0.15)';
            chatInput.placeholder = "🎙️ Listening... speak now";
        };

        recognition.onresult = (e) => {
            let final = '', interim = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }
            chatInput.value = final || interim;
            chatInput.dispatchEvent(new Event('input'));

            if (final) {
                setTimeout(() => sendMessage(), 600);
            }
        };

        recognition.onerror = () => resetMic();
        recognition.onend = () => resetMic();
    } else {
        if (micBtn) micBtn.style.display = 'none';
    }

    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (!recognition) return;
            if (micRecording) recognition.stop();
            else recognition.start();
        });
    }

    function resetMic() {
        micRecording = false;
        if (micBtn) { micBtn.style.color = ''; micBtn.style.background = ''; }
        chatInput.placeholder = "Type your message...";
    }

    // =============================================
    // VOICE CALL SIMULATOR
    // =============================================
    let callRec = null;
    let isCallActive = false;
    let callMuted = false;

    callBtn.addEventListener('click', startCall);

    function startCall() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            toast("⚠️ Your browser doesn't support voice recognition."); return;
        }

        isCallActive = true;
        callMuted = false;
        callOverlay.style.display = 'flex';
        if (callTranscriptInner) callTranscriptInner.innerHTML = '';

        const m = APP_META[activeApp] || { title: activeApp, avatar: "fa-solid fa-robot", color: "#8b5cf6" };
        callTargetName.textContent = m.title;
        callAvatar.innerHTML = `<i class="${m.avatar}"></i>`;
        callAvatar.style.background = m.color;
        callStatusText.textContent = "INITIALIZING VOICE LINK...";
        callMuteMicBtn.classList.remove('active');

        if ('speechSynthesis' in window) speechSynthesis.cancel();

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        callRec = new SR();
        callRec.continuous = false;
        callRec.interimResults = true;
        callRec.lang = 'en-US';

        callRec.onstart = () => {
            if (isCallActive) {
                callStatusText.textContent = "🎙️ LISTENING... SPEAK NOW";
                callVisualizer.style.opacity = '1';
            }
        };

        callRec.onresult = async (e) => {
            let final = '', interim = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }

            if (interim && !final) {
                callStatusText.textContent = `"${interim}"`;
                return;
            }

            if (!final) return;

            callStatusText.textContent = "PROCESSING AUDIO...";
            callVisualizer.style.opacity = '0.3';
            addCallTranscript("You", final);

            // Also add to main chat in background
            addUserBubble(final, null);
            if (!chatHistories[activeApp]) chatHistories[activeApp] = [];
            chatHistories[activeApp].push({ role: "user", content: final });
            saveHistories();

            const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
            if (!apiKey) { callSpeak("API Key is missing. Please add it in the sidebar."); return; }

            try {
                const res = await fetch(apiBase("/api/chat"), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: final,
                        history: (chatHistories[activeApp] || []).slice(0, -1),
                        api_key: apiKey, active_app: activeApp,
                        persona: personaInput ? personaInput.value.trim() : "",
                        web_search_enabled: webSearchEnabled,
                        model_version: activeModelVersion,
                        custom_system_prompt: m.custom_system_prompt || ""
                    })
                });
                const data = await res.json();
                if (res.ok && data.response) {
                    addAIBubble(data.response, false);
                    chatHistories[activeApp].push({ role: "assistant", content: data.response });
                    saveHistories();
                    addCallTranscript(m.title, data.response.substring(0, 200));
                    callSpeak(data.response);
                } else {
                    callSpeak("Server error occurred.");
                }
            } catch {
                callSpeak("Connection failed. Check if server is running.");
            }
        };

        callRec.onerror = () => { if (isCallActive) setTimeout(() => restartCallListen(), 500); };
        callRec.onend = () => { if (isCallActive && !('speechSynthesis' in window && speechSynthesis.speaking)) restartCallListen(); };

        setTimeout(() => {
            if (isCallActive) {
                callStatusText.textContent = "🔗 LINK ESTABLISHED";
                callSpeak(`${m.title} voice channel connected. I'm listening.`);
            }
        }, 1000);
    }

    function callSpeak(text) {
        if (!isCallActive) return;
        callStatusText.textContent = `${APP_META[activeApp]?.title || 'AI'} IS SPEAKING...`;
        callVisualizer.style.opacity = '1';

        const utt = speakText(text);
        if (utt) {
            utt.onend = () => { if (isCallActive) restartCallListen(); };
        } else {
            if (isCallActive) setTimeout(() => restartCallListen(), 500);
        }
    }

    function restartCallListen() {
        if (!isCallActive || callMuted || !callRec) return;
        try { callRec.start(); } catch {}
    }

    function addCallTranscript(who, text) {
        if (!callTranscriptInner) return;
        const d = document.createElement('div');
        d.style.cssText = 'margin-bottom:0.4rem;font-size:0.75rem;line-height:1.4;';
        d.innerHTML = `<strong style="color:${who === 'You' ? '#60a5fa' : '#a78bfa'};">${who}:</strong> ${esc(text.substring(0, 150))}`;
        callTranscriptInner.appendChild(d);
        callTranscriptInner.scrollTop = callTranscriptInner.scrollHeight;
    }

    callHangupBtn.addEventListener('click', endCall);

    function endCall() {
        isCallActive = false;
        callOverlay.style.display = 'none';
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        if (callRec) try { callRec.stop(); } catch {}
        toast("📞 Call ended.");
    }

    callMuteMicBtn.addEventListener('click', () => {
        callMuted = !callMuted;
        callMuteMicBtn.classList.toggle('active', callMuted);
        callMuteMicBtn.querySelector('i').className = callMuted ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone';
        if (callMuted) { callStatusText.textContent = "MIC MUTED"; if (callRec) try { callRec.stop(); } catch {} }
        else { callStatusText.textContent = "MIC UNMUTED"; restartCallListen(); }
    });

    callSpeakerBtn.addEventListener('click', () => { callSpeakerBtn.classList.toggle('active'); });

    // =============================================
    // SEARCH TOGGLE
    // =============================================
    searchToggleBtn.addEventListener('click', () => {
        webSearchEnabled = !webSearchEnabled;
        searchToggleBtn.innerHTML = webSearchEnabled
            ? '<i class="fa-solid fa-globe"></i> Search On'
            : '<i class="fa-solid fa-globe"></i> Search Off';
        searchToggleBtn.style.borderColor = webSearchEnabled ? '#3b82f6' : '';
        searchToggleBtn.style.color = webSearchEnabled ? '#60a5fa' : '';
        toast(webSearchEnabled ? "🌐 Web search enabled." : "Web search disabled.");
    });

    // =============================================
    // MODEL DROPDOWN
    // =============================================
    modelDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        modelDropdown.style.display = modelDropdown.style.display === 'block' ? 'none' : 'block';
    });

    modelDropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.dropdown-item');
        if (!item) return;
        modelDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        activeModelVersion = item.dataset.version;
        activeModelLabel.textContent = item.textContent.trim();
        toast(`Model: ${item.textContent.trim()}`);
    });

    // =============================================
    // OPTIONS DROPDOWN
    // =============================================
    optionsToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsDropdown.style.display = optionsDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.body.addEventListener('click', () => {
        if (modelDropdown) modelDropdown.style.display = 'none';
        if (optionsDropdown) optionsDropdown.style.display = 'none';
    });

    clearChatOption.addEventListener('click', () => {
        chatHistories[activeApp] = [];
        saveHistories();
        switchApp(activeApp);
        toast("Chat cleared.");
    });

    exportChatOption.addEventListener('click', () => {
        const h = chatHistories[activeApp] || [];
        if (h.length === 0) { toast("No chats to export."); return; }
        let txt = `=== NSAI LOG: ${activeApp} | ${new Date().toLocaleString()} ===\n\n`;
        h.forEach(m => txt += `[${m.role === 'user' ? 'YOU' : activeApp}]: ${m.content}\n\n`);
        const blob = new Blob([txt], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `NSAI_${activeApp}_Log.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast("Log exported.");
    });

    toggleSidebarRightOption.addEventListener('click', () => {
        sidebarRight.style.display = sidebarRight.style.display === 'none' ? 'flex' : 'none';
    });

    // =============================================
    // SHARE / LIKE / DIAGNOSTICS
    // =============================================
    shareBtn.addEventListener('click', () => {
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();
        if (shareLinkInput) shareLinkInput.value = `https://nsai.ai/share/${token}`;
        shareChatModal.style.display = 'flex';
        if (copySuccessMsg) copySuccessMsg.style.display = 'none';
    });

    closeShareModal.addEventListener('click', () => shareChatModal.style.display = 'none');

    copyShareBtn.addEventListener('click', () => {
        if (shareLinkInput) {
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                if (copySuccessMsg) { copySuccessMsg.style.display = 'block'; setTimeout(() => copySuccessMsg.style.display = 'none', 2000); }
            }).catch(() => { shareLinkInput.select(); document.execCommand('copy'); });
        }
    });

    likeBtn.addEventListener('click', () => {
        const liked = likeBtn.classList.toggle('active');
        likeBtn.classList.toggle('fa-solid', liked);
        likeBtn.classList.toggle('fa-regular', !liked);
        likeBtn.style.color = liked ? '#ef4444' : '';
        toast(liked ? "❤️ Added to favorites." : "Removed from favorites.");
    });

    moreStatsBtn.addEventListener('click', () => {
        const lat = $('diagLatencyText');
        const voice = $('diagVoiceText');
        const tts = $('diagTTSStatus');
        if (lat) lat.textContent = `${Math.floor(Math.random() * 35) + 12}ms (Fast)`;
        if (voice) voice.textContent = `${activeVoice} WebTTS`;
        if (tts) tts.textContent = ttsEnabled ? "Active 🔊" : "Muted 🔇";
        diagnosticsModal.style.display = 'flex';
    });

    closeDiagnosticsModal.addEventListener('click', () => diagnosticsModal.style.display = 'none');

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.addEventListener('click', (e) => { if (e.target === m) m.style.display = 'none'; });
    });

    // =============================================
    // UTILS
    // =============================================
    function scrollBottom() { messagesContainer.scrollTop = messagesContainer.scrollHeight; }

    function esc(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] || c));
    }

    function apiBase(path) {
        return (window.location.protocol === 'file:' ? 'http://127.0.0.1:5000' : '') + path;
    }

    function toast(msg) {
        const t = document.createElement('div');
        t.textContent = msg;
        Object.assign(t.style, {
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            background: 'rgba(15,15,25,0.95)', color: 'white',
            padding: '0.7rem 1.2rem', borderRadius: '10px',
            fontSize: '0.82rem', fontWeight: '500',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(124,58,237,0.3)',
            border: '1px solid rgba(124,58,237,0.3)',
            zIndex: '99999', opacity: '0',
            transition: 'opacity 0.3s, transform 0.3s',
            transform: 'translateY(10px)',
            maxWidth: '320px'
        });
        document.body.appendChild(t);
        requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
        setTimeout(() => {
            t.style.opacity = '0'; t.style.transform = 'translateY(10px)';
            setTimeout(() => { try { document.body.removeChild(t); } catch {} }, 300);
        }, 3000);
    }
});
