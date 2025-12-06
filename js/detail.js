// 详情页面专用JavaScript
let currentWork = null;
let currentImageIndex = 0;
let imageRotation = 0;
let imageScale = 1;
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;
let tagsData = []; // 存储标签数据

// 初始化详情页面
document.addEventListener('DOMContentLoaded', async function() {
    setupMobileMenu();
    setupNavigationLinks(); // 添加导航链接设置
    
    // 加载标签数据
    await loadTagsData();
    
    // 确保数据已加载
    if (typeof buildingsData === 'undefined' || buildingsData.length === 0) {
        await loadBuildingsData();
    }
    
    loadWorkDetail();
    loadRelatedWorks();
});

// 设置导航链接
function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // 移除可能存在的事件监听器
        link.replaceWith(link.cloneNode(true));
    });
    
    // 重新获取链接并添加点击事件
    const freshNavLinks = document.querySelectorAll('.nav-link');
    freshNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('导航链接被点击:', this.href);
            // 确保链接可以正常跳转
            window.location.href = this.href;
        });
    });
}

// 加载标签数据
async function loadTagsData() {
    try {
        // 从GitHub加载标签数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/tags.json?t=' + Date.now();
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载标签数据文件');
        }
        
        const data = await response.json();
        tagsData = data.tags;
        console.log('详情页面从GitHub加载的标签数据:', tagsData);
    } catch (error) {
        console.error('从GitHub加载标签数据失败:', error);
        tagsData = [];
    }
}

// 获取作品标签名称
function getWorkTags(tags) {
    if (!tags || !Array.isArray(tags)) {
        return '无标签';
    }
    
    const tagNames = tags.map(tagId => {
        const tag = tagsData.find(t => t.id === tagId);
        return tag ? tag.name : null;
    }).filter(name => name !== null);
    
    return tagNames.length > 0 ? tagNames.join(', ') : '无标签';
}

// 加载建筑数据（如果尚未加载）
async function loadBuildingsData() {
    try {
        // 尝试从GitHub仓库加载数据，添加时间戳防止缓存
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json?t=' + Date.now();
        console.log('详情页面尝试从GitHub加载数据:', githubUrl);
        
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch(githubUrl, {
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        console.log('详情页面GitHub响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`GitHub请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('详情页面GitHub原始数据:', data);
        console.log('详情页面数据总数:', data.length);
        
        if (data && data.length > 0) {
            // 处理数据结构，添加缺失的默认值
            buildingsData = data.map(item => ({
                ...item,
                type: item.type || item.category || 'building',
                downloads: item.downloads || 0,
                likes: item.likes || 0,
                views: item.views || 0
            }));
            console.log('详情页面从GitHub加载数据成功:', buildingsData.length, '个作品');
            return;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('详情页面GitHub请求超时:', error);
        } else {
            console.error('详情页面从GitHub加载数据失败，尝试本地数据:', error);
        }
        
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
            console.error('详情页面本地数据也加载失败:', localError);
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
            // 确保type字段正确设置
            if (currentWork && !currentWork.type && currentWork.category) {
                currentWork.type = currentWork.category;
            }
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
    
    // 确保type字段正确设置
    if (currentWork && !currentWork.type && currentWork.category) {
        currentWork.type = currentWork.category;
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
    document.getElementById('detailType').textContent = getTypeName(currentWork.type);
    document.getElementById('detailCategory').textContent = getWorkTags(currentWork.tags);
    document.getElementById('detailFileSize').textContent = currentWork.size || currentWork.fileSize || '未知';
    document.getElementById('detailFileFormat').textContent = currentWork.fileFormat || '未知';
    document.getElementById('detailVersion').textContent = currentWork.version || '未知';
    document.getElementById('detailUploader').textContent = currentWork.uploader || '未知';
    document.getElementById('detailId').textContent = currentWork.id || '未知';
    document.getElementById('detailDate').textContent = currentWork.date;
    // 处理作品介绍中的换行符
    const descriptionElement = document.getElementById('detailDescription');
    if (currentWork.description) {
        // 将\n转换为<br>标签，支持换行显示
        descriptionElement.innerHTML = currentWork.description.replace(/\n/g, '<br>');
    } else {
        descriptionElement.textContent = '暂无描述';
    }
    
    // 根据类型显示或隐藏建筑尺寸
    const buildingSizeElement = document.getElementById('detailBuildingSize');
    const buildingSizeLabel = buildingSizeElement.previousElementSibling;
    
    if (currentWork.type === 'tool' || currentWork.type === 'music' || currentWork.type === 'command') {
        // 非建筑类型隐藏建筑尺寸
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
    
    // 添加主图点击事件
    mainImage.addEventListener('click', openImageModal);
    
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
    
    // 创建多个缩略图
    const thumbnails = [
        currentWork.coverImage,
        currentWork.image,
        // 可以添加更多图片URL
    ].filter(img => img); // 过滤掉空值
    
    // 如果没有足够的图片，使用同一图片创建多个缩略图
    if (thumbnails.length === 1) {
        for (let i = 0; i < 4; i++) {
            thumbnails.push(thumbnails[0]);
        }
    }
    
    thumbnails.forEach((src, index) => {
        const thumbnail = document.createElement('img');
        // 处理图片路径
        let thumbnailSrc = src;
        if (thumbnailSrc && !thumbnailSrc.startsWith('http') && !thumbnailSrc.startsWith('../')) {
            thumbnailSrc = '../' + thumbnailSrc;
        }
        
        thumbnail.src = thumbnailSrc;
        thumbnail.alt = `${currentWork.title} - 图片 ${index + 1}`;
        thumbnail.className = 'thumbnail';
        if (index === 0) {
            thumbnail.classList.add('active');
            currentImageIndex = 0;
        }
        
        thumbnail.addEventListener('click', function() {
            // 更新主图，使用处理后的路径
            const mainImage = document.getElementById('mainImage');
            mainImage.src = thumbnailSrc;
            currentImageIndex = index;
            
            // 更新活动状态
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 重置放大状态
            imageScale = 1;
            imageRotation = 0;
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
    
    // 重新加载所有数据以确保包含所有类型
    loadAllDataForRelated().then(allData => {
        // 获取除当前作品外的所有作品
        const availableWorks = allData.filter(item => item.id !== currentWork.id);
        
        // 随机打乱并选择前3个
        const shuffled = availableWorks.sort(() => Math.random() - 0.5);
        const randomWorks = shuffled.slice(0, 3);
        
        randomWorks.forEach(work => {
            const card = createRelatedCard(work);
            relatedGrid.appendChild(card);
        });
    });
}

// 加载所有数据用于随机推荐
async function loadAllDataForRelated() {
    try {
        // 从GitHub加载完整数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载数据文件');
        }
        
        const data = await response.json();
        // 处理数据结构，添加缺失的默认值
        return data.map(item => ({
            ...item,
            type: item.type || item.category || 'building',
            downloads: item.downloads || 0,
            likes: item.likes || 0,
            views: item.views || 0
        }));
    } catch (error) {
        console.error('加载随机推荐数据失败:', error);
        return buildingsData; // 降级使用buildingsData
    }
}

// 创建相关作品卡片
function createRelatedCard(work) {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.style.cursor = 'pointer';
    
    // 使用getTypeName函数正确显示类型
    console.log('随机推荐作品类型:', work.type); // 调试日志
    const typeTag = getTypeName(work.type);
    console.log('随机推荐类型标签:', typeTag); // 调试日志
    
    // 获取作品的标签
    const workTags = getWorkTags(work.tags);
    
    // 处理图片路径
    let workImagePath = work.image;
    if (workImagePath && !workImagePath.startsWith('http') && !workImagePath.startsWith('../')) {
        workImagePath = '../' + workImagePath;
    }
    
    // 构建标签HTML
    let tagsHtml = '';
    if (work.tags && Array.isArray(work.tags) && tagsData.length > 0) {
        work.tags.forEach(tagId => {
            const tag = tagsData.find(t => t.id === tagId);
            if (tag) {
                // 判断颜色深浅，决定文字颜色
                const isLightColor = isColorLight(tag.color);
                const textColor = isLightColor ? '#333' : '#fff';
                
                tagsHtml += `<span class="building-tag" style="background: ${tag.color} !important; border-color: ${tag.color} !important; color: ${textColor} !important;">${tag.name}</span>`;
            }
        });
    }
    
    // 根据类型决定是否显示建筑尺寸
    let buildingSizeHtml = '';
    if (work.type === 'building') {
        buildingSizeHtml = `<span><i class="fas fa-cube"></i> ${work.buildingSize || '未知'}</span>`;
    }
    
    card.innerHTML = `
        <img src="${workImagePath}" alt="${work.title}" class="building-image" onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=暂无图片'">
        <div class="building-info">
            <h3 class="building-title">${work.title}</h3>
            <p class="building-author">作者: ${work.author}</p>
            <div class="building-stats">
                <div class="building-stats-left">
                    <span class="building-tag">${typeTag}</span>
                    ${tagsHtml}
                </div>
                <div class="building-stats-right">
                    <span><i class="fas fa-file"></i> ${work.size || work.fileSize || '未知'}</span>
                    ${buildingSizeHtml}
                </div>
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
        window.location.href = '../index.html';
    }
}

// 下载文件
function downloadFile() {
    if (currentWork) {
        // 检查是否有文件名或文件URL
        if (!currentWork.fileName && !currentWork.fileUrl) {
            showNotification('该作品暂无下载文件', 'error');
            return;
        }
        
        showNotification(`正在下载 ${currentWork.title}...`, 'info');
        
        let downloadUrl;
        let downloadFileName;
        
        // 优先使用文件URL
        if (currentWork.fileUrl && currentWork.fileUrl.trim() !== '') {
            downloadUrl = currentWork.fileUrl;
            // 从URL中提取文件名，如果没有则使用作品标题
            try {
                const urlPath = new URL(downloadUrl).pathname;
                downloadFileName = urlPath.split('/').pop() || `${currentWork.title}.${currentWork.fileFormat || 'zip'}`;
            } catch (e) {
                downloadFileName = `${currentWork.title}.${currentWork.fileFormat || 'zip'}`;
            }
        } else {
            // 使用本地文件
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
            } else {
                // 默认情况
                downloadPath = currentWork.fileName;
            }
            
            // 使用jsDelivr CDN加速下载
            downloadUrl = `https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/${downloadPath}`;
            downloadFileName = currentWork.fileName;
        }
        
        console.log('下载文件URL:', downloadUrl);
        
        // 创建隐藏的下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = downloadFileName;
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

// 获取类型名称
function getTypeName(type) {
    console.log('getTypeName输入类型:', type); // 调试日志
    const typeMap = {
        'building': '建筑',
        'tool': '工具',
        'music': '音乐',
        'command': '指令'
    };
    const result = typeMap[type] || '其他';
    console.log('getTypeName返回结果:', result); // 调试日志
    return result;
}

// 判断颜色是否为浅色
function isColorLight(color) {
    // 将十六进制颜色转换为RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 计算亮度
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // 返回true表示是浅色，false表示是深色
    return brightness > 155;
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
            link.addEventListener('click', function(e) {
                // 允许正常跳转，只关闭移动菜单
                console.log('移动端菜单项被点击:', this.href);
                navMenu.classList.remove('active');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '1';
                spans[2].style.transform = '';
                // 不阻止默认行为，让链接正常跳转
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

// 图片放大相关功能
function openImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const mainImage = document.getElementById('mainImage');
    
    modalImage.src = mainImage.src;
    modalImage.alt = mainImage.alt;
    modal.style.display = 'block';
    
    // 重置缩放和旋转，并居中图片
    imageScale = 1;
    imageRotation = 0;
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    modalImage.style.position = 'relative';
    updateImageTransform();
    
    // 添加拖动功能
    setupImageDrag();
    
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}



function zoomIn() {
    imageScale = Math.min(imageScale + 0.2, 3);
    updateImageTransform();
}

function zoomOut() {
    imageScale = Math.max(imageScale - 0.2, 0.5);
    updateImageTransform();
}

function resetZoom() {
    imageScale = 1;
    imageRotation = 0;
    const modalImage = document.getElementById('modalImage');
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    updateImageTransform();
}

function rotateImage() {
    imageRotation += 90;
    updateImageTransform();
}

function updateImageTransform() {
    const modalImage = document.getElementById('modalImage');
    modalImage.style.transform = `scale(${imageScale}) rotate(${imageRotation}deg)`;
    // 确保图片始终居中
    modalImage.style.position = 'relative';
    modalImage.style.left = '0';
    modalImage.style.top = '0';
}

// 设置图片拖动功能
function setupImageDrag() {
    const modalImage = document.getElementById('modalImage');
    
    modalImage.onmousedown = dragStart;
    modalImage.onmouseup = dragEnd;
    modalImage.onmouseleave = dragEnd;
    modalImage.onmousemove = drag;
    
    // 触摸事件支持
    modalImage.ontouchstart = dragStart;
    modalImage.ontouchend = dragEnd;
    modalImage.ontouchmove = drag;
}

function dragStart(e) {
    e.preventDefault();
    isDragging = true;
    
    const modalImage = document.getElementById('modalImage');
    
    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX - modalImage.offsetLeft;
        startY = e.touches[0].clientY - modalImage.offsetTop;
    } else {
        startX = e.clientX - modalImage.offsetLeft;
        startY = e.clientY - modalImage.offsetTop;
    }
    
    modalImage.style.cursor = 'grabbing';
}

function dragEnd(e) {
    isDragging = false;
    const modalImage = document.getElementById('modalImage');
    modalImage.style.cursor = 'grab';
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    
    const modalImage = document.getElementById('modalImage');
    let x, y;
    
    if (e.type === 'touchmove') {
        x = e.touches[0].clientX - startX;
        y = e.touches[0].clientY - startY;
    } else {
        x = e.clientX - startX;
        y = e.clientY - startY;
    }
    
    // 限制拖动范围
    const rect = modalImage.parentElement.getBoundingClientRect();
    const imgRect = modalImage.getBoundingClientRect();
    
    // 计算最大拖动距离
    const maxX = rect.width - imgRect.width;
    const maxY = rect.height - imgRect.height;
    
    // 应用限制
    x = Math.max(maxX, Math.min(0, x));
    y = Math.max(maxY, Math.min(0, y));
    
    modalImage.style.left = x + 'px';
    modalImage.style.top = y + 'px';
}

// ESC键关闭模态框
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('imageModal');
        if (modal.style.display === 'block') {
            closeImageModal();
        }
    }
});

// 点击模态框背景关闭
document.getElementById('imageModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageModal();
    }
});

// 添加鼠标滚轮缩放功能
document.getElementById('modalImage').addEventListener('wheel', function(e) {
    e.preventDefault();
    
    if (e.deltaY < 0) {
        // 向上滚动，放大
        imageScale = Math.min(imageScale + 0.1, 3);
    } else {
        // 向下滚动，缩小
        imageScale = Math.max(imageScale - 0.1, 0.5);
    }
    
    updateImageTransform();
}, { passive: false });