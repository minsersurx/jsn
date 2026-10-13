

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
            if (data[`phone${country[0].toUpperCase()}${country.slice(1)}`]) {
                const phone = data[`phone${country[0].toUpperCase()}${country.slice(1)}`].replace(/\s/g, '');
                const link = document.querySelector(`[data-phone="${country}"]`);
                if (link) link.href = `tel:${phone}`;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', applySavedContent);
})();
