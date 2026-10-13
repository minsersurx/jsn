const STORAGE_KEY = 'jsnSiteContent';
const form = document.getElementById('contentForm');
const status = document.getElementById('saveStatus');

function readForm() {
    return Object.fromEntries(new FormData(form).entries());
}

function fillForm(data) {
    Object.entries(data || {}).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = value;
    });
}

function showStatus(message) {
    status.textContent = message;
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(() => { status.textContent = ''; }, 3500);
}

const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    try { fillForm(JSON.parse(saved)); } catch (error) { console.warn('无法读取已保存内容', error); }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readForm(), null, 2));
    showStatus('已保存到当前浏览器。打开网页即可看到更新。');
});

document.getElementById('exportButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(readForm(), null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jsn-site-content.json';
    link.click();
    URL.revokeObjectURL(url);
    showStatus('内容文件已导出，请把它发给我上传。');
});

document.getElementById('resetButton').addEventListener('click', () => {
    if (!window.confirm('确定要恢复表单默认内容吗？')) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
});
