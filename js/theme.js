// 主题切换功能
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.isMemorialDay = false;
        this.memorialDayInfo = null;
        this.init();
    }

    init() {
        // 检查是否是纪念日
        this.checkMemorialDay();
        
        // 设置初始主题
        this.setTheme(this.currentTheme);
        
        // 绑定主题切换按钮事件
        this.bindEvents();
        
        // 添加主题切换动画
        this.addTransitionClass();
    }

    bindEvents() {
        const themeDropdownBtn = document.getElementById('themeDropdownBtn');
        const themeDropdownMenu = document.getElementById('themeDropdownMenu');
        const themeOptions = document.querySelectorAll('.theme-option');

        // 主题下拉菜单切换
        if (themeDropdownBtn) {
            themeDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
            
            // 移动端触摸优化
            themeDropdownBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleDropdown();
            });
        }

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            this.closeDropdown();
        });
        
        // 移动端触摸关闭
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                this.closeDropdown();
            }
        });

        // 主题选项点击事件
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.getAttribute('data-theme');
                this.setTheme(theme);
                this.closeDropdown();
            });
            
            // 移动端触摸优化
            option.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const theme = option.getAttribute('data-theme');
                this.setTheme(theme);
                this.closeDropdown();
            });
        });

        // 键盘快捷键切换主题
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.cycleThemes();
            }
        });
    }

    toggleDropdown() {
        const themeDropdownMenu = document.getElementById('themeDropdownMenu');
        if (themeDropdownMenu) {
            themeDropdownMenu.classList.toggle('show');
        }
    }

    closeDropdown() {
        const themeDropdownMenu = document.getElementById('themeDropdownMenu');
        if (themeDropdownMenu) {
            themeDropdownMenu.classList.remove('show');
        }
    }

    setTheme(theme) {
        // 如果是纪念日，不允许更改主题
        if (this.isMemorialDay && theme !== 'memorial') {
            this.showNotification('今天是纪念日，主题已自动设置为灰白模式', 'info');
            return;
        }
        
        // 移除所有主题类
        document.documentElement.removeAttribute('data-theme');
        
        // 设置新主题
        if (theme !== 'light') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        
        // 更新当前主题
        this.currentTheme = theme;
        
        // 保存到本地存储
        localStorage.setItem('theme', theme);
        
        // 更新UI状态
        this.updateThemeUI(theme);
        
        // 触发主题切换事件
        this.dispatchThemeChangeEvent(theme);
        
        // 添加切换动画
        this.addSwitchAnimation();
    }

    updateThemeUI(theme) {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            if (optionTheme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    cycleThemes() {
        const themes = ['light', 'dark', 'blue', 'green'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    addTransitionClass() {
        document.documentElement.classList.add('theme-transition');
    }

    addSwitchAnimation() {
        // 添加切换动画效果
        const body = document.body;
        body.style.transition = 'all 0.3s ease';
        
        // 创建涟漪效果
        this.createRippleEffect();
        
        // 闪烁效果
        this.createFlashEffect();
    }

    createRippleEffect() {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')};
            opacity: 0.3;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
            transition: width 0.6s ease, height 0.6s ease, opacity 0.6s ease;
        `;
        
        document.body.appendChild(ripple);
        
        // 动画
        setTimeout(() => {
            ripple.style.width = '200vw';
            ripple.style.height = '200vw';
            ripple.style.opacity = '0';
        }, 10);
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    }

    createFlashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0;
            pointer-events: none;
            z-index: 9998;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(flash);
        
        // 动画
        setTimeout(() => {
            flash.style.opacity = '0.3';
        }, 10);
        
        setTimeout(() => {
            flash.style.opacity = '0';
        }, 200);
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(flash);
        }, 400);
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }

    // 检查是否是纪念日
    checkMemorialDay() {
        const today = new Date();
        const month = today.getMonth() + 1; // 月份从0开始
        const day = today.getDate();
        
        // 纪念日配置
        const memorialDays = [
            { month: 12, day: 13, name: "南京大屠杀死难者国家公祭日" },
            { month: 9, day: 30, name: "烈士纪念日" },
            { month: 1, day: 27, name: "国际大屠杀纪念日" },
            { month: 5, day: 12, name: "汶川地震遇难者纪念日" }
        ];
        
        // 检查今天是否是纪念日
        for (const memorial of memorialDays) {
            if (memorial.month === month && memorial.day === day) {
                this.isMemorialDay = true;
                this.memorialDayInfo = memorial;
                // 强制使用灰白主题
                this.currentTheme = 'memorial';
                this.setMemorialTheme(memorial.name);
                
                // 保存纪念日状态到本地存储
                localStorage.setItem('isMemorialDay', 'true');
                localStorage.setItem('memorialDayName', memorial.name);
                return;
            }
        }
        
        // 如果不是纪念日，清除纪念日状态
        this.isMemorialDay = false;
        this.memorialDayInfo = null;
        localStorage.removeItem('isMemorialDay');
        localStorage.removeItem('memorialDayName');
        
        // 移除纪念日样式和横幅
        this.removeMemorialTheme();
    }

    // 设置纪念日主题
    setMemorialTheme(memorialName) {
        // 创建纪念日主题样式
        let memorialStyle = document.getElementById('memorial-theme-style');
        if (!memorialStyle) {
            memorialStyle = document.createElement('style');
            memorialStyle.id = 'memorial-theme-style';
            document.head.appendChild(memorialStyle);
        }
        
        const memorialCSS = `
            /* 纪念日灰白主题 */
            :root {
                --primary-color: #808080 !important;
                --secondary-color: #606060 !important;
                --accent-color: #404040 !important;
                --primary-light: #f0f0f0 !important;
                --primary-medium: #e0e0e0 !important;
                --primary-dark: #d0d0d0 !important;
                --text-primary: #333333 !important;
                --text-secondary: #666666 !important;
                --text-muted: #999999 !important;
                --background-start: #f5f5f5 !important;
                --background-25: #eeeeee !important;
                --background-50: #e8e8e8 !important;
                --background-75: #dddddd !important;
                --background-end: #cccccc !important;
                --card-bg: rgba(245, 245, 245, 0.95) !important;
                --card-border: rgba(128, 128, 128, 0.3) !important;
                --card-shadow: rgba(128, 128, 128, 0.2) !important;
                --card-hover-shadow: rgba(128, 128, 128, 0.3) !important;
            }
            
            /* 强制所有元素使用灰白主题 */
            * {
                color: inherit !important;
            }
            
            body, html, .main, .background-animation {
                background: #f5f5f5 !important;
                background-color: #f5f5f5 !important;
                background-image: none !important;
                filter: grayscale(100%) !important;
            }
            
            .logo h1,
            .nav-link,
            .hero-title,
            .hero-subtitle,
            .settings-header h1,
            .settings-card h3,
            .theme-name,
            .color-input-group label,
            .footer-section h4,
            .footer-section p,
            .footer-section li a {
                color: #333333 !important;
            }
            
            .gradient-text {
                background: linear-gradient(45deg, #808080, #606060) !important;
                -webkit-background-clip: text !important;
                -webkit-text-fill-color: transparent !important;
                background-clip: text !important;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #808080, #606060) !important;
            }
            
            .btn-secondary {
                background: #f5f5f5 !important;
                border: 1px solid #808080 !important;
                color: #333333 !important;
            }
            
            .settings-card {
                background: rgba(245, 245, 245, 0.95) !important;
                border: 1px solid rgba(128, 128, 128, 0.3) !important;
            }
            
            .theme-preset.active {
                border-color: #808080 !important;
            }
            
            .theme-preset.active::after {
                background: #808080 !important;
            }
            
            .nav-link.active::after,
            .nav-link:hover::after {
                background: #808080 !important;
            }
            
            .hero {
                background: linear-gradient(135deg, #f0f0f0, #e0e0e0) !important;
            }
            
            /* 禁用所有彩色动画和效果 */
            .background-decoration-1,
            .background-decoration-2,
            .background-decoration-3 {
                display: none !important;
            }
            
            .particle,
            .cursor-glow {
                display: none !important;
            }
        `;
        
        memorialStyle.textContent = memorialCSS;
        
        // 显示纪念日导航栏
        this.showMemorialNav(memorialName);
        
        // 保存纪念日状态
        this.isMemorialDay = true;
        localStorage.setItem('isMemorialDay', 'true');
        localStorage.setItem('memorialDayName', memorialName);
    }

    // 显示纪念日导航栏
    showMemorialNav(memorialName) {
        const memorialNav = document.getElementById('memorialNav');
        const memorialTitle = document.getElementById('memorialTitle');
        
        if (memorialNav && memorialTitle) {
            memorialTitle.textContent = memorialName;
            memorialNav.style.display = 'block';
        }
    }

    // 移除纪念日主题
    removeMemorialTheme() {
        // 移除纪念日样式
        const memorialStyle = document.getElementById('memorial-theme-style');
        if (memorialStyle) {
            memorialStyle.parentNode.removeChild(memorialStyle);
        }
        
        // 隐藏纪念日导航栏
        const memorialNav = document.getElementById('memorialNav');
        if (memorialNav) {
            memorialNav.style.display = 'none';
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10001;
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
                notification.style.background = 'linear-gradient(45deg, #808080, #606060)';
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

    // 重置为默认主题
    resetTheme() {
        this.setTheme('light');
    }
}

// 动画增强类
class AnimationEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollAnimations();
        this.addHoverEffects();
        this.addLoadingAnimations();
        this.addMicroInteractions();
    }

    addScrollAnimations() {
        // 滚动显示动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, observerOptions);

        // 观察所有需要动画的元素
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    }

    addHoverEffects() {
        // 卡片悬停效果
        document.querySelectorAll('.building-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.addCardHoverEffect(e.target);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.removeCardHoverEffect(e.target);
            });
            
            // 添加3D效果
            card.classList.add('card-3d');
        });

        // 按钮涟漪效果
        document.querySelectorAll('.btn, .filter-btn, .search-btn').forEach(btn => {
            btn.classList.add('ripple');
            this.addRippleEffect(btn);
        });

        // 磁性按钮效果
        document.querySelectorAll('.btn-primary, .load-more-btn').forEach(btn => {
            btn.classList.add('magnetic-btn');
            this.addMagneticEffect(btn);
        });
    }

    addCardHoverEffect(card) {
        const image = card.querySelector('.building-image');
        if (image) {
            image.style.transform = 'scale(1.1) rotateX(5deg)';
        }
    }

    removeCardHoverEffect(card) {
        const image = card.querySelector('.building-image');
        if (image) {
            image.style.transform = 'scale(1) rotateX(0deg)';
        }
    }

    addLoadingAnimations() {
        // 为加载更多按钮添加加载状态
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', (e) => {
                this.addLoadingState(e.target);
            });
        }
    }

    addLoadingState(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading-spinner"></span> 加载中...';
        button.disabled = true;
        
        // 模拟加载完成
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 2000);
    }

    addMicroInteractions() {
        // 搜索框聚焦效果
        const searchBox = document.querySelector('.search-box input');
        if (searchBox) {
            searchBox.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('search-focused');
            });
            
            searchBox.addEventListener('blur', (e) => {
                e.target.parentElement.classList.remove('search-focused');
            });
        }

        // 导航链接点击效果
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.addClickEffect(e.target);
            });
        });

        // 添加鼠标跟随效果
        this.addMouseFollower();
        
        // 添加粒子效果
        this.addParticleEffect();
        
        // 添加键盘快捷键
        this.addKeyboardShortcuts();
        
        // 添加滚动进度条
        this.addScrollProgress();
        
        // 添加页面可见性检测
        this.addVisibilityDetection();
    }

    addClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    // 添加涟漪效果
    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            `;
            
            element.appendChild(ripple);
            
            setTimeout(() => {
                element.removeChild(ripple);
            }, 600);
        });
        
        // 添加涟漪动画样式
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 添加磁性效果
    addMagneticEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    }

    // 添加鼠标跟随效果
    addMouseFollower() {
        // 检查是否启用了自定义光标，如果没有则不创建跟随效果
        const savedSettings = this.getCookie('customCursorSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.enabled === false) {
                return; // 如果自定义光标被禁用，则不创建跟随效果
            }
        }
        
        const cursor = document.createElement('div');
        cursor.className = 'cursor-glow';
        cursor.id = 'theme-cursor-glow'; // 添加ID以便后续控制
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            if (cursor.parentNode) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
        
        // 在交互元素上增强效果
        const interactiveElements = document.querySelectorAll('a, button, .building-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursor.parentNode) {
                    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (cursor.parentNode) {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                }
            });
        });
    }

    // Cookie操作方法
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

    // 添加粒子效果
    addParticleEffect() {
        document.addEventListener('click', (e) => {
            // 只在特定元素上创建粒子
            if (e.target.closest('.building-card, .btn, .filter-btn')) {
                this.createParticles(e.clientX, e.clientY);
            }
        });
    }

    createParticles(x, y) {
        const colors = [
            getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
            getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')
        ];
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (Math.PI * 2 * i) / 8;
            const velocity = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                --tx: ${tx}px;
                --ty: ${ty}px;
            `;
            
            document.body.appendChild(particle);
            
            // 触发动画
            setTimeout(() => {
                particle.classList.add('active');
            }, 10);
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(particle);
            }, 1000);
        }
    }

    // 添加键盘快捷键
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K 打开搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('#searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // ESC 关闭模态框
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal');
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            }
            
            // 数字键快速切换主题
            if (e.altKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const themes = ['light', 'dark', 'blue', 'green'];
                const themeIndex = parseInt(e.key) - 1;
                window.themeManager.setTheme(themes[themeIndex]);
            }
        });
    }

    // 添加滚动进度条
    addScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            z-index: 10000;
            transition: width 0.2s ease;
        `;
        document.body.appendChild(progressBar);
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = progress + '%';
        };
        
        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    // 添加页面可见性检测
    addVisibilityDetection() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面重新可见时的动画
                document.body.classList.add('page-visible');
                
                // 添加欢迎动画
                this.showWelcomeAnimation();
                
                setTimeout(() => {
                    document.body.classList.remove('page-visible');
                }, 1000);
            }
        });
    }

    // 欢迎动画
    showWelcomeAnimation() {
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.classList.add('bounce');
            setTimeout(() => {
                logo.classList.remove('bounce');
            }, 1000);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题管理器
    window.themeManager = new ThemeManager();
    
    // 初始化动画增强器
    window.animationEnhancer = new AnimationEnhancer();
    
    // 添加页面加载动画
    document.body.classList.add('page-loaded');
    
    // 监听主题变化事件
    document.addEventListener('themeChanged', (e) => {
        
        
        // 可以在这里添加主题切换后的额外逻辑
        // 例如更新图表颜色、重新渲染某些组件等
    });
});

// 页面可见性变化时的处理
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // 页面重新可见时可以添加一些动画效果
        document.body.classList.add('page-visible');
        setTimeout(() => {
            document.body.classList.remove('page-visible');
        }, 1000);
    }
});

// 窗口大小变化时的处理
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 响应式布局调整
        document.body.classList.add('layout-adjusted');
        setTimeout(() => {
            document.body.classList.remove('layout-adjusted');
        }, 300);
    }, 250);
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题管理器
    window.themeManager = new ThemeManager();
    
    // 初始化动画增强器
    window.animationEnhancer = new AnimationEnhancer();
    
    // 添加页面加载动画
    document.body.classList.add('page-loaded');
    
    // 监听主题变化事件
    document.addEventListener('themeChanged', (e) => {
        
        
        // 可以在这里添加主题切换后的额外逻辑
        // 例如更新图表颜色、重新渲染某些组件等
    });
});

// 导出主题管理器供其他脚本使用
window.ThemeManager = ThemeManager;
window.AnimationEnhancer = AnimationEnhancer;