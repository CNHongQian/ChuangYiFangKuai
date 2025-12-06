// 详情页面专用JavaScript
let currentWork = null;

// 初始化详情页面
document.addEventListener('DOMContentLoaded', async function() {
    setupMobileMenu();
    
    // 确保数据已加载
    if (typeof buildingsData === 'undefined' || buildingsData.length === 0) {
        await loadBuildingsData();
    }
    
    loadWorkDetail();
    loadRelatedWorks();
});

// 加载建筑数据（如果尚未加载）
async function loadBuildingsData() {
    try {
        // 尝试从GitHub仓库加载数据
        const githubUrl = 'https://raw.githubusercontent.com/CNHongQian/ChuangYiFangKuai/main/data/content_data.json';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载数据文件');
        }
        
        const data = await response.json();
        // 处理数据结构，添加缺失的默认值
        buildingsData = data.map(item => ({
            ...item,
            type: item.type || 'building',
            downloads: item.downloads || 0,
            likes: item.likes || 0,
            views: item.views || 0
        }));
        console.log('详情页面从GitHub加载数据成功:', buildingsData.length, '个作品');
    } catch (error) {
        console.error('从GitHub加载数据失败，尝试本地数据:', error);
        
        // 如果GitHub加载失败，尝试本地数据
        try {
            const localResponse = await fetch('../data/content_data.json');
            if (!localResponse.ok) {
                throw new Error('无法加载本地数据文件');
            }
            const data = await localResponse.json();
            buildingsData = data.map(item => ({
                ...item,
                type: item.type || 'building',
                downloads: item.downloads || 0,
                likes: item.likes || 0,
                views: item.views || 0
            }));
            console.log('详情页面从本地加载数据成功:', buildingsData.length, '个作品');
        } catch (localError) {
            console.error('本地数据也加载失败:', localError);
            buildingsData = [];
        }
    }
}

// 加载作品详情
function loadWorkDetail() {
    // 从URL参数获取作品ID
    const urlParams = new URLSearchParams(window.location.search);
    const workId = urlParams.get('id');
    
    if (!workId) {
        // 如果没有ID，从localStorage获取
        const savedWork = localStorage.getItem('currentWork');
        if (savedWork) {
            currentWork = JSON.parse(savedWork);
        } else {
            // 如果都没有，显示默认作品
            currentWork = buildingsData[0];
        }
    } else {
        // 根据ID查找作品
        currentWork = buildingsData.find(item => item.id == workId);
        
        // 如果找不到作品，跳转到404页面
        if (!currentWork) {
            window.location.href = '404.html';
            return;
        }
    }
    
    if (currentWork) {
        displayWorkDetail();
    }
}

// 显示作品详情
function displayWorkDetail() {
    // 更新基本信息
    document.getElementById('detailTitle').textContent = currentWork.title;
    document.getElementById('detailAuthor').textContent = currentWork.author;
    document.getElementById('detailType').textContent = currentWork.type === 'building' ? '建筑' : '工具';
    document.getElementById('detailCategory').textContent = getCategoryName(currentWork.category);
    document.getElementById('detailFileSize').textContent = currentWork.fileSize;
    document.getElementById('detailFileFormat').textContent = currentWork.fileFormat || '未知';
    document.getElementById('detailDate').textContent = currentWork.date;
    document.getElementById('detailDescription').textContent = currentWork.description;
    
    // 根据类型显示或隐藏建筑尺寸
    const buildingSizeElement = document.getElementById('detailBuildingSize');
    const buildingSizeLabel = buildingSizeElement.previousElementSibling;
    
    if (currentWork.type === 'tool') {
        // 工具类型隐藏建筑尺寸
        buildingSizeElement.style.display = 'none';
        buildingSizeLabel.style.display = 'none';
    } else {
        // 建筑类型显示建筑尺寸
        buildingSizeElement.style.display = 'block';
        buildingSizeLabel.style.display = 'block';
        buildingSizeElement.textContent = currentWork.buildingSize;
    }
    
    // 更新图片
    const mainImage = document.getElementById('mainImage');
    // 处理图片路径，确保正确显示
    let coverImagePath = currentWork.coverImage;
    if (coverImagePath && !coverImagePath.startsWith('http') && !coverImagePath.startsWith('../')) {
        coverImagePath = '../' + coverImagePath;
    }
    mainImage.src = coverImagePath;
    mainImage.alt = currentWork.title;
    mainImage.onerror = function() {
        this.src = 'https://via.placeholder.com/400x300/ff69b4/ffffff?text=暂无图片';
    };
    
    // 生成缩略图
    generateThumbnails();
    
    // 更新页面标题
    document.title = `${currentWork.title} - 创艺方块`;
}

// 生成缩略图
function generateThumbnails() {
    const thumbnailGrid = document.getElementById('thumbnailGrid');
    if (!thumbnailGrid) return;
    
    thumbnailGrid.innerHTML = '';
    
    // 创建多个缩略图（示例）
    const thumbnails = [
        currentWork.coverImage,
        currentWork.image,
        // 可以添加更多图片URL
    ];
    
    thumbnails.forEach((src, index) => {
        if (!src) return;
        
        const thumbnail = document.createElement('img');
        // 处理图片路径
        let thumbnailSrc = src;
        if (thumbnailSrc && !thumbnailSrc.startsWith('http') && !thumbnailSrc.startsWith('../')) {
            thumbnailSrc = '../' + thumbnailSrc;
        }
        
        thumbnail.src = thumbnailSrc;
        thumbnail.alt = `${currentWork.title} - 图片 ${index + 1}`;
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        
        thumbnail.addEventListener('click', function() {
            // 更新主图，使用处理后的路径
            document.getElementById('mainImage').src = thumbnailSrc;
            
            // 更新活动状态
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        // 添加错误处理
        thumbnail.onerror = function() {
            this.src = 'https://via.placeholder.com/80x80/ff69b4/ffffff?text=暂无图片';
        };
        
        thumbnailGrid.appendChild(thumbnail);
    });
}

// 加载相关作品（随机推荐）
function loadRelatedWorks() {
    const relatedGrid = document.getElementById('relatedGrid');
    relatedGrid.innerHTML = '';
    
    // 获取除当前作品外的所有作品
    const availableWorks = buildingsData.filter(item => item.id !== currentWork.id);
    
    // 随机打乱并选择前3个
    const shuffled = availableWorks.sort(() => Math.random() - 0.5);
    const randomWorks = shuffled.slice(0, 3);
    
    randomWorks.forEach(work => {
        const card = createRelatedCard(work);
        relatedGrid.appendChild(card);
    });
}

// 创建相关作品卡片
function createRelatedCard(work) {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.style.cursor = 'pointer';
    
    const typeTag = work.type === 'tool' ? '工具' : '建筑';
    const categoryTag = getCategoryName(work.category);
    
    // 处理图片路径
    let workImagePath = work.image;
    if (workImagePath && !workImagePath.startsWith('http') && !workImagePath.startsWith('../')) {
        workImagePath = '../' + workImagePath;
    }
    
    card.innerHTML = `
        <img src="${workImagePath}" alt="${work.title}" class="building-image" onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=暂无图片'">
        <div class="building-info">
            <h3 class="building-title">${work.title}</h3>
            <p class="building-author">作者: ${work.author}</p>
            <div class="building-stats">
                <span class="building-tag">${typeTag}</span>
                <span class="building-tag">${categoryTag}</span>
                <span><i class="fas fa-file"></i> ${work.fileSize}</span>
                <span><i class="fas fa-cube"></i> ${work.buildingSize}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', function() {
        // 保存当前作品到localStorage
        localStorage.setItem('currentWork', JSON.stringify(work));
        
        // 跳转到详情页
        window.location.href = `detail.html?id=${work.id}`;
    });
    
    return card;
}

// 返回功能
function goBack() {
    // 尝试使用浏览器历史记录返回
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // 如果没有历史记录，返回首页
        window.location.href = 'index.html';
    }
}

// 下载文件
function downloadFile() {
    if (currentWork) {
        // 检查是否有文件名
        if (!currentWork.fileName) {
            showNotification('该作品暂无下载文件', 'error');
            return;
        }
        
        showNotification(`正在下载 ${currentWork.title}...`, 'info');
        
        // 根据作品类型构建文件下载URL
        let downloadPath;
        if (currentWork.type === 'building' || currentWork.category === 'building') {
            downloadPath = `building/${currentWork.fileName}`;
        } else if (currentWork.type === 'tool' || currentWork.category === 'tool') {
            downloadPath = `tool/${currentWork.fileName}`;
        } else if (currentWork.type === 'music' || currentWork.category === 'music') {
            downloadPath = `music/${currentWork.fileName}`;
        } else if (currentWork.type === 'command' || currentWork.category === 'command') {
            downloadPath = `command/${currentWork.fileName}`;
        }
        
        const downloadUrl = `https://raw.githubusercontent.com/CNHongQian/ChuangYiFangKuai/main/${downloadPath}`;
        
        // 创建隐藏的下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = currentWork.fileName;
        downloadLink.style.display = 'none';
        
        // 添加错误处理
        downloadLink.onerror = function() {
            document.body.removeChild(downloadLink);
            showNotification('文件不存在或已被删除', 'error');
        };
        
        // 添加到页面并触发点击
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 清理和显示完成消息
        setTimeout(() => {
            if (document.body.contains(downloadLink)) {
                document.body.removeChild(downloadLink);
            }
            showNotification(`${currentWork.title} 下载完成！`, 'success');
            
            // 添加下载统计（可选）
            if (currentWork.downloads !== undefined) {
                currentWork.downloads++;
                console.log(`下载次数: ${currentWork.downloads}`);
                // 更新显示的下载次数
                const downloadsElement = document.getElementById('detailDownloads');
                if (downloadsElement) {
                    downloadsElement.textContent = currentWork.downloads;
                }
            }
        }, 500);
    }
}



// 分享作品
function shareWork() {
    if (currentWork) {
        // 构建完整的分享URL（包含域名和完整路径）
        const currentUrl = window.location.href;
        const shareUrl = currentUrl; // 当前的详情页URL已经包含了作品ID
        
        const workType = currentWork.type === 'building' ? '建筑' : '工具';
        const shareText = `快来看看！我在"创艺方块"发现了一个好东西！\n${workType}: ${currentWork.title}\n快点击链接查看下载吧：${shareUrl}`;
        
        // 复制格式化的文本
        copyToClipboard(shareText);
        showNotification('链接已复制到剪贴板！', 'success');
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
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
        document.execCommand('copy');
    } catch (err) {
        console.error('复制失败', err);
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

// 设置移动端菜单
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // 汉堡菜单动画
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
        
        // 点击菜单项关闭菜单
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
            });
        });
        
        // 点击外部关闭菜单
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