// ================== 1. 启动屏进度条与礼花同步逻辑 ==================
window.addEventListener("load", () => {
  const intro = document.getElementById("introScreen");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const birthdayMsg = document.getElementById("birthdayMessage");
  const wrapper = document.querySelector(".progress-wrapper");

  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      setTimeout(() => {
        // 1. 隐藏进度条
        wrapper.style.display = "none";

        // 2. 🚀 礼花同步爆发！
        fireConfetti();

        // 3. 生日文字伴随淡入
        birthdayMsg.style.display = "block";
        void birthdayMsg.offsetWidth;
        birthdayMsg.classList.add("show");

        // 4. 欣赏 2.5 秒后，彻底隐藏加载屏
        setTimeout(() => {
          intro.classList.add("hidden");
        }, 2500);
      }, 300);
    }

    progressBar.style.width = progress + "%";
    progressText.innerText = Math.floor(progress) + "%";
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
      colors: ["#6aa5e3", "#4a8cdb", "#FFD700", "#FF69B4", "#ffffff"],
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// ================== 3. 封面滑动与基础动效 ==================
const cover = document.getElementById("cover");
let isCovered = true;
let isAnimating = false;

function hideCover() {
  if (!isCovered || isAnimating) return;
  isAnimating = true;
  window.scrollTo(0, 0);
  cover.classList.add("slide-up");
  setTimeout(() => {
    document.body.classList.add("unlocked");
    isCovered = false;
    isAnimating = false;
  }, 800);
}

function showCover() {
  if (isCovered || isAnimating) return;
  isAnimating = true;
  document.body.classList.remove("unlocked");
  window.scrollTo(0, 0);
  cover.classList.remove("slide-up");
  setTimeout(() => {
    isCovered = true;
    isAnimating = false;
  }, 800);
}

document.getElementById("scrollArrow").addEventListener("click", hideCover);

window.addEventListener(
  "wheel",
  (e) => {
    if (document.body.classList.contains("modal-open")) return;
    const chat = document.getElementById("chatModal");
    if (chat && !chat.classList.contains("hidden")) return;

    if (isCovered && e.deltaY > 0) hideCover();
    else if (!isCovered && e.deltaY < 0 && window.scrollY <= 0) showCover();
  },
  { passive: false }
);

let startY = 0;
window.addEventListener(
  "touchstart",
  (e) => {
    startY = e.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (document.body.classList.contains("modal-open")) return;
    const chat = document.getElementById("chatModal");
    if (chat && !chat.classList.contains("hidden")) return;

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
  },
  { passive: false }
);

// ================== 4. 时间轴渐显 ==================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.2 }
);
document
  .querySelectorAll(".timeline-item, .reveal, .photo-item")
  .forEach((el) => observer.observe(el));

// ================== 5. 照片弹窗 ==================
const photoModal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const modalStory = document.getElementById("modalStory");

document.querySelectorAll(".photo-item").forEach((item) => {
  item.addEventListener("click", () => {
    modalImg.src = item.querySelector("img").src;
    modalStory.innerHTML = item.querySelector(".expanded-story").innerHTML;
    void photoModal.offsetWidth;
    photoModal.classList.add("active");
    document.body.classList.add("modal-open");
  });
});

const bg = document.querySelector(".photo-modal-bg");
if (bg) {
  bg.addEventListener("click", () => {
    photoModal.classList.remove("active");
    setTimeout(() => document.body.classList.remove("modal-open"), 400);
  });
}

// ================== 6. 点击爱心/星光特效 ==================
const CLICK_FX = ["✨", "⭐", "🌟"];
function spawnClickHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "click-heart";
  heart.textContent = CLICK_FX[Math.floor(Math.random() * CLICK_FX.length)];
  heart.style.left = x + "px";
  heart.style.top = y + "px";
  heart.style.setProperty("--tx", Math.round(Math.random() * 60 - 30) + "px");
  document.body.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove());
}
document.addEventListener("click", (e) =>
  spawnClickHeart(e.clientX, e.clientY)
);