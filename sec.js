import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ==========================================================================
// 1. 初始化 Three.js 核心三要素
// ==========================================================================
const canvas = document.querySelector('#webg');
const scene = new THREE.Scene();
const navContainer = document.querySelector('.nav-links-container');
const navItems = document.querySelectorAll('.nav-item');
const activeCapsule = document.querySelector('.nav-active-capsule');

// 初始化：让胶囊在网页刚打开时，自动锁死在第一个默认激活的按钮（OVERVIEW）上
const initNavbar = () => {
  const defaultActive = document.querySelector('.nav-item.active');
  if (defaultActive && activeCapsule) {
    activeCapsule.style.left = `${defaultActive.offsetLeft}px`;
    activeCapsule.style.width = `${defaultActive.offsetWidth}px`;
  }
};

// 监听鼠标在整个导航栏上的“追踪掠过”事件
navItems.forEach(item => {
  // 当鼠标悬浮到某个按钮上时：胶囊吸附过去，并瞬间收缩/拉伸到匹配该文字的宽度！
  item.addEventListener('mouseenter', (e) => {
    // 排除最后的购买按钮，让其保持独立高档感
    if(e.target.classList.contains('buy-btn')) {
      activeCapsule.style.opacity = '0'; // 飞向购买按钮时隐形
      return;
    }
    activeCapsule.style.opacity = '1';
    activeCapsule.style.left = `${e.target.offsetLeft}px`;
    activeCapsule.style.width = `${e.target.offsetWidth}px`;
  });

  // 当点击某个导航时：触发复杂的量子下划线波纹扩散
  item.addEventListener('click', (e) => {
    // 1. 清除旧的激活态，赋予新激活态
    navItems.forEach(nav => nav.classList.remove('active'));
    e.target.classList.add('active');

    // 2. 炫酷的物理下划线波纹：通过快速添加/删除类名，触发 CSS 瞬间拉伸动画
    e.target.classList.add('ripple-trigger');
    setTimeout(() => {
      // 0.05秒后开启平滑淡出，创造一种光线向两边爆开然后蒸发的科技感
      e.target.style.transition = 'all 0.5s ease';
      e.target.classList.remove('ripple-trigger');
      // 恢复干净的初始状态
      setTimeout(() => { e.target.style.transition = ''; }, 500);
    }, 50);
  });
});

// 当鼠标彻底离开导航栏容器时：胶囊顺滑地“回弹”到当前真正被激活的那个按钮上
navContainer.addEventListener('mouseleave', () => {
  const currentActive = document.querySelector('.nav-item.active');
  if (currentActive) {
    activeCapsule.style.opacity = '1';
    activeCapsule.style.left = `${currentActive.offsetLeft}px`;
    activeCapsule.style.width = `${currentActive.offsetWidth}px`;
  }
});

// 在页面资产加载完后，执行初始化卡位
window.addEventListener('DOMContentLoaded', initNavbar);
// 兜底执行一次，确保万无一失
setTimeout(initNavbar, 500);

class MzaCarousel {
    constructor(root, opts = {}) {
      this.root = root;
      this.viewport = root.querySelector(".mzaCarousel-viewport");
      this.track = root.querySelector(".mzaCarousel-track");
      this.slides = Array.from(root.querySelectorAll(".mzaCarousel-slide"));
      this.prevBtn = root.querySelector(".mzaCarousel-prev");
      this.nextBtn = root.querySelector(".mzaCarousel-next");
      this.pagination = root.querySelector(".mzaCarousel-pagination");
      this.progressBar = root.querySelector(".mzaCarousel-progressBar");
      this.isFF = typeof InstallTrigger !== "undefined";
      this.n = this.slides.length;
      this.state = {
        index: 0,
        pos: 0,
        width: 0,
        height: 0,
        gap: 28,
        dragging: false,
        pointerId: null,
        x0: 0,
        v: 0,
        t0: 0,
        animating: false,
        hovering: false,
        startTime: 0,
        pausedAt: 0,
        rafId: 0
      };
      this.opts = Object.assign(
        {
          gap: 28,
          peek: 0.15,
          rotateY: 34,
          zDepth: 150,
          scaleDrop: 0.09,
          blurMax: 2.0,
          activeLeftBias: 0.12,
          interval: 4500,
          transitionMs: 900,
          keyboard: true,
          breakpoints: [
            {
              mq: "(max-width: 1200px)",
              gap: 24,
              peek: 0.12,
              rotateY: 28,
              zDepth: 120,
              scaleDrop: 0.08,
              activeLeftBias: 0.1
            },
            {
              mq: "(max-width: 1000px)",
              gap: 18,
              peek: 0.09,
              rotateY: 22,
              zDepth: 90,
              scaleDrop: 0.07,
              activeLeftBias: 0.09
            },
            {
              mq: "(max-width: 768px)",
              gap: 14,
              peek: 0.06,
              rotateY: 16,
              zDepth: 70,
              scaleDrop: 0.06,
              activeLeftBias: 0.08
            },
            {
              mq: "(max-width: 560px)",
              gap: 12,
              peek: 0.05,
              rotateY: 12,
              zDepth: 60,
              scaleDrop: 0.05,
              activeLeftBias: 0.07
            }
          ]
        },
        opts
      );
      if (this.isFF) {
        this.opts.rotateY = 10;
        this.opts.zDepth = 0;
        this.opts.blurMax = 0;
      }
      this._init();
    }
    _init() {
      this._setupDots();
      this._bind();
      this._measure();
      this.goTo(0, false);
      
      // 💡 1. 刚进画廊页面，让幕布强制保持全黑状态
      const fader = document.getElementById('page-fader');
      if (fader) fader.classList.add('active');
  
      // 💡 2. 执行疯狂的图片后台并发加载，并在加载完后拉开黑幕 [INDEX]
      this._preloadImagesWithCallback(() => {
          // 当所有图片在黑屏下加载、解码完毕后执行
          setTimeout(() => {
              if (fader) fader.classList.remove('active'); // 3. 黑幕丝滑淡出，露出已经完美就绪的画廊
              this._startCycle();
              this._loop();
          }, 150); // 微调的平滑缓冲
      });
  }
  
  // 💡 替换原本的 _preloadImages 方法，加入完整的计数器回调逻辑 [INDEX]
  _preloadImagesWithCallback(callback) {
      let loadedCount = 0;
      const totalImages = this.slides.length;
      
      // 安全降级：如果没图片，直接拉开黑幕
      if (totalImages === 0) {
          callback();
          return;
      }
  
      // 设置一个防死锁定时器：如果某些网络图挂了，最多在黑屏里等 2.5 秒就强行开幕 [INDEX]
      const fallbackTimeout = setTimeout(() => {
          callback();
      }, 2500);
  
      this.slides.forEach((sl) => {
          const card = sl.querySelector(".mzaCard");
          const bg = getComputedStyle(card).getPropertyValue("--mzaCard-bg");
          const m = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(bg);
          
          if (m && m[1]) {
              const img = new Image();
              // 当图片被下载并成功在后台解码时触发
              img.onload = img.onerror = () => {
                  loadedCount++;
                  // 💡 当 7 张图片全部在黑屏后台加载成功后 [INDEX]
                  if (loadedCount === totalImages) {
                      clearTimeout(fallbackTimeout); // 清除防死锁定时器
                      callback(); // 触发开幕回调
                  }
              };
              img.src = m[1].trim(); 
          } else {
              // 如果某张卡片没配背景图，直接算作加载完成
              loadedCount++;
              if (loadedCount === totalImages) {
                  clearTimeout(fallbackTimeout);
                  callback();
              }
          }
      });
  }
  
    _setupDots() {
      this.pagination.innerHTML = "";
      this.dots = this.slides.map((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "mzaCarousel-dot";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => {
          this.goTo(i);
        });
        this.pagination.appendChild(b);
        return b;
      });
    }
    _bind() {
      this.prevBtn.addEventListener("click", () => {
        this.prev();
      });
      this.nextBtn.addEventListener("click", () => {
        this.next();
      });
      if (this.opts.keyboard) {
        this.root.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") this.prev();
          if (e.key === "ArrowRight") this.next();
        });
      }
      const pe = this.viewport;
      pe.addEventListener("pointerdown", (e) => this._onDragStart(e));
      pe.addEventListener("pointermove", (e) => this._onDragMove(e));
      pe.addEventListener("pointerup", (e) => this._onDragEnd(e));
      pe.addEventListener("pointercancel", (e) => this._onDragEnd(e));
      this.root.addEventListener("mouseenter", () => {
        this.state.hovering = true;
        this.state.pausedAt = performance.now();
      });
      this.root.addEventListener("mouseleave", () => {
        if (this.state.pausedAt) {
          this.state.startTime += performance.now() - this.state.pausedAt;
          this.state.pausedAt = 0;
        }
        this.state.hovering = false;
      });
      this.ro = new ResizeObserver(() => this._measure());
      this.ro.observe(this.viewport);
      this.opts.breakpoints.forEach((bp) => {
        const m = window.matchMedia(bp.mq);
        const apply = () => {
          Object.keys(bp).forEach((k) => {
            if (k !== "mq") this.opts[k] = bp[k];
          });
          this._measure();
          this._render();
        };
        if (m.addEventListener) m.addEventListener("change", apply);
        else m.addListener(apply);
        if (m.matches) apply();
      });
      this.viewport.addEventListener("pointermove", (e) => this._onTilt(e));
      window.addEventListener("orientationchange", () =>
        setTimeout(() => this._measure(), 250)
      );
    }
    _measure() {
      const viewRect = this.viewport.getBoundingClientRect();
      const rootRect = this.root.getBoundingClientRect();
      const pagRect = this.pagination.getBoundingClientRect();
      const bottomGap = Math.max(
        12,
        Math.round(rootRect.bottom - pagRect.bottom)
      );
      const pagSpace = pagRect.height + bottomGap;
      const availH = viewRect.height - pagSpace;
      const cardH = Math.max(320, Math.min(640, Math.round(availH)));
      this.state.width = viewRect.width;
      this.state.height = viewRect.height;
      this.state.gap = this.opts.gap;
      this.slideW = Math.min(880, this.state.width * (1 - this.opts.peek * 2));
      this.root.style.setProperty("--mzaPagH", `${pagSpace}px`);
      this.root.style.setProperty("--mzaCardH", `${cardH}px`);
    }
    _onTilt(e) {
      const r = this.viewport.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      this.root.style.setProperty("--mzaTiltX", (my * -6).toFixed(3));
      this.root.style.setProperty("--mzaTiltY", (mx * 6).toFixed(3));
    }
    _onDragStart(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      this.state.dragging = true;
      this.state.pointerId = e.pointerId;
      this.viewport.setPointerCapture(e.pointerId);
      this.state.x0 = e.clientX;
      this.state.t0 = performance.now();
      this.state.v = 0;
      this.state.pausedAt = performance.now();
    }
    _onDragMove(e) {
      if (!this.state.dragging || e.pointerId !== this.state.pointerId) return;
      const dx = e.clientX - this.state.x0;
      const dt = Math.max(16, performance.now() - this.state.t0);
      this.state.v = dx / dt;
      const slideSpan = this.slideW + this.state.gap;
      this.state.pos = this._mod(this.state.index - dx / slideSpan, this.n);
      this._render();
    }
    _onDragEnd(e) {
      if (!this.state.dragging || (e && e.pointerId !== this.state.pointerId))
        return;
      this.state.dragging = false;
      try {
        if (this.state.pointerId != null)
          this.viewport.releasePointerCapture(this.state.pointerId);
      } catch {}
      this.state.pointerId = null;
      if (this.state.pausedAt) {
        this.state.startTime += performance.now() - this.state.pausedAt;
        this.state.pausedAt = 0;
      }
      const v = this.state.v;
      const threshold = 0.18;
      let target = Math.round(
        this.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0)
      );
      this.goTo(this._mod(target, this.n));
    }
    _startCycle() {
      this.state.startTime = performance.now();
      this._renderProgress(0);
    }
    _loop() {
      const step = (t) => {
        if (
          !this.state.dragging &&
          !this.state.hovering &&
          !this.state.animating
        ) {
          const elapsed = t - this.state.startTime;
          const p = Math.min(1, elapsed / this.opts.interval);
          this._renderProgress(p);
          if (elapsed >= this.opts.interval) this.next();
        }
        this.state.rafId = requestAnimationFrame(step);
      };
      this.state.rafId = requestAnimationFrame(step);
    }
    _renderProgress(p) {
      this.progressBar.style.transform = `scaleX(${p})`;
    }
    prev() {
      this.goTo(this._mod(this.state.index - 1, this.n));
    }
    next() {
      this.goTo(this._mod(this.state.index + 1, this.n));
    }
    goTo(i, animate = true) {
      const start = this.state.pos || this.state.index;
      const end = this._nearest(start, i);
      const dur = animate ? this.opts.transitionMs : 0;
      const t0 = performance.now();
      const ease = (x) => 1 - Math.pow(1 - x, 4);
      this.state.animating = true;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const p = dur ? ease(t) : 1;
        this.state.pos = start + (end - start) * p;
        this._render();
        if (t < 1) requestAnimationFrame(step);
        else this._afterSnap(i);
      };
      requestAnimationFrame(step);
    }
    _afterSnap(i) {
      this.state.index = this._mod(Math.round(this.state.pos), this.n);
      this.state.pos = this.state.index;
      this.state.animating = false;
      this._render(true);
      this._startCycle();
    }
    _nearest(from, target) {
      let d = target - Math.round(from);
      if (d > this.n / 2) d -= this.n;
      if (d < -this.n / 2) d += this.n;
      return Math.round(from) + d;
    }
    _mod(i, n) {
      return ((i % n) + n) % n;
    }
    _render(markActive = false) {
      const span = this.slideW + this.state.gap;
      const tiltX = parseFloat(
        this.root.style.getPropertyValue("--mzaTiltX") || 0
      );
      const tiltY = parseFloat(
        this.root.style.getPropertyValue("--mzaTiltY") || 0
      );
      for (let i = 0; i < this.n; i++) {
        let d = i - this.state.pos;
        if (d > this.n / 2) d -= this.n;
        if (d < -this.n / 2) d += this.n;
        const weight = Math.max(0, 1 - Math.abs(d) * 2);
        const biasActive = -this.slideW * this.opts.activeLeftBias * weight;
        const tx = d * span + biasActive;
        const depth = -Math.abs(d) * this.opts.zDepth;
        const rot = -d * this.opts.rotateY;
        const scale = 1 - Math.min(Math.abs(d) * this.opts.scaleDrop, 0.42);
        const blur = Math.min(Math.abs(d) * this.opts.blurMax, this.opts.blurMax);
        const z = Math.round(1000 - Math.abs(d) * 10);
        const s = this.slides[i];
        // 找到 main.js 大约倒数第 35 行左右的 _render 方法内部：
if (this.isFF) {
    s.style.transform = `translate3d(${tx}px,-50%,0px) scale(${scale})`;
    s.style.filter = "none";
} else {
    // 💡 将原本的 s.style.filter = `blur(${blur}px)`; 修改为 "none"
    s.style.transform = `translate3d(${tx}px,-50%,${depth}px) rotateY(${rot}deg) scale(${scale})`;
    s.style.filter = "none"; /* 👈 彻底关闭侧边模糊，秒变丝滑，绝不闪黑 */
}

        s.style.zIndex = z;
        if (markActive)
          s.dataset.state =
            Math.round(this.state.index) === i ? "active" : "rest";
        const card = s.querySelector(".mzaCard");
        const parBase = Math.max(-1, Math.min(1, -d));
        const parX = parBase * 48 + tiltY * 2.0;
        const parY = tiltX * -1.5;
        const bgX = parBase * -64 + tiltY * -2.4;
        card.style.setProperty("--mzaParX", `${parX.toFixed(2)}px`);
        card.style.setProperty("--mzaParY", `${parY.toFixed(2)}px`);
        card.style.setProperty("--mzaParBgX", `${bgX.toFixed(2)}px`);
        card.style.setProperty("--mzaParBgY", `${(parY * 0.35).toFixed(2)}px`);
      }
      const active = this._mod(Math.round(this.state.pos), this.n);
      this.dots.forEach((d, i) =>
        d.setAttribute("aria-selected", i === active ? "true" : "false")
      );
    }
  }
  const mza = new MzaCarousel(document.getElementById("mzaCarousel"), {
    transitionMs: 900
  });
  /* ==========================================================================
   PARALLEL IMAGE PRELOADER & FADE IN CONTROLLER
   ========================================================================== */
(function() {
  document.addEventListener("DOMContentLoaded", function() {
      const overlayNode = document.getElementById('gls-transition-overlay');
      const mzaCardElements = document.querySelectorAll('.mzaCard');
      
      if (!overlayNode || mzaCardElements.length === 0) return;

      let loadedImagesCount = 0;
      const totalImagesCount = mzaCardElements.length;
      
      // 1. 设置一个安全兜底定时器（防止万一图床服务器波动，导致页面死黑）
      const safetyTimeoutId = setTimeout(() => {
          revealGalleryStage();
      }, 2500); // 即使图片没加载完，2.5秒后也强行淡入画廊

      function revealGalleryStage() {
          clearTimeout(safetyTimeoutId);
          // 💡 移除显示类名，触发 CSS 中的 opacity 淡出效果（Fade Out 黑色 ➔ Fade In 画廊）
          overlayNode.classList.remove('gls-gal-v1__body-override-wrapper', 'gls-transition-overlay--visible');
      }

      // 2. 精准监听后台网络图片的真机并行解码
      mzaCardElements.forEach((cardComponent) => {
          const backgroundStyleStr = getComputedStyle(cardComponent).getPropertyValue("--mzaCard-bg");
          const urlRegexResult = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(backgroundStyleStr);
          
          if (urlRegexResult && urlRegexResult[1]) {
              const hiddenPreloadWorker = new Image();
              hiddenPreloadWorker.src = urlRegexResult[1].trim();
              
              // 网页图片加载成功或失败，均计入计数器
              hiddenPreloadWorker.onload = hiddenPreloadWorker.onerror = function() {
                  loadedImagesCount++;
                  // 当且仅当所有网络大图在黑色幕布后面完美就绪时，拉开帷幕
                  if (loadedImagesCount >= totalImagesCount) {
                      // 稍微延迟 100ms 确保浏览器显卡完全吞下位图数据
                      setTimeout(revealGalleryStage, 100); 
                  }
              };
          } else {
              totalImagesCount--; // 异常节点不阻塞加载
          }
      });
  });
})();
/* ==========================================================================
   GLOBAL TWO-WAY PAGE FADE-IN/OUT TRANSITION SYSTEM
   ========================================================================== */
   (function() {
    document.addEventListener("DOMContentLoaded", function() {
        const mzaTransitionOverlay = document.getElementById('mza-page-transition-overlay');
        if (!mzaTransitionOverlay) return;

        // 1. 页面进入（Fade In）：当 DOM 渲染完毕，幕布在后台图片异步加载的同时，悄悄化开变为透明
        requestAnimationFrame(() => {
            mzaTransitionOverlay.classList.add('mza-page-transition-hidden');
        });

        // 2. 页面离开（Fade Out）：监听导航栏的跳转按钮，实现平滑离场
        const navTransitionLinks = document.querySelectorAll('.nav-item');
        
        navTransitionLinks.forEach(linkNode => {
            linkNode.addEventListener('click', function(eventContext) {
                const targetHrefAttribute = this.getAttribute('href');
                
                // 核心安全校验：只有在 index.html 和 gallery.html 之间切换时，才触发这个黑色渐变
                if (targetHrefAttribute && (targetHrefAttribute.includes('index.html') || targetHrefAttribute.includes('gallery.html'))) {
                    // 阻止普通的瞬间跳转
                    eventContext.preventDefault(); 
                    
                    // 锁死鼠标点击事件，拉上黑色幕布
                    mzaTransitionOverlay.style.pointerEvents = 'all';
                    mzaTransitionOverlay.classList.remove('mza-page-transition-hidden');

                    // 等待 0.6 秒（与 CSS 动画时长严格同步），让黑屏淡入完成、图片后台加载就绪后，再执行跳转
                    setTimeout(function() {
                        window.location.href = targetHrefAttribute;
                    }, 600);
                }
            });
        });
    });
})();
/* ==========================================================================
   UNIVERSAL AUTOMATIC PAGE TRANSITION ENGINE (FADE IN/OUT ALL HTML)
   ========================================================================== */
   (function() {
    document.addEventListener("DOMContentLoaded", function() {
        const mzaTransitionOverlay = document.getElementById('mza-page-transition-overlay');
        if (!mzaTransitionOverlay) return;

        // 【核心阶段一】所有 HTML 页面一打开：自动执行全局从黑变透明 (Fade Out the black mask)
        requestAnimationFrame(() => {
            mzaTransitionOverlay.classList.add('mza-page-transition-hidden');
        });

        // 【核心阶段二】智能监听网页中“所有”可能去往其他 HTML 的链接 (Fade In the black mask before routing)
        document.body.addEventListener('click', function(eventContext) {
            // 向上寻找最近的 <a> 标签，确保能抓到带嵌套结构的导航项
            const anchorElement = eventContext.target.closest('a');
            if (!anchorElement) return;

            const targetHref = anchorElement.getAttribute('href');

            // 💡 智能过滤：排除空链接、页内描点跳转(#design等)、外部绝对链接(http等)、JavaScript伪协议
            if (
                !targetHref || 
                targetHref.startsWith('#') || 
                targetHref.startsWith('javascript:') || 
                targetHref.startsWith('mailto:') || 
                targetHref.startsWith('tel:') ||
                targetHref.includes('://') // 排除去往外部网的高风险链接
            ) {
                return; // 遇到以上这些不需要全黑转场的情形，直接跳过，不作拦截
            }

            // 满足内部网页跳转条件（比如去其他任何 .html），开启完美转场
            eventContext.preventDefault(); // 强行拦截默认的瞬间切页

            // 重新拉上黑色大幕 (Fade In)
            mzaTransitionOverlay.style.pointerEvents = 'all';
            mzaTransitionOverlay.classList.remove('mza-page-transition-hidden');

            // 严格留出 0.6 秒给黑色渐变动画执行，时间一到立刻平滑放行前往新页面
            setTimeout(function() {
                window.location.href = targetHref;
            }, 600);
        });
    });
})();
