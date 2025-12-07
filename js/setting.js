// 设置页面专用JavaScript
let currentTheme = null;



// 初始化设置页面
document.addEventListener('DOMContentLoaded', function() {
    console.log('设置页面加载完成');
    setupMobileMenu();
    setupNavigationLinks();
    renderThemePresets();
    setupCursorSettings();
    
    // 延迟加载保存的主题，确保DOM完全渲染
    setTimeout(() => {
        loadSavedTheme();
    }, 100);
});

// 设置导航链接
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.replaceWith(link.cloneNode(true));
    });
    
    const freshNavLinks = document.querySelectorAll('.nav-link');
    freshNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('导航链接被点击:', this.href);
            window.location.href = this.href;
        });
    });
}

// 加载保存的主题
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('chuangyi-theme');
    if (savedTheme) {
        try {
            currentTheme = JSON.parse(savedTheme);
            // 如果是自定义主题，则使用默认主题
            if (currentTheme.id === 'custom') {
                currentTheme = themePresets[0];
            }
            applyTheme(currentTheme);
            
            // 更新预设主题的active状态
            document.querySelectorAll('.theme-preset').forEach((el, index) => {
                if (themePresets[index].id === currentTheme.id) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('加载保存的主题失败:', error);
            currentTheme = themePresets[0]; // 默认使用粉白渐变
        }
    } else {
        currentTheme = themePresets[0]; // 默认使用粉白渐变
    }
}

// 渲染预设主题
function renderThemePresets() {
    const presetsContainer = document.getElementById('themePresets');
    if (!presetsContainer) return;
    
    presetsContainer.innerHTML = '';
    
    themePresets.forEach(preset => {
        const presetElement = createPresetElement(preset);
        presetsContainer.appendChild(presetElement);
    });
}

// 创建预设主题元素
function createPresetElement(preset) {
    const div = document.createElement('div');
    div.className = 'theme-preset';
    if (currentTheme && currentTheme.id === preset.id) {
        div.classList.add('active');
    }
    
    div.innerHTML = `
        <div class="theme-preview">
            <div class="theme-color" style="background: ${preset.primary}"></div>
            <div class="theme-color" style="background: ${preset.secondary}"></div>
            <div class="theme-color" style="background: ${preset.background}"></div>
        </div>
        <div class="theme-name">${preset.name}</div>
        <div class="theme-description">${preset.description}</div>
    `;
    
    div.addEventListener('click', function() {
        selectPreset(preset);
    });
    
    return div;
}

// 选择预设主题
function selectPreset(preset) {
    // 移除所有active类
    document.querySelectorAll('.theme-preset').forEach(el => {
        el.classList.remove('active');
    });
    
    // 添加active类到当前选中的预设
    event.currentTarget.classList.add('active');
    
    // 应用主题
    currentTheme = { ...preset };
    applyTheme(currentTheme);
    
    // 保存主题
    saveTheme(currentTheme);
    
    showNotification(`已切换到${preset.name}主题`, 'success');
}



// 应用主题
function applyTheme(theme) {
    console.log('应用主题:', theme);
    
    // 设置CSS变量
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--text-color', theme.text);
    root.style.setProperty('--background-color', theme.background);
    
    // 创建动态样式
    let dynamicStyle = document.getElementById('dynamic-theme-style');
    if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'dynamic-theme-style';
        document.head.appendChild(dynamicStyle);
    }
    
    // 生成主题CSS
    const themeCSS = `
        :root {
            --primary-color: ${theme.primary};
            --secondary-color: ${theme.secondary};
            --text-color: ${theme.text};
            --background-color: ${theme.background};
            --theme-gradient: linear-gradient(45deg, ${theme.primary}, ${theme.secondary});
        }
        
        body, html, .main, .background-animation {
            background-color: ${theme.background} !important;
            background: ${theme.background} !important;
            background-image: none !important;
        }
        
        .header {
            background: ${theme.background} !important;
            backdrop-filter: blur(10px);
        }
        
        .logo h1 {
            color: ${theme.text} !important;
        }
        
        .nav-link {
            color: ${theme.text} !important;
        }
        
        .nav-link:hover, .nav-link.active {
            color: ${theme.primary} !important;
        }
        
        .nav-link.active::after,
        .nav-link:hover::after {
            background: ${theme.primary} !important;
        }
        
        .hero {
            background: linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}11) !important;
        }
        
        .hero-title,
        .hero-subtitle {
            color: ${theme.text} !important;
        }
        
        .gradient-text {
            background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }
        
        .settings-header h1,
        .settings-card h3,
        .theme-name,
        .color-input-group label {
            color: ${theme.text} !important;
        }
        
        .btn-primary {
            background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}) !important;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${theme.primary}66 !important;
        }
        
        .btn-secondary {
            background: ${theme.background} !important;
            border: 1px solid ${theme.primary}33 !important;
            color: ${theme.text} !important;
        }
        
        .btn-secondary:hover {
            background: ${theme.primary}22 !important;
            transform: translateY(-2px);
        }
        
        .theme-preset.active {
            border-color: ${theme.primary} !important;
        }
        
        .theme-preset:hover {
            border-color: ${theme.primary} !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }
        
        .settings-card {
            background: ${theme.background === '#121212' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important;
            border: 1px solid ${theme.primary}33 !important;
        }
        
        .theme-preset.active::after {
            background: ${theme.primary} !important;
        }
        
        .color-input:hover {
            border-color: ${theme.primary} !important;
            transform: scale(1.05);
        }
        
        .settings-info {
            background: ${theme.primary}22 !important;
            border-left: 4px solid ${theme.primary} !important;
        }
        
        .settings-info p {
            color: ${theme.text} !important;
        }
        
        .footer {
            background: ${theme.background} !important;
        }
        
        .footer-section h4,
        .footer-section p,
        .footer-section li a {
            color: ${theme.text} !important;
        }
        
        /* 强制覆盖所有可能的样式 */
        * .settings-header h1,
        * .settings-card h3,
        * .theme-name,
        * .color-input-group label {
            color: ${theme.text} !important;
        }
        
        * .btn-primary {
            background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}) !important;
        }
        
        * .btn-secondary {
            color: ${theme.text} !important;
        }
        
        * .nav-link.active::after {
            background: ${theme.primary} !important;
        }
        
        * .hero {
            background: linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}11) !important;
        }
        
        * .gradient-text {
            background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
        }
        
        /* SVG图标颜色 */
        .logo i,
        .settings-card h3 i,
        .color-input-group label i,
        .settings-info i {
            color: ${theme.text} !important;
        }
        
        .logo i:hover,
        .settings-card h3 i:hover {
            color: ${theme.primary} !important;
        }
        
        /* 内联SVG样式 */
        svg {
            fill: ${theme.text} !important;
        }
        
        svg:hover {
            fill: ${theme.primary} !important;
        }
    `;
    
    dynamicStyle.textContent = themeCSS;
    
    // 直接强制更新关键元素
    const logo = document.querySelector('.logo h1');
    if (logo) logo.style.color = theme.text;
    
    const resetButton = document.querySelector('.btn-secondary');
    if (resetButton) resetButton.style.color = theme.text;
    
    const allHeaders = document.querySelectorAll('.settings-header h1, .settings-card h3');
    allHeaders.forEach(el => el.style.color = theme.text);
    
    const allLabels = document.querySelectorAll('.theme-name, .color-input-group label');
    allLabels.forEach(el => el.style.color = theme.text);
    
    const allPrimaryBtns = document.querySelectorAll('.btn-primary');
    allPrimaryBtns.forEach(el => {
        el.style.background = `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`;
    });
    
    const allSecondaryBtns = document.querySelectorAll('.btn-secondary');
    allSecondaryBtns.forEach(el => {
        el.style.color = theme.text;
        el.style.background = theme.background;
        el.style.border = `1px solid ${theme.primary}33`;
    });
    
    // 更新导航栏下划线 - 移除旧的样式并添加新的
    const oldNavStyles = document.querySelectorAll('style[data-nav-theme]');
    oldNavStyles.forEach(style => style.remove());
    
    // 创建新的导航栏样式
    const navStyle = document.createElement('style');
    navStyle.setAttribute('data-nav-theme', 'true');
    navStyle.textContent = `
        .nav-link.active::after {
            background: ${theme.primary} !important;
        }
        .nav-link:hover::after {
            background: ${theme.primary} !important;
        }
    `;
    document.head.appendChild(navStyle);
    
    // 更新hero区域
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.style.background = `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}11)`;
        heroSection.style.setProperty('background', `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}11)`, 'important');
    }
    
    // 更新所有背景元素
    const backgroundElements = document.querySelectorAll('.background-animation, .main, body, html');
    backgroundElements.forEach(el => {
        el.style.backgroundColor = theme.background;
        el.style.setProperty('background-color', theme.background, 'important');
    });
    
    // 强制设置body背景
    document.body.style.backgroundColor = theme.background;
    document.body.style.setProperty('background-color', theme.background, 'important');
    document.body.style.setProperty('background', theme.background, 'important');
    
    // 检查并移除任何背景图片
    const computedStyle = window.getComputedStyle(document.body);
    if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        document.body.style.backgroundImage = 'none';
    }
    
    // 更新渐变文字
    const gradientTexts = document.querySelectorAll('.gradient-text');
    gradientTexts.forEach(el => {
        el.style.background = `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`;
        el.style.webkitBackgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
        el.style.backgroundClip = 'text';
    });
    
    // 更新hero标题和副标题
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroTitle) heroTitle.style.color = theme.text;
    if (heroSubtitle) heroSubtitle.style.color = theme.text;
    
    // 更新所有SVG图标颜色
    const svgIcons = document.querySelectorAll('.logo i, .settings-card h3 i, .color-input-group label i, .settings-info i');
    svgIcons.forEach(icon => {
        icon.style.color = theme.text;
    });
    
    // 不再更新 favicon SVG
    
    // 强制重绘和背景更新
    document.body.style.display = 'none';
    document.body.offsetHeight; // 触发重排
    
    // 再次强制设置背景
    setTimeout(() => {
        document.body.style.backgroundColor = theme.background;
        document.body.style.setProperty('background-color', theme.background, 'important');
        document.body.style.setProperty('background', theme.background, 'important');
        
        // 检查所有可能的背景元素
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none' && 
                (el.classList.contains('background-animation') || el.tagName === 'BODY' || el.tagName === 'HTML')) {
                el.style.backgroundImage = 'none';
            }
        });
        
        document.body.style.display = '';
        console.log('主题应用完成，背景颜色:', theme.background);
    }, 50);
}

// 更新主题颜色
function updateThemeColors(theme) {
    // 更新所有使用主题色的元素
    const elementsToUpdate = [
        { selector: '.nav-link:hover', property: 'color', value: theme.primary },
        { selector: '.btn-primary', property: 'background', value: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})` },
        { selector: '.building-tag', property: 'background', value: theme.primary },
        { selector: '.filter-btn.active', property: 'background', value: theme.primary },
        { selector: '.filter-btn:hover', property: 'background', value: theme.primary },
        { selector: '.back-button', property: 'background', value: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})` },
        { selector: '.detail-hero h1', property: 'color', value: theme.text },
        { selector: '.info-card h3', property: 'color', value: theme.text },
        { selector: '.description-card h3', property: 'color', value: theme.text },
        { selector: '.related-section h3', property: 'color', value: theme.text }
    ];
    
    elementsToUpdate.forEach(({ selector, property, value }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.style[property] = value;
        });
    });
    
    // 更新背景色
    if (theme.background !== '#ffffff') {
        document.body.style.backgroundColor = theme.background;
        
        // 调整卡片透明度以适应深色背景
        const cards = document.querySelectorAll('.building-card, .info-card, .description-card, .settings-card');
        cards.forEach(card => {
            if (theme.background === '#121212') {
                card.style.background = 'rgba(30, 30, 30, 0.9)';
                card.style.color = '#ffffff';
                // 更新卡片内文字颜色
                const textElements = card.querySelectorAll('h3, p, span');
                textElements.forEach(el => {
                    el.style.color = '#ffffff';
                });
            } else {
                card.style.background = 'rgba(255, 255, 255, 0.9)';
                card.style.color = '';
                // 恢复默认文字颜色
                const textElements = card.querySelectorAll('h3, p, span');
                textElements.forEach(el => {
                    el.style.color = '';
                });
            }
        });
    } else {
        document.body.style.backgroundColor = '';
        
        // 恢复卡片默认样式
        const cards = document.querySelectorAll('.building-card, .info-card, .description-card, .settings-card');
        cards.forEach(card => {
            card.style.background = '';
            card.style.color = '';
            const textElements = card.querySelectorAll('h3, p, span');
            textElements.forEach(el => {
                el.style.color = '';
            });
        });
    }
}



// 保存主题
function saveTheme(theme) {
    try {
        localStorage.setItem('chuangyi-theme', JSON.stringify(theme));
    } catch (error) {
        console.error('保存主题失败:', error);
        showNotification('保存主题失败', 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #ff69b4, #ff1493)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 设置移动端菜单
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            const spans = menuBtn.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
        
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                console.log('移动端菜单项被点击:', this.href);
                navMenu.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
        
        document.addEventListener('click', function(event) {
            if (!menuBtn.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
    }
}

// 添加滑入滑出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 设置自定义光标控制
function setupCursorSettings() {
    // 等待自定义光标初始化完成
    setTimeout(() => {
        if (!window.customCursor) {
            console.log('自定义光标不可用');
            return;
        }

        const cursorStatus = window.customCursor.getStatus();
        
        // 设置自定义光标开关
        const customCursorToggle = document.getElementById('customCursorToggle');
        if (customCursorToggle) {
            // 从cookie直接获取光标状态
            const savedSettings = getCookie('customCursorSettings');
            let cursorEnabled = true; // 默认启用
            
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    cursorEnabled = settings.enabled === true;
                } catch (error) {
                    console.error('解析光标设置失败:', error);
                }
            }
            
            customCursorToggle.checked = cursorEnabled;
            console.log('设置光标开关初始状态:', cursorEnabled);
            
            customCursorToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    window.customCursor.enable();
                } else {
                    window.customCursor.disable();
                }
                updateParticleSettingsVisibility();
            });
        }

        // 设置粒子拖尾开关
        const particleTrailToggle = document.getElementById('particleTrailToggle');
        if (particleTrailToggle) {
            // 从cookie直接获取粒子拖尾状态
            const savedSettings = getCookie('customCursorSettings');
            let particlesEnabled = true; // 默认启用
            
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    particlesEnabled = settings.particlesEnabled === true;
                } catch (error) {
                    console.error('解析粒子设置失败:', error);
                }
            }
            
            particleTrailToggle.checked = particlesEnabled;
            console.log('设置粒子拖尾开关初始状态:', particlesEnabled);
            
            particleTrailToggle.addEventListener('change', (e) => {
                // 粒子拖尾开关状态改变
                const isEnabled = e.target.checked;
                console.log('粒子拖尾开关:', isEnabled);
                
                // 控制粒子效果
                if (window.customCursor) {
                    if (isEnabled) {
                        window.customCursor.startParticleTrail();
                    } else {
                        window.customCursor.stopParticleTrail();
                    }
                }
            });
        }

        // 设置粒子控制滑块
        setupParticleControls();
        
        // 更新粒子设置的可见性
        updateParticleSettingsVisibility();
    }, 500);
}

// 设置粒子控制滑块
function setupParticleControls() {
    const particleSize = document.getElementById('particleSize');
    const particleDensity = document.getElementById('particleDensity');
    const particleLifetime = document.getElementById('particleLifetime');

    // 从cookie加载设置并初始化滑块
    const savedSettings = getCookie('customCursorSettings');
    let settings = {};
    
    if (savedSettings) {
        try {
            settings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('解析粒子设置失败:', error);
        }
    }

    // 初始化粒子大小滑块
    if (particleSize) {
        particleSize.value = settings.particleSize || 6;
        particleSize.nextElementSibling.textContent = (settings.particleSize || 6) + 'px';
        
        particleSize.addEventListener('input', (e) => {
            const value = e.target.value;
            e.target.nextElementSibling.textContent = value + 'px';
            updateCursorSettings();
        });
    }

    // 初始化粒子密度滑块
    if (particleDensity) {
        particleDensity.value = settings.particleInterval || 20;
        particleDensity.nextElementSibling.textContent = (settings.particleInterval || 20) + 'ms';
        
        particleDensity.addEventListener('input', (e) => {
            const value = e.target.value;
            e.target.nextElementSibling.textContent = value + 'ms';
            updateCursorSettings();
        });
    }

    // 初始化粒子生命周期滑块
    if (particleLifetime) {
        particleLifetime.value = settings.particleLifetime || 1000;
        particleLifetime.nextElementSibling.textContent = (settings.particleLifetime || 1000) + 'ms';
        
        particleLifetime.addEventListener('input', (e) => {
            const value = e.target.value;
            e.target.nextElementSibling.textContent = value + 'ms';
            updateCursorSettings();
        });
    }
}

// 更新光标设置
function updateCursorSettings() {
    if (!window.customCursor) return;

    const particleSize = document.getElementById('particleSize');
    const particleDensity = document.getElementById('particleDensity');
    const particleLifetime = document.getElementById('particleLifetime');

    const newSettings = {
        particleSize: particleSize ? parseInt(particleSize.value) : 6,
        particleInterval: particleDensity ? parseInt(particleDensity.value) : 20,
        particleLifetime: particleLifetime ? parseInt(particleLifetime.value) : 1000
    };

    window.customCursor.updateSettings(newSettings);
    
    // 同时保存到cookie
    const savedSettings = getCookie('customCursorSettings');
    let currentSettings = {};
    
    if (savedSettings) {
        try {
            currentSettings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('解析当前设置失败:', error);
        }
    }
    
    // 合并设置并保存
    const mergedSettings = { ...currentSettings, ...newSettings };
    setCookie('customCursorSettings', JSON.stringify(mergedSettings), 365);
    
    console.log('设置已更新并保存:', mergedSettings);
}

// 更新粒子设置的可见性
function updateParticleSettingsVisibility() {
    if (!window.customCursor) return;

    // 从cookie获取最新状态
    const savedSettings = getCookie('customCursorSettings');
    let cursorEnabled = true;
    
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            cursorEnabled = settings.enabled === true;
        } catch (error) {
            console.error('解析设置失败:', error);
        }
    }

    const particleSettings = document.getElementById('particleSettings');
    const particleControls = document.getElementById('particleControls');

    if (particleSettings) {
        particleSettings.style.display = cursorEnabled ? 'flex' : 'none';
    }

    if (particleControls) {
        particleControls.style.display = cursorEnabled ? 'grid' : 'none';
    }
    
    console.log('粒子设置可见性已更新，光标启用:', cursorEnabled);
}

// Cookie操作方法
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}