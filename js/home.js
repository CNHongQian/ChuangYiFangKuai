// 首页专用JavaScript


// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners(); // 设置事件监听器
    // 不加载建筑卡片，首页只显示基本介绍内容
});

// 设置事件监听器
function setupEventListeners() {
    
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
            console.log('分享取消或失败', err);
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