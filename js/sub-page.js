document.addEventListener('DOMContentLoaded', async () => {
    // 【功能 1：加载公共顶部和底部】
    try {
        const headerRes = await fetch('components/header.html');
        document.getElementById('header-container').innerHTML = await headerRes.text();

        const footerRes = await fetch('components/footer.html');
        document.getElementById('footer-container').innerHTML = await footerRes.text();
    } catch (error) {
        console.log("加载公共组件失败。");
    }

    // 【功能 2：自动识别上一篇和下一篇（完美兼容 Cloudflare 版）】
    const path = window.location.pathname;
    let cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    let filename = cleanPath.substring(cleanPath.lastIndexOf('/') + 1);
    
    if (!filename) return;

    // 匹配 xxx_数字.html 格式
    const match = filename.match(/^(.+_)(\d+)(\.html)?$/);
    
    if (match) {
        const prefix = match[1]; 
        const currentNum = parseInt(match[2], 10); 
        const ext = match[3] || ''; 

        const prevFileFetch = `${prefix}${currentNum - 1}.html`;
        const nextFileFetch = `${prefix}${currentNum + 1}.html`;
        const prevFileLink = `${prefix}${currentNum - 1}${ext}`;
        const nextFileLink = `${prefix}${currentNum + 1}${ext}`;

        const navContainer = document.getElementById('nav-container');
        if (!navContainer) return;

        let navHTML = '<div class="page-nav">';

        // 尝试获取上一篇
        if (currentNum > 1) { 
            try {
                const prevRes = await fetch(prevFileFetch);
                if (prevRes.ok) {
                    const text = await prevRes.text();
                    const titleMatch = text.match(/<title>(.*?)<\/title>/);
                    let title = titleMatch ? titleMatch[1] : '上一篇';
                    navHTML += `<a href="${prevFileLink}" class="nav-prev">← 上一篇：<span class="nav-title">${title}</span></a>`;
                } else {
                    navHTML += `<span class="nav-empty"></span>`; 
                }
            } catch (e) {
                navHTML += `<span class="nav-empty"></span>`;
            }
        } else {
            navHTML += `<span class="nav-empty"></span>`;
        }

        // 尝试获取下一篇
        try {
            const nextRes = await fetch(nextFileFetch);
            if (nextRes.ok) {
                const text = await nextRes.text();
                const titleMatch = text.match(/<title>(.*?)<\/title>/);
                let title = titleMatch ? titleMatch[1] : '下一篇';
                navHTML += `<a href="${nextFileLink}" class="nav-next">下一篇：<span class="nav-title">${title}</span> →</a>`;
            }
        } catch (e) {}

        navHTML += '</div>';
        navContainer.innerHTML = navHTML;
    }
});
