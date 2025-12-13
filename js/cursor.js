// 自定义鼠标光标和粒子拖尾效果
// Cookie操作函数
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

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

class CustomCursor {
    constructor() {
        this.isEnabled = true;
        this.isPC = this.detectPC();
        this.cursor = null;
        this.particles = [];
        this.lastMousePos = { x: 0, y: 0 };
        this.prevMousePos = { x: 0, y: 0 };
        this.particleInterval = null;
        this.isWindowActive = true;
        this.particlesEnabled = true; // 粒子拖尾启用状态
        this.settings = {
            particleColor: '#ff69b4',
            particleSize: 6,
            particleLifetime: 1000,
            particleInterval: 20,
            maxParticles: 50
        };
        
        this.init();
    }

    init() {
        // 从cookie加载设置
        this.loadSettings();
        
        
        
        // 如果启用，创建自定义光标
        if (this.isEnabled) {
            this.createCursor();
            this.bindEvents();
            // 只有在粒子也启用时才启动粒子拖尾
            if (this.particlesEnabled) {
                this.startParticleTrail();
            }
            
            // 添加全局样式来强制隐藏下拉菜单的默认光标
            this.addGlobalCursorHidingStyles();
        } else {
            // 如果禁用，确保清理任何残留的光标元素
            this.cleanup();
        }
        
        
    }

    detectPC() {
        // 移除设备检测，所有设备都可以使用自定义光标
        return true;
    }

    loadSettings() {
        // 从cookie加载设置
    const settings = getCookie('customCursorSettings');
    if (settings) {
        try {
            const parsedSettings = JSON.parse(settings);
            this.settings = { ...this.settings, ...parsedSettings };
            } catch (error) {
                console.error('解析设置失败:', error);
                // 默认设置 - 确保光标和粒子都开启
                this.isEnabled = true;
                this.particlesEnabled = true;
                this.saveSettings();
            }
        } else {
            // 默认设置 - 确保光标和粒子都开启
            this.isEnabled = true;
            this.particlesEnabled = true;
            this.saveSettings();
        }
    }

    saveSettings() {
        const settings = {
            enabled: this.isEnabled,
            particlesEnabled: this.particlesEnabled,
            ...this.settings
        };
        this.setCookie('customCursorSettings', JSON.stringify(settings), 365);
    }

    cleanup() {
        // 移除自定义光标
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
            this.cursor = null;
        }
        
        // 移除主题中的鼠标跟随效果
        const themeCursorGlow = document.getElementById('theme-cursor-glow');
        if (themeCursorGlow && themeCursorGlow.parentNode) {
            themeCursorGlow.parentNode.removeChild(themeCursorGlow);
        }
        
        // 移除自定义光标类
        document.body.classList.remove('custom-cursor-enabled');
        
        // 清理所有粒子
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
    }

    createCursor() {
        // 创建自定义光标
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);
        
        // 添加自定义光标类到body
        document.body.classList.add('custom-cursor-enabled');
        
        // 初始化光标位置
        this.updateCursorPosition(window.innerWidth / 2, window.innerHeight / 2);
        
        // 确保所有现有元素隐藏默认光标
        this.hideDefaultCursor();
    }

    bindEvents() {
        // 使用节流函数优化鼠标移动事件
        const throttledMouseMove = this.throttle((e) => {
            this.updateCursorPosition(e.clientX, e.clientY);
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            
            // 检查鼠标下的元素并应用相应效果
            this.checkElementUnderCursor(e.clientX, e.clientY);
        }, 16); // 约60fps

        // 鼠标移动事件
        document.addEventListener('mousemove', throttledMouseMove);
        
        // 添加滚动事件监听，确保光标位置正确
        const throttledScroll = this.throttle(() => {
            // 滚动时更新光标位置，确保跟随鼠标
            if (this.cursor && this.lastMousePos.x > 0 && this.lastMousePos.y > 0) {
                this.updateCursorPosition(this.lastMousePos.x, this.lastMousePos.y);
            }
        }, 16);
        
        window.addEventListener('scroll', throttledScroll);
        
        // 窗口大小改变时更新光标位置
        window.addEventListener('resize', this.throttle(() => {
            if (this.cursor && this.lastMousePos.x > 0 && this.lastMousePos.y > 0) {
                this.updateCursorPosition(this.lastMousePos.x, this.lastMousePos.y);
            }
        }, 16));

        // 鼠标按下事件
        document.addEventListener('mousedown', () => {
            if (this.cursor) {
                this.cursor.classList.add('click');
                // 点击时创建额外的粒子效果
                this.createClickEffect();
            }
        });

        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            if (this.cursor) {
                this.cursor.classList.remove('click');
            }
        });

        // 注意：悬停效果现在通过 checkElementUnderCursor 方法实时检测

        // 窗口失焦时隐藏光标
        window.addEventListener('blur', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '0';
            }
            // 暂停粒子创建
            this.isWindowActive = false;
        });

        // 窗口聚焦时显示光标
        window.addEventListener('focus', () => {
            if (this.cursor) {
                this.cursor.style.opacity = '1';
            }
            // 恢复粒子创建
            this.isWindowActive = true;
        });

        // 页面可见性变化处理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isWindowActive = false;
            } else {
                this.isWindowActive = true;
            }
        });

        // 监听主题变化，更新粒子颜色
        document.addEventListener('themeChanged', (e) => {
            this.updateParticleColor(e.detail.theme);
        });
        
        // 监听DOM变化，确保新元素也隐藏默认光标
        this.observeDOMChanges();
        
        // 强制隐藏所有下拉菜单的默认光标
        this.forceHideSelectCursors();
    }

    updateCursorPosition(x, y) {
        if (this.cursor) {
            // 由于CSS中使用了transform: translate(-50%, -50%)，需要调整位置
            // 但可能存在偏移问题，所以我们直接设置精确位置
            this.cursor.style.left = x + 'px';
            this.cursor.style.top = y + 'px';
        }
    }

    startParticleTrail() {
        if (!this.isEnabled) return;
        
        this.particlesEnabled = true; // 启用粒子拖尾
        
        // 保存状态到cookie
        this.saveSettings();
        
        // 清除旧的粒子间隔
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
        }

        // 创建新粒子间隔
        this.particleInterval = setInterval(() => {
            if (this.isEnabled && this.particlesEnabled && this.lastMousePos.x > 0 && this.lastMousePos.y > 0) {
                // 性能优化：只在鼠标移动时创建粒子
                const distance = Math.sqrt(
                    Math.pow(this.lastMousePos.x - this.prevMousePos.x, 2) + 
                    Math.pow(this.lastMousePos.y - this.prevMousePos.y, 2)
                );
                
                // 只有当鼠标移动超过一定距离时才创建粒子
                if (distance > 5) {
                    this.createParticle(this.lastMousePos.x, this.lastMousePos.y);
                    this.prevMousePos = { ...this.lastMousePos };
                }
            }
        }, this.settings.particleInterval);
        
        // 初始化前一个鼠标位置
        this.prevMousePos = { ...this.lastMousePos };
        
        
    }

    hideDefaultCursor() {
        // 确保所有交互元素都隐藏默认光标
        const interactiveElements = document.querySelectorAll(`
            a, button, input, textarea, select, option,
            .building-card, .clickable, .btn, .filter-btn, 
            .search-btn, .view-btn, .load-more-btn, .pagination-btn,
            .nav-link, .theme-dropdown-btn, .card-share-btn,
            .format-select, .format-filter, .format-filter label,
            [onclick], [role="button"], [type="button"], 
            [type="submit"], [type="reset"], label, .switch, .slider
        `);
        
        interactiveElements.forEach(element => {
            element.style.cursor = 'none';
        });
    }

    stopParticleTrail() {
        this.particlesEnabled = false; // 禁用粒子拖尾
        
        // 保存状态到cookie
        this.saveSettings();
        
        // 清除粒子间隔
        if (this.particleInterval) {
            clearInterval(this.particleInterval);
            this.particleInterval = null;
        }
        
        
    }

    createParticle(x, y) {
        // 只在窗口活动时和粒子拖尾启用时创建粒子
        if (!this.isWindowActive || !this.particlesEnabled) return;
        
        // 限制粒子数量
        if (this.particles.length >= this.settings.maxParticles) {
            const oldParticle = this.particles.shift();
            if (oldParticle && oldParticle.parentNode) {
                oldParticle.parentNode.removeChild(oldParticle);
            }
        }

        // 创建新粒子
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        
        // 随机化粒子属性
        const size = this.settings.particleSize + Math.random() * 4 - 2;
        const lifetime = this.settings.particleLifetime + Math.random() * 200 - 100;
        const offsetX = Math.random() * 10 - 5;
        const offsetY = Math.random() * 10 - 5;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x + offsetX}px;
            top: ${y + offsetY}px;
            background: ${this.settings.particleColor};
            animation-duration: ${lifetime}ms;
        `;
        
        document.body.appendChild(particle);
        this.particles.push(particle);
        
        // 自动清理粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, lifetime);
    }

    updateParticleColor(theme) {
        // 根据主题更新粒子颜色
        const themeColors = {
            light: '#ff69b4',
            dark: '#bb86fc',
            blue: '#4facfe',
            green: '#52c41a'
        };
        
        this.settings.particleColor = themeColors[theme] || themeColors.light;
        this.saveSettings();
    }

    enable() {
        // 先设置为启用状态
        this.isEnabled = true;
        
        this.createCursor();
        this.bindEvents();
        
        // 只有在粒子启用时才启动粒子拖尾
        if (this.particlesEnabled) {
            this.startParticleTrail();
        }
        
        // 保存设置到cookie
        this.saveSettings();
        
        // 显示自定义光标
        this.customCursor.style.display = 'block';
        document.body.style.cursor = 'none';
    }

    disable() {
        this.isEnabled = false;
        
        // 停止粒子拖尾
        this.stopParticleTrail();
        
        // 移除自定义光标
        if (this.cursor && this.cursor.parentNode) {
            this.cursor.parentNode.removeChild(this.cursor);
            this.cursor = null;
        }
        
        // 移除主题中的鼠标跟随效果
        const themeCursorGlow = document.getElementById('theme-cursor-glow');
        if (themeCursorGlow && themeCursorGlow.parentNode) {
            themeCursorGlow.parentNode.removeChild(themeCursorGlow);
        }
        
        // 移除自定义光标类
        document.body.classList.remove('custom-cursor-enabled');
        
        // 移除全局样式
        const globalStyles = document.getElementById('custom-cursor-hiding-styles');
        if (globalStyles && globalStyles.parentNode) {
            globalStyles.parentNode.removeChild(globalStyles);
        }
        
        // 清理所有粒子
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
        
        // 保存设置到cookie
        this.saveSettings();
        // 隐藏自定义光标
        this.customCursor.style.display = 'none';
        document.body.style.cursor = '';
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // 如果粒子正在运行，重启它们以应用新设置
        if (this.particlesEnabled && this.particleInterval) {
            this.stopParticleTrail();
            this.startParticleTrail();
        }
    }

    getStatus() {
        return {
            enabled: this.isEnabled,
            isPC: this.isPC,
            particlesEnabled: this.particlesEnabled,
            settings: this.settings
        };
    }

    // 节流函数
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // 检查鼠标下的元素并应用相应效果
    checkElementUnderCursor(x, y) {
        if (!this.cursor) return;
        
        // 移除所有悬停类
        this.cursor.classList.remove('hover', 'button-hover', 'link-hover');
        
        // 获取鼠标下的元素
        const elementUnderCursor = document.elementFromPoint(x, y);
        
        if (!elementUnderCursor) return;
        
        // 检查元素类型并添加相应的类
        const tagName = elementUnderCursor.tagName.toLowerCase();
        
        // 按钮类元素
        if (tagName === 'button' || 
            tagName === 'input' ||
            elementUnderCursor.classList.contains('btn') ||
            elementUnderCursor.classList.contains('filter-btn') ||
            elementUnderCursor.classList.contains('search-btn') ||
            elementUnderCursor.classList.contains('view-btn') ||
            elementUnderCursor.classList.contains('load-more-btn') ||
            elementUnderCursor.classList.contains('pagination-btn') ||
            elementUnderCursor.classList.contains('switch') ||
            elementUnderCursor.classList.contains('slider')) {
            this.cursor.classList.add('button-hover');
        }
        // 链接类元素
        else if (tagName === 'a' || 
                 elementUnderCursor.classList.contains('nav-link') ||
                 elementUnderCursor.classList.contains('card-share-btn')) {
            this.cursor.classList.add('link-hover');
        }
        // 其他交互元素
        else if (tagName === 'textarea' || 
                 tagName === 'select' ||
                 elementUnderCursor.classList.contains('clickable') ||
                 elementUnderCursor.classList.contains('building-card')) {
            this.cursor.classList.add('hover');
        }
    }

    // 点击效果
    createClickEffect() {
        if (!this.lastMousePos.x || !this.lastMousePos.y) return;
        
        // 创建点击爆炸效果
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createParticle(this.lastMousePos.x, this.lastMousePos.y);
            }, i * 30);
        }
    }

    // 观察DOM变化，确保新元素隐藏默认光标
    observeDOMChanges() {
        // 创建一个观察器来监听DOM变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查新添加的元素是否需要隐藏默认光标
                        if (this.shouldHideCursor(node)) {
                            node.style.cursor = 'none';
                        }
                        
                        // 检查子元素
                        // 检查新添加的元素是否需要隐藏默认光标
                        const childElements = node.querySelectorAll(`
                            a, button, input, textarea, select, option,
                            .building-card, .clickable, .btn, .filter-btn, 
                            .search-btn, .view-btn, .load-more-btn, .pagination-btn,
                            .nav-link, .theme-dropdown-btn, .card-share-btn,
                            .format-select, .format-filter, .format-filter label,
                            [onclick], [role="button"], [type="button"], 
                            [type="submit"], [type="reset"], label, .switch, .slider
                        `);
                        childElements.forEach(element => {
                            element.style.cursor = 'none';
                        });
                    }
                });
            });
        });

        // 观察整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 检查元素是否应该隐藏默认光标
    shouldHideCursor(element) {
        const tagName = element.tagName.toLowerCase();
        const interactiveTags = ['a', 'button', 'input', 'textarea', 'select', 'option', 'label'];
        
        return interactiveTags.includes(tagName) ||
               element.classList.contains('btn') ||
               element.classList.contains('clickable') ||
               element.classList.contains('building-card') ||
               element.classList.contains('format-select') ||
               element.classList.contains('format-filter') ||
               element.getAttribute('onclick') !== null ||
               element.getAttribute('role') === 'button' ||
               element.getAttribute('type') === 'button' ||
               element.getAttribute('type') === 'submit' ||
               element.getAttribute('type') === 'reset';
    }

    // 添加全局样式来强制隐藏下拉菜单的默认光标
    addGlobalCursorHidingStyles() {
        // 创建一个样式元素
        const style = document.createElement('style');
        style.id = 'custom-cursor-hiding-styles';
        
        // 添加强制隐藏下拉菜单光标的CSS规则
        style.textContent = `
            /* 强制隐藏所有下拉菜单的默认光标 */
            select, option, .format-select, .format-select option {
                cursor: none !important;
            }
            
            /* 使用更高优先级的选择器 */
            body select, body option, body .format-select, body .format-select option {
                cursor: none !important;
            }
            
            /* 自定义光标启用时的样式 */
            .custom-cursor-enabled select,
            .custom-cursor-enabled option,
            .custom-cursor-enabled .format-select,
            .custom-cursor-enabled .format-select option {
                cursor: none !important;
            }
            
            /* 覆盖任何可能的用户代理样式表 */
            * select,
            * option,
            * .format-select,
            * .format-select option {
                cursor: none !important;
            }
        `;
        
        // 将样式元素添加到head中
        document.head.appendChild(style);
        
        // 确保样式元素不会被其他脚本移除
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查样式元素是否被移除
                    if (!document.getElementById('custom-cursor-hiding-styles')) {
                        // 重新添加样式元素
                        document.head.appendChild(style);
                    }
                }
            });
        });
        
        // 监听head元素的变化
        observer.observe(document.head, { childList: true });
    }

    // 强制隐藏所有下拉菜单的默认光标
    forceHideSelectCursors() {
        const hideCursor = () => {
            // 查找所有select和option元素
            const selectElements = document.querySelectorAll('select, option, .format-select, .format-select option');
            
            selectElements.forEach(element => {
                element.style.cursor = 'none';
                // 设置内联样式，优先级最高
                element.setAttribute('style', (element.getAttribute('style') || '') + '; cursor: none !important;');
            });
            
            // 特别处理格式筛选下拉菜单
            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) {
                formatSelect.style.cursor = 'none';
                formatSelect.setAttribute('style', (formatSelect.getAttribute('style') || '') + '; cursor: none !important;');
                
                // 处理所有选项
                const options = formatSelect.querySelectorAll('option');
                options.forEach(option => {
                    option.style.cursor = 'none';
                    option.setAttribute('style', (option.getAttribute('style') || '') + '; cursor: none !important;');
                });
            }
        };
        
        // 立即执行一次
        hideCursor();
        
        // 定期检查并隐藏，防止动态创建的元素显示默认光标
        setInterval(hideCursor, 1000);
        
        // 监听下拉菜单的显示/隐藏事件
        document.addEventListener('focus', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.classList.contains('format-select')) {
                hideCursor();
            }
        }, true);
        
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.classList.contains('format-select') || 
                e.target.tagName === 'OPTION') {
                hideCursor();
            }
        }, true);
    }

    // Cookie操作方法
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 避免重复初始化
    if (!window.customCursor) {
        window.customCursor = new CustomCursor();
    }
});

// 导出供其他脚本使用
window.CustomCursor = CustomCursor;