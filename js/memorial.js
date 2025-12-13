// 纪念日鲜花动画效果
class MemorialFlowerAnimation {
    constructor() {
        this.flowers = [];
        this.isMemorialDay = false;
        this.init();
    }

    init() {
        // 检查是否是纪念日
        this.checkMemorialDay();
        
        if (this.isMemorialDay) {
            this.createFlowerAnimation();
            this.addFlowerStyles();
        }
    }

    checkMemorialDay() {
        this.isMemorialDay = localStorage.getItem('isMemorialDay') === 'true';
    }

    createFlowerAnimation() {
        // 创建鲜花容器
        const flowerContainer = document.createElement('div');
        flowerContainer.id = 'flower-container';
        flowerContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(flowerContainer);

        // 创建多束鲜花
        this.createFlowerBouquet(flowerContainer);
        
        // 定期创建新的鲜花
        setInterval(() => {
            if (this.flowers.length < 5) {
                this.createFlowerBouquet(flowerContainer);
            }
        }, 8000);
    }

    createFlowerBouquet(container) {
        const bouquet = document.createElement('div');
        bouquet.className = 'flower-bouquet';
        
        // 随机位置（从底部升起）
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 100;
        
        bouquet.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            transform: translateX(-50%);
            animation: floatUp 12s ease-in-out forwards;
            z-index: 1;
        `;
        
        // 创建多朵花
        const flowerTypes = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐'];
        const flowerCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < flowerCount; i++) {
            const flower = document.createElement('div');
            flower.className = 'flower';
            flower.textContent = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            
            const angle = (Math.PI * 2 * i) / flowerCount;
            const radius = 20 + Math.random() * 20;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;
            
            flower.style.cssText = `
                position: absolute;
                font-size: ${24 + Math.random() * 16}px;
                left: ${offsetX}px;
                top: ${offsetY}px;
                animation: sway 3s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                filter: grayscale(30%) brightness(0.9);
                opacity: 0.8;
            `;
            
            bouquet.appendChild(flower);
        }
        
        container.appendChild(bouquet);
        this.flowers.push(bouquet);
        
        // 动画结束后移除
        setTimeout(() => {
            if (bouquet.parentNode) {
                bouquet.parentNode.removeChild(bouquet);
            }
            const index = this.flowers.indexOf(bouquet);
            if (index > -1) {
                this.flowers.splice(index, 1);
            }
        }, 12000);
    }

    addFlowerStyles() {
        // 检查是否已存在样式
        if (document.getElementById('flower-animation-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'flower-animation-styles';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    transform: translateX(-50%) translateY(0) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.8;
                }
                90% {
                    opacity: 0.8;
                }
                100% {
                    transform: translateX(-50%) translateY(-${window.innerHeight + 200}px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes sway {
                0%, 100% {
                    transform: translateX(0) rotate(0deg);
                }
                25% {
                    transform: translateX(-5px) rotate(-5deg);
                }
                75% {
                    transform: translateX(5px) rotate(5deg);
                }
            }
            
            .flower-bouquet {
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
            }
        `;
        document.head.appendChild(style);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.memorialFlowerAnimation = new MemorialFlowerAnimation();
});

// 导出供其他脚本使用
window.MemorialFlowerAnimation = MemorialFlowerAnimation;