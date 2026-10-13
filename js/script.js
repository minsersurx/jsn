// ================== 1. 启动屏进度条与礼花同步逻辑 ==================
window.addEventListener('load', () => {
    const intro = document.getElementById('introScreen');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const birthdayMsg = document.getElementById('birthdayMessage');
    const wrapper = document.querySelector('.progress-wrapper');

    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15; 
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                // 1. 隐藏进度条
                wrapper.style.display = 'none'; 
                
                // 2. 🚀 礼花同步爆发！
                fireConfetti(); 
                
                // 3. 生日文字伴随淡入
                birthdayMsg.style.display = 'block'; 
                void birthdayMsg.offsetWidth; 
                birthdayMsg.classList.add('show');

                // 4. 欣赏 2.5 秒后，彻底隐藏加载屏
                setTimeout(() => {
                    intro.classList.add('hidden');
                }, 2500);

            }, 300); 
        }
        
        progressBar.style.width = progress + '%';
        progressText.innerText = Math.floor(progress) + '%';
    }, 100);
});

// ================== 2. 五彩礼花爆发函数 (修复被挡住的问题) ==================
function fireConfetti() {
    const count = 200;
    // 🚀 核心修复：添加 zIndex: 10000，确保礼花在所有东西（包括白屏 9999）的最前面爆发！
    const defaults = { origin: { y: 0.7 }, zIndex: 10000 }; 

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: ['#6aa5e3', '#4a8cdb', '#FFD700', '#FF69B4', '#ffffff'] 
        });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}

// ================== 3. 封面滑动与基础动效 ==================
const cover = document.getElementById('cover');
let isCovered = true;
let isAnimating = false;

function hideCover() {
    if (!isCovered || isAnimating) return;
    isAnimating = true;
    window.scrollTo(0, 0);
    cover.classList.add('slide-up');
    setTimeout(() => {
        document.body.classList.add('unlocked');
        isCovered = false;
        isAnimating = false;
    }, 800);
}

function showCover() {
    if (isCovered || isAnimating) return;
    isAnimating = true;
    document.body.classList.remove('unlocked');
    window.scrollTo(0, 0);
    cover.classList.remove('slide-up');
    setTimeout(() => { 
        isCovered = true; 
        isAnimating = false; 
    }, 800);
}

document.getElementById('scrollArrow').addEventListener('click', hideCover);

window.addEventListener('wheel', (e) => {
    if (document.body.classList.contains('modal-open')) return;
    
    if (isCovered && e.deltaY > 0) hideCover();
    else if (!isCovered && e.deltaY < 0 && window.scrollY <= 0) showCover();
}, { passive: false });

let startY = 0;
window.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('modal-open')) return;

    if (isCovered || isAnimating) {
        e.preventDefault(); 
    }

    let currentY = e.touches[0].clientY;
    let diff = startY - currentY; 

    if (isCovered && diff > 50) {
        hideCover();
    } else if (!isCovered && diff < -50 && window.scrollY <= 0) {
        showCover();
    }
}, { passive: false });

// ================== 4. 时间轴渐显 ==================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.2 });
document.querySelectorAll('.timeline-item, .reveal, .photo-item').forEach(el => observer.observe(el));

// ================== 5. 照片弹窗 ==================
const photoModal = document.getElementById('photoModal');
const modalImg = document.getElementById('modalImg');
const modalStory = document.getElementById('modalStory');

document.querySelectorAll('.photo-item').forEach(item => {
    item.addEventListener('click', () => {
        modalImg.src = item.querySelector('img').src;
        modalStory.innerHTML = item.querySelector('.expanded-story').innerHTML;
        void photoModal.offsetWidth;
        photoModal.classList.add('active');
        document.body.classList.add('modal-open');
    });
});

const bg = document.querySelector('.photo-modal-bg');
if(bg) {
    bg.addEventListener('click', () => {
        photoModal.classList.remove('active');
        setTimeout(() => document.body.classList.remove('modal-open'), 400);
    });
}

// ================== 6. 点击爱心/星光特效 ==================
const CLICK_FX = ['✨', '⭐', '🌟'];
function spawnClickHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'click-heart';
    heart.textContent = CLICK_FX[Math.floor(Math.random() * CLICK_FX.length)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.setProperty('--tx', Math.round(Math.random() * 60 - 30) + 'px');
    document.body.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
}
document.addEventListener('click', (e) => spawnClickHeart(e.clientX, e.clientY));

// ================== 7. 加好友入口：联络矩阵 ==================
(function() {
    const friendFab = document.getElementById('friendFab');
    const menu = document.getElementById('contactMenu');
    const card = document.getElementById('contactCard');

    window.togglePhonePage = function(showPhone) {
        if (showPhone) card.classList.add('show-phone');
        else card.classList.remove('show-phone');
    };

    if (friendFab && menu) {
        friendFab.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePhonePage(false);
            menu.style.display = 'flex';
            setTimeout(() => menu.classList.add('active'), 10);
        });

        const closeMenu = () => {
            menu.classList.remove('active');
            setTimeout(() => menu.style.display = 'none', 400);
        };

        const closeBtnInMenu = document.getElementById('closeContact');
        if (closeBtnInMenu) closeBtnInMenu.onclick = closeMenu;

        menu.onclick = (e) => { if (e.target === menu) closeMenu(); };

    }
})();


// ================== 8. 编辑器内容回填 ==================
(function() {
    const STORAGE_KEY = 'jsnSiteContent';

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>'"]/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[char]));
    }

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element && value !== undefined) element.textContent = value;
    }

    function applySavedContent() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        let data;
        try { data = JSON.parse(raw); } catch (error) { return; }

        setText('.cover-content h1', data.coverTitle);
        setText('.cover-content p', data.coverSubtitle);
        setText('.letter-title', data.letterTitle);
        setText('.letter-signature', data.letterSignature ? `—— ${data.letterSignature}` : '');
        const letterBody = document.querySelector('.letter-paper p');
        if (letterBody && data.letterBody !== undefined) letterBody.innerHTML = escapeHtml(data.letterBody).replace(/\n/g, '<br>');
        setText('#timeline h2', data.timelineTitle);
        setText('#photoWall h2', data.photoTitle);
        const footerText = document.querySelector('.main-footer p');
        if (footerText && data.footerText !== undefined) footerText.textContent = data.footerText;

        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            const number = index + 1;
            setText(`#timeline .timeline-item:nth-child(${number}) .timeline-date`, data[`timeline${number}Date`]);
            const content = item.querySelector('.timeline-content');
            if (content) content.innerHTML = `<strong>${escapeHtml(data[`timeline${number}Title`])}</strong><br>${escapeHtml(data[`timeline${number}Body`]).replace(/\n/g, '<br>')}`;
        });

        document.querySelectorAll('.photo-item').forEach((item, index) => {
            const number = index + 1;
            const image = item.querySelector('img');
            if (image) {
                if (data[`photo${number}Src`]) image.src = data[`photo${number}Src`];
                if (data[`photo${number}Alt`] !== undefined) image.alt = data[`photo${number}Alt`];
            }
            setText(`#photoWall .photo-item:nth-child(${number}) .photo-caption`, data[`photo${number}Caption`]);
            setText(`#photoWall .photo-item:nth-child(${number}) .expanded-story`, data[`photo${number}Story`]);
        });

        const contactHref = (name, href) => {
            const link = document.querySelector(`[data-contact="${name}"]`);
            if (link && href) link.href = href;
        };
        if (data.qq) contactHref('qq', `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${encodeURIComponent(data.qq)}&card_type=person&source=qrcode`);
        if (data.whatsapp) contactHref('whatsapp', `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`);
        if (data.telegram) contactHref('telegram', `https://t.me/${encodeURIComponent(data.telegram.replace(/^@/, ''))}`);
        contactHref('facebook', data.facebook);
        if (data.xUsername) contactHref('x', `https://x.com/${encodeURIComponent(data.xUsername.replace(/^@/, ''))}`);
        if (data.instagram) contactHref('instagram', `https://www.instagram.com/${encodeURIComponent(data.instagram.replace(/^@/, ''))}`);
        if (data.douyin) contactHref('douyin', `https://www.douyin.com/user/${encodeURIComponent(data.douyin)}`);
        if (data.emailLink) contactHref('email', data.emailLink);
        ['china', 'uk', 'hk'].forEach(country => {
            const key = `phone${country[0].toUpperCase()}${country.slice(1)}`;
            if (data[key]) {
                const phone = data[key].replace(/\s/g, '');
                const link = document.querySelector(`[data-phone="${country}"]`);
                if (link) link.href = `tel:${phone}`;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', applySavedContent);
})();


// ================== 9. 当前页面内容编辑器 ==================
(function() {
    const STORAGE_KEY = 'jsnSiteContent';
    const editor = document.getElementById('contentEditor');
    const form = document.getElementById('contentForm');
    const status = document.getElementById('saveStatus');
    if (!editor || !form) return;

    const openEditor = () => {
        editor.classList.add('active');
        editor.setAttribute('aria-hidden', 'false');
        document.body.classList.add('editor-open');
    };
    const closeEditor = () => {
        editor.classList.remove('active');
        editor.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('editor-open');
    };
    document.getElementById('openEditor')?.addEventListener('click', openEditor);
    document.getElementById('closeEditor')?.addEventListener('click', closeEditor);
    editor.addEventListener('click', event => { if (event.target === editor) closeEditor(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && editor.classList.contains('active')) closeEditor(); });

    const readForm = () => Object.fromEntries(new FormData(form).entries());
    const fillForm = data => Object.entries(data || {}).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = value;
    });
    const showStatus = message => {
        status.textContent = message;
        window.clearTimeout(showStatus.timer);
        showStatus.timer = window.setTimeout(() => { status.textContent = ''; }, 3500);
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try { fillForm(JSON.parse(saved)); } catch (error) { console.warn('无法读取已保存内容', error); }
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readForm(), null, 2));
        showStatus('已保存到当前浏览器。关闭表单后刷新即可看到更新。');
    });

    document.getElementById('exportButton')?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(readForm(), null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'jsn-site-content.json';
        link.click();
        URL.revokeObjectURL(url);
        showStatus('内容文件已导出，请把它发给我上传。');
    });

    document.getElementById('resetButton')?.addEventListener('click', () => {
        if (!window.confirm('确定要恢复表单默认内容吗？')) return;
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    });
})();
