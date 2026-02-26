/**
 * AI-Powered Study Buddy — Client-Side Logic
 * IBM Edunet Foundation Internship
 */

/* ═══════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showLoader() { $('#global-loader').classList.remove('hidden'); }
function hideLoader() { $('#global-loader').classList.add('hidden'); }

function showToast(message, type = 'info') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = 'toast visible ' + type;
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

/** Simple markdown-ish converter for chat responses */
function renderMarkdown(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    return html;
}

/** POST JSON to an endpoint */
async function apiPost(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Request failed');
    return data;
}

/* ═══════════════════════════════════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════════════════════════════════ */
(function initTheme() {
    const saved = localStorage.getItem('sb_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

$('#theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sb_theme', next);
});

/* ═══════════════════════════════════════════════════════════════
   TAB NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
$$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        $(`#tab-${btn.dataset.tab}`).classList.add('active');
    });
});

/* ═══════════════════════════════════════════════════════════════
   HISTORY MANAGEMENT (localStorage)
   ═══════════════════════════════════════════════════════════════ */
const HISTORY_KEY = 'sb_history';

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch { return []; }
}

function saveToHistory(type, title, data) {
    const history = getHistory();
    history.unshift({
        id: Date.now(),
        type,
        title: title.substring(0, 80),
        data,
        time: new Date().toLocaleString(),
    });
    // Keep latest 50
    if (history.length > 50) history.length = 50;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = $('#history-list');
    const history = getHistory();
    if (history.length === 0) {
        list.innerHTML = '<p class="history-empty">No history yet. Start learning!</p>';
        return;
    }
    list.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <span class="h-type">${item.type}</span>
            <div class="h-title">${item.title}</div>
            <div class="h-time">${item.time}</div>
        </div>
    `).join('');
}

// Panel open / close
$('#history-btn').addEventListener('click', () => {
    const panel = $('#history-panel');
    panel.classList.remove('hidden');
    setTimeout(() => panel.classList.add('visible'), 10);
    renderHistory();
});
$('#history-close').addEventListener('click', () => {
    const panel = $('#history-panel');
    panel.classList.remove('visible');
    setTimeout(() => panel.classList.add('hidden'), 400);
});
$('#history-clear').addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('History cleared', 'success');
});

/* ═══════════════════════════════════════════════════════════════
   1. CONCEPT EXPLAINER
   ═══════════════════════════════════════════════════════════════ */
$('#explain-btn').addEventListener('click', async () => {
    const topic = $('#explain-input').value.trim();
    if (!topic) return showToast('Please enter a topic', 'error');

    showLoader();
    try {
        const data = await apiPost('/api/explain', { topic });
        $('#explain-simple').textContent = data.simple || '';
        $('#explain-detailed').textContent = data.detailed || '';
        $('#explain-example').textContent = data.example || '';

        const stepsList = $('#explain-steps');
        stepsList.innerHTML = '';
        (data.steps || []).forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });

        $('#explain-result').classList.remove('hidden');
        saveToHistory('Explain', topic, data);
        showToast('Explanation ready!', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        hideLoader();
    }
});

// Enter key support
$('#explain-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#explain-btn').click();
});

/* ═══════════════════════════════════════════════════════════════
   2. NOTES SUMMARIZER
   ═══════════════════════════════════════════════════════════════ */
$('#summarize-btn').addEventListener('click', async () => {
    const notes = $('#summarize-input').value.trim();
    if (!notes) return showToast('Please paste your notes', 'error');

    showLoader();
    try {
        const data = await apiPost('/api/summarize', { notes });
        $('#summarize-summary').textContent = data.summary || '';

        const bulletsList = $('#summarize-bullets');
        bulletsList.innerHTML = '';
        (data.bullets || []).forEach(b => {
            const li = document.createElement('li');
            li.textContent = b;
            bulletsList.appendChild(li);
        });

        const takeList = $('#summarize-takeaways');
        takeList.innerHTML = '';
        (data.takeaways || []).forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            takeList.appendChild(li);
        });

        $('#summarize-result').classList.remove('hidden');
        saveToHistory('Summary', notes.substring(0, 60) + '…', data);
        showToast('Summary ready!', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        hideLoader();
    }
});

/* ═══════════════════════════════════════════════════════════════
   3. QUIZ GENERATOR
   ═══════════════════════════════════════════════════════════════ */
let currentQuiz = null;

$('#quiz-btn').addEventListener('click', async () => {
    const topic = $('#quiz-input').value.trim();
    const difficulty = $('#quiz-difficulty').value;
    if (!topic) return showToast('Please enter a topic', 'error');

    showLoader();
    try {
        const data = await apiPost('/api/quiz', { topic, difficulty });
        currentQuiz = data.questions || [];
        renderQuiz(currentQuiz);
        $('#quiz-result').classList.remove('hidden');
        $('#quiz-score').classList.add('hidden');
        saveToHistory('Quiz', `${topic} (${difficulty})`, data);
        showToast('Quiz generated!', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        hideLoader();
    }
});

$('#quiz-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#quiz-btn').click();
});

function renderQuiz(questions) {
    const container = $('#quiz-questions');
    container.innerHTML = questions.map((q, i) => `
        <div class="quiz-card" data-qi="${i}">
            <span class="q-number">Q${i + 1}</span>
            <div class="q-text">${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((opt, oi) => `
                    <label class="quiz-option" data-oi="${oi}">
                        <input type="radio" name="q${i}" value="${opt.charAt(0)}">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
            <div class="quiz-explanation" id="qexp-${i}">${q.explanation || ''}</div>
        </div>
    `).join('');

    // Option selection highlight
    container.querySelectorAll('.quiz-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const card = opt.closest('.quiz-card');
            card.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            opt.querySelector('input').checked = true;
        });
    });
}

// Check answers
$('#quiz-submit').addEventListener('click', () => {
    if (!currentQuiz || !currentQuiz.length) return;
    let score = 0;

    currentQuiz.forEach((q, i) => {
        const card = $(`.quiz-card[data-qi="${i}"]`);
        const selected = card.querySelector('input:checked');
        const correctLetter = q.answer.trim().charAt(0).toUpperCase();

        card.querySelectorAll('.quiz-option').forEach(opt => {
            const val = opt.querySelector('input').value.trim().charAt(0).toUpperCase();
            if (val === correctLetter) {
                opt.classList.add('correct');
            }
            if (selected && selected.value.trim().charAt(0).toUpperCase() === val && val !== correctLetter) {
                opt.classList.add('wrong');
            }
        });

        if (selected && selected.value.trim().charAt(0).toUpperCase() === correctLetter) {
            score++;
        }

        // Show explanation
        $(`#qexp-${i}`).style.display = 'block';
    });

    const scoreEl = $('#quiz-score');
    scoreEl.classList.remove('hidden');
    scoreEl.textContent = `🏆 Your Score: ${score} / ${currentQuiz.length}`;
});

// Download quiz as PDF (using browser print)
$('#quiz-download').addEventListener('click', () => {
    if (!currentQuiz || !currentQuiz.length) return showToast('Generate a quiz first', 'error');

    let content = '<html><head><title>Quiz - AI Study Buddy</title>';
    content += '<style>';
    content += 'body{font-family:Inter,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a2e;}';
    content += 'h1{text-align:center;color:#6C5CE7;margin-bottom:30px;}';
    content += '.q{margin-bottom:24px;padding:16px;border:1px solid #e2e5ea;border-radius:10px;}';
    content += '.q h3{margin-bottom:10px;color:#5A4BD1;}';
    content += '.opt{margin:6px 0;padding:6px 12px;background:#f7f8fa;border-radius:6px;}';
    content += '.ans{margin-top:10px;padding:8px 12px;background:#e8f8f5;border-radius:6px;font-weight:600;color:#00b894;}';
    content += '</style></head><body>';
    content += '<h1>📝 Quiz — AI Study Buddy</h1>';

    currentQuiz.forEach((q, i) => {
        content += `<div class="q"><h3>Q${i + 1}. ${q.question}</h3>`;
        q.options.forEach(opt => {
            content += `<div class="opt">${opt}</div>`;
        });
        content += `<div class="ans">✅ Answer: ${q.answer} — ${q.explanation || ''}</div></div>`;
    });

    content += '</body></html>';

    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
    win.print();
});

/* ═══════════════════════════════════════════════════════════════
   4. FLASHCARD GENERATOR
   ═══════════════════════════════════════════════════════════════ */
$('#flashcard-btn').addEventListener('click', async () => {
    const topic = $('#flashcard-input').value.trim();
    if (!topic) return showToast('Please enter a topic', 'error');

    showLoader();
    try {
        const data = await apiPost('/api/flashcards', { topic, count: 6 });
        renderFlashcards(data.flashcards || []);
        $('#flashcard-result').classList.remove('hidden');
        saveToHistory('Flashcard', topic, data);
        showToast('Flashcards ready! Click to flip.', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        hideLoader();
    }
});

$('#flashcard-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#flashcard-btn').click();
});

function renderFlashcards(cards) {
    const grid = $('#flashcard-grid');
    grid.innerHTML = cards.map(card => `
        <div class="flashcard" onclick="this.classList.toggle('flipped')">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <span>${card.question}</span>
                    <span class="flashcard-hint">Click to reveal</span>
                </div>
                <div class="flashcard-back">
                    <span>${card.answer}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/* ═══════════════════════════════════════════════════════════════
   5. AI CHAT
   ═══════════════════════════════════════════════════════════════ */
let chatHistory = [];

$('#chat-btn').addEventListener('click', sendChatMessage);
$('#chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// Auto-resize textarea
$('#chat-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

async function sendChatMessage() {
    const input = $('#chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Clear welcome
    const welcome = $('.chat-welcome');
    if (welcome) welcome.remove();

    // Add user bubble
    appendChatBubble(message, 'user');
    chatHistory.push({ role: 'user', content: message });
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    const typingId = appendChatBubble('Thinking…', 'assistant');

    try {
        const data = await apiPost('/api/chat', {
            message,
            history: chatHistory,
        });

        // Replace typing with actual response
        const typingEl = document.getElementById(typingId);
        if (typingEl) typingEl.innerHTML = renderMarkdown(data.reply);

        chatHistory.push({ role: 'assistant', content: data.reply });
    } catch (e) {
        const typingEl = document.getElementById(typingId);
        if (typingEl) {
            typingEl.innerHTML = `⚠️ ${e.message}`;
            typingEl.style.color = 'var(--error)';
        }
    }
}

function appendChatBubble(text, role) {
    const messages = $('#chat-messages');
    const bubble = document.createElement('div');
    const id = 'msg-' + Date.now();
    bubble.id = id;
    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = role === 'user' ? text : renderMarkdown(text);
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return id;
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
renderHistory();
