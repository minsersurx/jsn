const API_URL = 'ds.genyuu.com'; 

const chatFab = document.getElementById('chatFab');
const chatModal = document.getElementById('chatModal');
const chatOverlay = document.getElementById('chatOverlay'); 
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

const systemPrompt = {
    role: 'system',
    content: '你现在是我的专属情感倾听者和老友，语气要温暖、自然、有同理心，回答可以使用 Markdown 格式排版。'
};

let chatHistory = JSON.parse(localStorage.getItem('myChatHistory')) || [];

function renderChat() {
    if (!chatBody) return;
    chatBody.innerHTML = '';
    chatHistory.forEach(msg => {
        if (msg.role === 'system') return; 
        appendMessage(msg.role, msg.content);
    });
    scrollToBottom();
}

function appendMessage(role, content) {
    if (!chatBody) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${role === 'user' ? 'msg-user' : 'msg-ai'}`;
    div.innerHTML = role === 'user' ? content : marked.parse(content);
    chatBody.appendChild(div);
}

function scrollToBottom() {
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function saveHistory() {
    localStorage.setItem('myChatHistory', JSON.stringify(chatHistory));
}

function openChat() {
    if (chatModal) chatModal.classList.remove('hidden');
    if (chatOverlay) chatOverlay.classList.add('active'); 
    document.body.classList.add('modal-open'); 
    renderChat();
}

function closeChat() {
    if (chatModal) chatModal.classList.add('hidden');
    if (chatOverlay) chatOverlay.classList.remove('active'); 
    document.body.classList.remove('modal-open'); 
}

// 发送消息与流式接收
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    appendMessage('user', text);
    chatHistory.push({ role: 'user', content: text });
    saveHistory();
    scrollToBottom();

    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-msg msg-ai';
    aiMsgDiv.innerHTML = '<span style="color:#999">正在思考...</span>';
    chatBody.appendChild(aiMsgDiv);
    scrollToBottom();

    try {
        const messagesToSend = [systemPrompt, ...chatHistory];

        // 增加了 10 秒超时检测
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: messagesToSend, stream: true }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('网络请求失败');

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let aiFullReply = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break; 
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(6));
                        const delta = data.choices[0].delta.content || '';
                        aiFullReply += delta;
                        aiMsgDiv.innerHTML = marked.parse(aiFullReply);
                        scrollToBottom();
                    } catch(e) {}
                }
            }
        }

        chatHistory.push({ role: 'assistant', content: aiFullReply });
        saveHistory();

    } catch (error) {
        // ✨ 这里是针对“无梯子”环境的优化提示
        let errorMsg = '⚠️ 抱歉，连接失败。';
        if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
            errorMsg = '⚠️ **连接超时/失败**：检测到网络无法直达 AI 服务器。如果不挂梯子无法回答，请联系魔王为 API 绑定自定义域名。';
        }
        aiMsgDiv.innerHTML = marked.parse(errorMsg);
        chatHistory.pop(); 
        saveHistory();
    }
}

// ================== 事件监听绑定 ==================

if (chatFab) {
    chatFab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chatModal.classList.contains('hidden')) { openChat(); } else { closeChat(); }
    });
}

if (chatOverlay) {
    chatOverlay.addEventListener('click', () => closeChat());
}

if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); 
            sendMessage();
        }
    });
}

// 导出聊天记录功能
const chatExportBtn = document.getElementById('chatExportBtn');
if (chatExportBtn) {
    chatExportBtn.addEventListener('click', () => {
        if (chatHistory.length === 0) return alert('还没有聊天记录哦！');
        let textContent = "==== 我们的专属 AI 聊天记录 ====\n\n";
        chatHistory.forEach(msg => {
            if (msg.role !== 'system') {
                const sender = msg.role === 'user' ? '我' : 'AI';
                textContent += `【${sender}】: ${msg.content}\n\n`;
            }
        });
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `聊天记录_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// 新标签页打开功能
const chatNewTabBtn = document.getElementById('chatNewTabBtn');
if (chatNewTabBtn) {
    chatNewTabBtn.addEventListener('click', () => {
        closeChat();
        window.open('chat.html', '_blank');
    });
}

// ================== 联络矩阵：滑动切页逻辑 ==================
(function() {
    const contactBtn = document.getElementById('contactHuman');
    const menu = document.getElementById('contactMenu');
    const card = document.getElementById('contactCard');
    
    // 切换电话页面：利用 CSS 的 transform 实现滑动
    window.togglePhonePage = function(showPhone) {
        if(showPhone) {
            card.classList.add('show-phone');
        } else {
            card.classList.remove('show-phone');
        }
    };

    if (contactBtn && menu) {
        // 打开主弹窗
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            togglePhonePage(false); // 重置到第一页
            menu.style.display = 'flex';
            setTimeout(() => menu.classList.add('active'), 10);
        });

        const closeMenu = () => {
            menu.classList.remove('active');
            setTimeout(() => menu.style.display = 'none', 400);
        };

        const closeBtnInMenu = document.getElementById('closeContact');
        if(closeBtnInMenu) closeBtnInMenu.onclick = closeMenu;
        
        menu.onclick = (e) => { if (e.target === menu) closeMenu(); };

        // 微信复制逻辑
        window.handleWechat = function() {
            const wxId = "genyuu0817";
            navigator.clipboard.writeText(wxId).then(() => {
                alert('✨ 魔王微信号已复制！\n请打开微信粘贴搜索。');
            }).catch(() => {
                alert('微信号: ' + wxId);
            });
        };
    }
})();
