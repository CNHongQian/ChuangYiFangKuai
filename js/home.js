// 首页专用JavaScript

// 统计数据
let statisticsData = {
    total: 0,
    building: 0,
    tool: 0,
    music: 0,
    command: 0
};

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners(); // 设置事件监听器
    loadStatistics(); // 加载统计数据
});

// 加载统计数据
async function loadStatistics() {
    try {
        // 从GitHub加载数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json?t=' + Date.now();
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载数据文件');
        }
        
        const data = await response.json();
        
        // 统计各类文件数量
        statisticsData.total = data.length;
        statisticsData.building = data.filter(item => item.category === 'building').length;
        statisticsData.tool = data.filter(item => item.category === 'tool').length;
        statisticsData.music = data.filter(item => item.category === 'music').length;
        statisticsData.command = data.filter(item => item.category === 'command').length;
        
        // 更新显示
        updateStatisticsDisplay();
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 更新统计数据显示
function updateStatisticsDisplay() {
    // 添加数字动画效果
    animateNumber('totalFiles', 0, statisticsData.total, 1500);
    animateNumber('buildingFiles', 0, statisticsData.building, 1500);
    animateNumber('toolFiles', 0, statisticsData.tool, 1500);
    animateNumber('musicFiles', 0, statisticsData.music, 1500);
    animateNumber('commandFiles', 0, statisticsData.command, 1500);
}

// 数字动画效果
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const endTime = startTime + duration;
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// 设置事件监听器
function setupEventListeners() {
    // 设置移动端菜单
    setupMobileMenu();
    
    // 视图切换按钮
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // 模态框关闭按钮
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeModal);
    
    // 点击模态框外部关闭
    const modal = document.getElementById('detailModal');
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// 设置移动端菜单
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (menuBtn && navMenu && menuOverlay) {
        menuBtn.addEventListener('click', function() {
            const isActive = navMenu.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            
            // 汉堡菜单动画
            const spans = menuBtn.querySelectorAll('span');
            if (isActive) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            }
        });
        
        // 点击菜单项关闭菜单
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
        
        // 点击遮罩层关闭菜单
        menuOverlay.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            const spans = menuBtn.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '1';
            spans[2].style.transform = '';
        });
    }
}














// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        'modern': '现代',
        'medieval': '中世纪',
        'pixel': '像素',
        'redstone': '红石',
        'fantasy': '奇幻',
        'editor': '编辑器',
        'generator': '生成器',
        'utility': '实用工具'
    };
    return categoryMap[category] || '其他';
}





// 视图切换
function handleViewChange(event) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentView = event.target.dataset.view;
    const grid = document.getElementById('buildingsGrid');
    
    if (currentView === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// 跳转到详情页面
function goToDetail(item) {
    // 保存当前作品到localStorage
    localStorage.setItem('currentWork', JSON.stringify(item));
    
    // 跳转到详情页
    window.location.href = `detail.html?id=${item.id}`;
}

// 从卡片分享作品
function shareWorkFromCard(item) {
    // 构建详情页URL
    const detailUrl = `${window.location.origin}${window.location.pathname.replace(/[^\/]*$/, '')}detail.html?id=${item.id}`;
    
    const workType = item.type === 'building' ? '建筑' : '工具';
    const shareText = `快来看看！我在"创艺方块"发现了一个好东西！\n${workType}: ${item.title}\n快点击链接查看下载吧：${detailUrl}`;
    
    // 检查是否支持Web Share API
    if (navigator.share) {
        navigator.share({
            title: `${item.title} - 创艺方块`,
            text: shareText,
            url: detailUrl
        }).then(() => {
            showNotification('分享成功！', 'success');
        }).catch(err => {
            // 如果用户取消或分享失败，则回退到复制链接
            copyShareLink(detailUrl, shareText);
        });
    } else {
        // 不支持Web Share API，直接复制链接
        copyShareLink(detailUrl, shareText);
    }
}

// 复制分享链接
function copyShareLink(url, text) {
    const fullShareText = `${text}\n${url}`;
    
    // 尝试使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(fullShareText).then(() => {
            showNotification('链接已复制到剪贴板！', 'success');
        }).catch(() => {
            // 如果失败，使用备用方法
            fallbackCopyText(fullShareText);
        });
    } else {
        // 使用备用方法
        fallbackCopyText(fullShareText);
    }
}

// 备用复制方法
function fallbackCopyText(text) {
    // 创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    try {
        textArea.focus();
        textArea.select();
        
        // 执行复制命令
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('链接已复制到剪贴板！', 'success');
        } else {
            showNotification('复制失败，请手动复制链接', 'error');
            // 显示链接让用户手动复制
            prompt('请复制以下链接：', text);
        }
    } catch (err) {
        console.error('复制失败', err);
        showNotification('复制失败，请手动复制链接', 'error');
        // 显示链接让用户手动复制
        prompt('请复制以下链接：', text);
    }
    
    // 移除临时文本区域
    document.body.removeChild(textArea);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
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
    
    // 根据类型设置背景色
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
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 键盘事件监听
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});