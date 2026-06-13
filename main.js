import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ==========================================================================
// 1. 初始化 Three.js 核心三要素
// ==========================================================================
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// 尺寸管理
const sizes = { width: window.innerWidth, height: window.innerHeight };

// 相机配置
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0.7, 0, 4.5);
scene.add(camera);
// ==========================================================================
// 🚀【相机 3D 位置配置面板】—— 在这里自由更改每个阶段的相机具体站位！
// ==========================================================================
const CAMERA_POSITIONS = {
  stage1: { x: -1.5, y: -1,  z: 4.5 },  // 首屏：配合你右移的标题，相机偏左(-1.5)拍摄，产品自然落在左侧
  stage2: { x: 3,  y: -2,  z: 3.5 },  // 阶段2：相机移动到右上角俯拍，展示产品侧面与材质
  stage3: { x: 0.0,  y: 0.0,  z: 2.0 },  // 阶段3：相机直接怼到正前方拉近镜头(Z缩短到2.0)，展示正面细节
  stage4: { x: -3.0, y: -0.5, z: 3.0 },  // 阶段4：相机绕到左下角进行极具张力的仰拍
  stage5: { x: 4,  y: -0.75, z: -1 },  // 阶段5：相机直接移动到正下方(Y为负值)，垂直仰拍产品的底部与背面
  stage6: { x: -1,  y: 0.0,  z: 5.0 }   // 阶段6：相机移到右侧，使产品在视觉上退到左边，为右侧卡片留白
};
// 渲染器配置// 渲染器配置

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1; // 🚀 从1.6微调到1.1，配合浅色背景，防止整体泛白

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ==========================================================================
// 2. 炫酷的工作室舞台灯光
// ==========================================================================
// ==========================================================================
// 2. 浅灰摄影棚专业布光（冷暖对比+强体积感）
// ==========================================================================
// 1. 环境光：提供基础的全局灰度照明
const ambientLight = new THREE.AmbientLight('#ffffff', 0.8); 
scene.add(ambientLight);

// 2. 主聚光灯（主导光）：从右上角打下，带有一点点暖调，负责主要的明暗面
const dirLight1 = new THREE.DirectionalLight('#fff8f0', 2.5); 
dirLight1.position.set(6, 10, 4);
dirLight1.castShadow = true;
dirLight1.shadow.mapSize.width = 2048;
dirLight1.shadow.mapSize.height = 2048;
dirLight1.shadow.camera.near = 0.5;
dirLight1.shadow.camera.far = 25;
dirLight1.shadow.bias = -0.0005; 
scene.add(dirLight1);

// 3. 辅光（填充光）：从左侧打入微弱的冷调光，填补暗部，拉开色彩层次
const dirLight2 = new THREE.DirectionalLight('#e0f2fe', 1.2); 
dirLight2.position.set(-6, 4, 2);
scene.add(dirLight2);

// 4. 轮廓光（背光）：从后方往前冲，把模型和灰色背景彻底“剥离”开，创造悬浮空灵感
const rimLight = new THREE.DirectionalLight('#ffffff', 2.0);
rimLight.position.set(0, 4, -8);
scene.add(rimLight);


//ground
// 创建隐形地面
const floorGeometry = new THREE.PlaneGeometry(30, 30);
// 🚀 将 opacity 调整为 0.15 左右。在浅色背景下，淡淡的灰色影子最高级
const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.15 }); 

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = - Math.PI / 2; 
floor.position.y = -1.6; // 稍微拉开一点模型与地面的距离，增加高空悬浮的空间感
floor.receiveShadow = true;       
scene.add(floor);
// ==========================================================================
// 🚀【高阶特效】：创建全景动态星空/微尘粒子系统
// ==========================================================================
const particlesCount = 1000; // 粒子数量，300个刚刚好，既高级又不会卡顿
const positions = new Float32Array(particlesCount * 3); // 存储300个点的X,Y,Z坐标

for (let i = 0; i < particlesCount * 3; i += 3) {
  // 让粒子随机散落在一个大立方体空间内
  positions[i]     = (Math.random() - 0.5) * 15; // X 轴范围
  positions[i + 1] = (Math.random() - 0.5) * 15; // Y 轴范围
  positions[i + 2] = (Math.random() - 0.5) * 15; // Z 轴范围
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// 粒子材质：使用高质感的圆形微光点
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,               // 粒子大小
  color: '#ffffff',         // 粒子颜色（纯白，在深色/灰色背景下有微光感）
  transparent: true,
  opacity: 0.4,             // 淡淡的半透明，不抢产品的风头
  blending: THREE.AdditiveBlending, // 核心：开启滤色混合，重叠的粒子会更亮，极具科技感
  depthWrite: false         // 防止粒子互相遮挡时出现黑边
});

// 组合成粒子系统并加入舞台
const particlePoints = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlePoints);


// ==========================================================================
// 3. 加载你的 GLTF 模型文件
// ==========================================================================
const loader = new GLTFLoader();
let modelGroup = new THREE.Group(); // 创建一个容器，方便我们在滚动时整体变换
scene.add(modelGroup);

loader.load(
  '/wine/scene.gltf', // 对应你 public/models/scene.gltf 路径
  (gltf) => {
    modelGroup.add(gltf.scene);
    
    // 【调试技巧】：如果模型太大、太小或角度不对，在这里解开注释进行初始化微调：
    gltf.scene.scale.setScalar(1); 
    gltf.scene.position.set(-1, -1.5, 0);
    gltf.scene.rotation.set(-0.5,0,0)
  },
  undefined,
  (error) => { console.error('模型加载失败：', error); }
);

// ==========================================================================
// 4. 监听网页原生滚动进度与桥接
// ==========================================================================
let scrollPercent = 0;      // 目标的滚动百分比 (0 ~ 1)
let currentScrollPos = 0;   // 当前缓动中的滚动百分比 (用于创造平滑运动)

window.addEventListener('scroll', () => {
  // 计算当前滚动条处于总长度的百分之多少
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollPercent = scrollTop / docHeight;

  // 动态联动 HTML 文字卡片的淡入淡出 (共 6 屏)
  const sections = document.querySelectorAll('.page-section');
  const activeIndex = Math.min(Math.floor(scrollPercent * 6), 5);
  
  sections.forEach((section, index) => {
    if (index === activeIndex) {
      section.style.opacity = '1';
    } else {
      section.style.opacity = '0';
    }
  });
});

// 监听窗口大小改变，保持 3D 不拉伸
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});
// ==========================================================================
// 🚀【终极震撼特效】：宏大时空穿梭/流星速度线系统
// ==========================================================================
const linesCount = 2000; // 速度线数量
const linePositions = [];
const colors = [];

const colorChoices = ['#ffffff', '#60a5fa', '#a78bfa']; // 纯白、科技蓝、极光紫交织，层次感拉满

for (let i = 0; i < linesCount; i++) {
  // 1. 在原点周围的巨大管道空间内随机生成线的“起点”
  const x = (Math.random() - 0.5) * 35;
  const y = (Math.random() - 0.5) * 35;
  const z = (Math.random() - 0.5) * 45; // 纵深拉长

  // 2. 核心震撼点：让线的“终点”在 Z 轴上延伸，人为制造“速度拖尾”的体积线拉伸感
  const lineLength = 0.5 + Math.random() * 1.5; // 每根流星线的长度随机
  
  // 起点坐标
  linePositions.push(x, y, z);
  // 终点坐标（向镜头方向拉伸）
  linePositions.push(x, y, z + lineLength);

  // 随机分配颜色
  const randomColor = new THREE.Color(colorChoices[Math.floor(Math.random() * colorChoices.length)]);
  colors.push(randomColor.r, randomColor.g, randomColor.b);
  colors.push(randomColor.r, randomColor.g, randomColor.b); // 终点和起点同色
}

const linesGeometry = new THREE.BufferGeometry();
linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// 使用线段材质，并激活顶点着色（vertexColors）
const linesMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.6, // 提升透明度，让线条清晰可见
  blending: THREE.AdditiveBlending, // 核心：重叠处爆亮，产生极光体积光效果
  linewidth: 2, // 部分浏览器生效
  depthWrite: false
});

// 使用 LineSegments (线段集合) 渲染，效率极高
const speedLines = new THREE.LineSegments(linesGeometry, linesMaterial);
scene.add(speedLines);


// ==========================================================================
// 5. 核心：每帧循环渲染与 6阶段动画状态机
// ==========================================================================
// ==========================================================================
// 5. 核心：每帧循环渲染与“零条件分支”全局平滑动画状态机
// ==========================================================================
const clock = new THREE.Clock();

// 新增：创建一个对象，用来存储每一帧计算出来的“理想目标状态”
const targetState = {
  x: 0,
  y: 0,
  z: 0,
  rotX: 0,
  rotY: 0,
  scale: 1
};

// 辅助数学工具：把进度 r 限制在 0 ~ 1 之间
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// 辅助数学工具：高阶连续线性映射（把全局进度无缝转化为局部权重）
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const p = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + p * (outMax - outMin);
};

// 初始化相机的理想目标坐标对象
const targetCamera = { x: CAMERA_POSITIONS.stage1.x, y: CAMERA_POSITIONS.stage1.y, z: CAMERA_POSITIONS.stage1.z };

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // 1. 滚动进度的一阶平滑缓动
  currentScrollPos += (scrollPercent - currentScrollPos) * 0.08;
  const r = currentScrollPos;
  const textWrapper = document.querySelector('#smooth-text-wrapper');
  if (textWrapper) {
    // 总滚动距离是 5 屏高度（从第1屏到第6屏移动了5个100vh），即 r * 500vh
    const targetTranslateY = -r * window.innerHeight * 5;
    textWrapper.style.transform = `translateY(${targetTranslateY}px)`;
  }

  if (modelGroup) {
    // 2. 保持产品模型在原点优雅的多维呼吸摆动（上下浮动 + 左右微摆 + Y轴微旋）
    modelGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.08;
    modelGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.04;
    modelGroup.rotation.z = Math.cos(elapsedTime * 0.6) * 0.03;
    
    // 确保模型主体和各个旋转角度归零，把舞台彻底让给相机运镜
    modelGroup.position.x = 0;
    modelGroup.position.z = 0;
    modelGroup.rotation.x = 0;

    // ==========================================================================
    // 🚀【无条件分支：连续相机运镜轨道映射】
    // ==========================================================================
    const s1 = CAMERA_POSITIONS.stage1;
    const s2 = CAMERA_POSITIONS.stage2;
    const s3 = CAMERA_POSITIONS.stage3;
    const s4 = CAMERA_POSITIONS.stage4;
    const s5 = CAMERA_POSITIONS.stage5;
    const s6 = CAMERA_POSITIONS.stage6;

    // 每一段区间（以 0.2 为步长），计算出相机在两点之间的绝对线性位移
    const x1to2 = mapRange(r, 0.0, 0.2, s1.x, s2.x);
    const x2to3 = mapRange(r, 0.2, 0.4, 0, s3.x - s2.x);
    const x3to4 = mapRange(r, 0.4, 0.6, 0, s4.x - s3.x);
    const x4to5 = mapRange(r, 0.6, 0.8, 0, s5.x - s4.x);
    const x5to6 = mapRange(r, 0.8, 1.0, 0, s6.x - s5.x);
    targetCamera.x = x1to2 + x2to3 + x3to4 + x4to5 + x5to6;

    const y1to2 = mapRange(r, 0.0, 0.2, s1.y, s2.y);
    const y2to3 = mapRange(r, 0.2, 0.4, 0, s3.y - s2.y);
    const y3to4 = mapRange(r, 0.4, 0.6, 0, s4.y - s3.y);
    const y2to5 = mapRange(r, 0.6, 0.8, 0, s5.y - s4.y);
    const y5to6 = mapRange(r, 0.8, 1.0, 0, s6.y - s5.y);
    targetCamera.y = y1to2 + y2to3 + y3to4 + y2to5 + y5to6;

    const z1to2 = mapRange(r, 0.0, 0.2, s1.z, s2.z);
    const z2to3 = mapRange(r, 0.2, 0.4, 0, s3.z - s2.z);
    const z3to4 = mapRange(r, 0.4, 0.6, 0, s4.z - s3.z);
    const z4to5 = mapRange(r, 0.6, 0.8, 0, s5.z - s4.z);
    const z5to6 = mapRange(r, 0.8, 1.0, 0, s6.z - s5.z);
    targetCamera.z = z1to2 + z2to3 + z3to4 + z4to5 + z5to6;

    // ==========================================================================
    // 🚀【二阶全局插值（Lerp）】：让相机丝滑飞往目标位置
    // ==========================================================================
    const cameraEase = 0.02; // 运镜缓冲系数，越小运镜越有电影高级重力感
    camera.position.x += (targetCamera.x - camera.position.x) * cameraEase;
    camera.position.y += (targetCamera.y - camera.position.y) * cameraEase;
    camera.position.z += (targetCamera.z - camera.position.z) * cameraEase;

    // 核心核心：不管相机怎么飞，命令相机永远死死盯住原点上的产品模型！
    // 这会自动帮我们计算相机的四元数旋转，彻底免去手动调相机角度的痛苦
    camera.lookAt(0, 0, 0);
  }
    // ==========================================================================
  // 🚀【粒子动态引擎】：自主呼吸浮动 + 滚动三维视差
  // ==========================================================================
  if (particlePoints) {
    // 1. 自主微弱自转：让粒子空间产生极其缓慢的整体星空旋转感
    particlePoints.rotation.y = elapsedTime * 0.02;
    particlePoints.rotation.x = Math.sin(elapsedTime * 0.1) * 0.02;

    // 2. 滚动视差（Parallax）：随着用户滚鼠标（r 从 0 到 1），粒子系统反向往上移动
    // 这会让用户觉得相机不仅在转，而且是在一个真实充满了物质的 3D 空间里穿梭
    particlePoints.position.y = r * 2.5; 
  }
    // ==========================================================================
  // 🚀【狂暴时空引擎】：自主前行 + 迎面飞掠视差
  // ==========================================================================
  if (speedLines) {
    // 1. 基础动态：让流星线在后台极慢地自我循环旋转，打破死板
    speedLines.rotation.z = elapsedTime * 0.01;

    // 2. 迎面飞掠震撼视差：
    // 随着用户向下滚动网页（r 增大），整个流星速度线系统顺着 Z 轴疯狂朝镜头冲过来！
    // 配合之前相机在各个 Stage 之间的轨道大运镜，会产生极其魔幻的“穿梭过星空流星雨”的错觉
    speedLines.position.z = r * 15.0; // 从 2.5 暴增到 15.0！飞掠幅度拉满

    // 3. 循环往复边界保护（可选调试）：如果用户滚得太快，线条超出视界，这里能保持空间的充盈感
    if(speedLines.position.z > 12) {
      speedLines.rotation.z += 0.05; // 增加一点扭曲感
    }
  }


  // 渲染新的一帧
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
// ==========================================================================
// 🚀【顶级导航交互引擎】—— 磁性飞掠胶囊与量子下划线涟漪
// ==========================================================================
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




// 假设你的跳转按钮有个类名叫 .to-gallery-btn
document.querySelectorAll('.to-gallery-btn, a[href="gallery.html"]').forEach(link => {
  link.addEventListener('click', function(e) {
      e.preventDefault(); // 拦截原生跳转
      const targetUrl = this.getAttribute('href');
      
      const fader = document.getElementById('page-fader');
      fader.classList.add('active'); // 1. 瞬间变全黑
      
      // 2. 等黑幕完全拉下（600ms）后，再真正执行网页跳转
      setTimeout(() => {
          window.location.href = targetUrl;
      }, 600);
  });
});
/* ==========================================================================
   GLOBAL TWO-WAY PAGE FADE-IN/OUT TRANSITION SYSTEM
   ========================================================================== */
   (function() {
    document.addEventListener("DOMContentLoaded", function() {
        const mzaTransitionOverlay = document.getElementById('mza-page-transition-overlay');
        
        // 健壮性校验：如果当前页面没加幕布，则不执行转场，防止 JS 崩溃
        if (!mzaTransitionOverlay) return;

        // 1. 页面进入（Fade In）：页面加载完毕后，黑色幕布自动淡出隐形
        requestAnimationFrame(() => {
            mzaTransitionOverlay.classList.add('mza-page-transition-hidden');
        });

        // 2. 页面离开（Fade Out）：监听两个页面中的所有导航栏按钮
        const navTransitionLinks = document.querySelectorAll('.nav-item');
        
        navTransitionLinks.forEach(linkNode => {
            linkNode.addEventListener('click', function(eventContext) {
                const targetHrefAttribute = this.getAttribute('href');
                
                // 核心过滤：只要点击的链接指向对方页面，就触发全黑渐变离场
                if (targetHrefAttribute && (targetHrefAttribute.includes('index.html') || targetHrefAttribute.includes('gallery.html'))) {
                    
                    eventContext.preventDefault(); // 阻止普通的瞬间切页
                    
                    // 重新锁定鼠标并拉上黑色幕布
                    mzaTransitionOverlay.style.pointerEvents = 'all';
                    mzaTransitionOverlay.classList.remove('mza-page-transition-hidden');

                    // 完美留出 0.6 秒的黑色转场动画时间，然后再执行真正的路由跳转
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
