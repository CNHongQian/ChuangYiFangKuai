// 指令页面专用JavaScript
let commandPageData = [];
let tagsData = []; // 存储标签数据
let commandCurrentFilter = 'all';
let commandCurrentView = 'grid';
let commandDisplayedItems = 12;
const commandItemsPerPage = 12;

// 加载标签数据
async function loadTagsData() {
    try {
        // 从GitHub加载标签数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/tags.json';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载标签数据文件');
        }
        
        const data = await response.json();
        tagsData = data.tags;
        console.log('从GitHub加载的标签数据:', tagsData);
        
        // 生成过滤按钮
        generateFilterButtons();
    } catch (error) {
        console.error('从GitHub加载标签数据失败:', error);
        tagsData = [];
    }
}

// 生成过滤按钮
function generateFilterButtons() {
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;
    
    // 保留"全部"和"随机刷新"按钮
    const allButton = filterContainer.querySelector('[data-filter="all"]');
    const refreshButton = filterContainer.querySelector('#randomRefresh');
    
    // 清空现有按钮（除了保留的）
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    if (allButton) {
        filterContainer.appendChild(allButton);
    }
    
    // 根据当前页面类型添加相应的标签按钮
    const currentPageType = 'command'; // 当前是指令页面
    const relevantTags = tagsData.filter(tag => tag.category === currentPageType);
    
    relevantTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.setAttribute('data-filter', tag.name);
        button.textContent = tag.name;
        
        // 判断颜色深浅，决定文字颜色
        const isLightColor = isColorLight(tag.color);
        const textColor = isLightColor ? '#333' : '#fff';
        
        button.style.background = tag.color + ' !important';
        button.style.borderColor = tag.color + ' !important';
        button.style.color = textColor + ' !important';
        
        button.addEventListener('click', handleFilter);
        filterContainer.appendChild(button);
    });
    
    // 添加"随机刷新"按钮
    if (refreshButton) {
        filterContainer.appendChild(refreshButton);
    }
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

// 加载指令数据
async function loadCommandData() {
    try {
        // 尝试从GitHub仓库加载数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载数据文件');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            // 处理content_data.json中的数据结构，添加缺失的默认值
            // 只保留指令类型的数据
            commandPageData = data
                .filter(item => item.category === 'command' || item.type === 'command')
                .map(item => ({
                    ...item,
                    type: item.type || item.category || 'command',
                    downloads: item.downloads || 0,
                    likes: item.likes || 0,
                    views: item.views || 0
                }));
            
            console.log('从GitHub加载的指令数据:', commandPageData);
            
            // 如果没有指令数据，加载示例数据
            if (commandPageData.length === 0) {
                await loadSampleData();
            }
        } else {
            // 如果content_data.json为空，加载示例数据
            await loadSampleData();
        }
    } catch (error) {
        console.error('从GitHub加载数据失败，尝试本地数据:', error);
        
        // 如果GitHub加载失败，尝试本地数据
        try {
            const localResponse = await fetch('../data/content_data.json');
            if (!localResponse.ok) {
                throw new Error('无法加载本地数据文件');
            }
            const data = await localResponse.json();
            
            if (data && data.length > 0) {
                commandPageData = data
                    .filter(item => item.category === 'command' || item.type === 'command')
                    .map(item => ({
                        ...item,
                        type: item.type || item.category || 'command',
                        downloads: item.downloads || 0,
                        likes: item.likes || 0,
                        views: item.views || 0
                    }));
                
                console.log('从本地加载的指令数据:', commandPageData);
                
                if (commandPageData.length === 0) {
                    await loadSampleData();
                }
            } else {
                await loadSampleData();
            }
        } catch (localError) {
            console.error('本地数据也加载失败:', localError);
            await loadSampleData();
        }
    }
}

// 加载示例数据
async function loadSampleData() {
    try {
        const response = await fetch('../data/sample_data.json');
        const data = await response.json();
        // 过滤出指令类型的数据
        commandPageData = data.filter(item => item.type === 'command');
    } catch (error) {
        console.error('加载示例数据失败:', error);
        commandPageData = [];
    }
}

// 初始化指令页面
document.addEventListener('DOMContentLoaded', async function() {
    setupEventListeners();
    setupMobileMenu();
    
    // 检查是否有搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        document.getElementById('searchInput').value = decodeURIComponent(searchParam);
    }
    
    // 加载标签数据
    await loadTagsData();
    
    await loadCommandData();
    renderCommand();
});

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    searchInput.addEventListener('input', handleSearch);
    searchBtn.addEventListener('click', handleSearch);
    
    // 过滤按钮
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // 随机刷新按钮
    const refreshBtn = document.getElementById('randomRefresh');
    refreshBtn.addEventListener('click', handleRandomRefresh);
    
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

// 渲染指令内容
function renderCommand() {
    const grid = document.getElementById('buildingsGrid');
    grid.innerHTML = '';
    
    let dataToShow = [...commandPageData];
    
    // 应用标签过滤
    if (commandCurrentFilter !== 'all') {
        dataToShow = dataToShow.filter(item => {
            // 检查标签名称是否匹配
            if (item.tags && Array.isArray(item.tags)) {
                const matchingTags = item.tags.map(tagId => {
                    const tag = tagsData.find(t => t.id === tagId);
                    return tag ? tag.name : null;
                }).filter(name => name !== null);
                
                return matchingTags.includes(commandCurrentFilter);
            }
            return false;
        });
    }
    
    // 应用搜索
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        dataToShow = dataToShow.filter(item => 
            (item.title && item.title.toLowerCase().includes(searchTerm)) ||
            (item.author && item.author.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // 显示所有匹配的项目（不限制数量）
    const itemsToDisplay = dataToShow;
    
    itemsToDisplay.forEach((command, index) => {
        const card = createCommandCard(command);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1; width: 100%; display: flex; justify-content: center; align-items: center;">没有找到相关指令作品</div>';
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

// 创建指令卡片
function createCommandCard(command) {
    const card = document.createElement('div');
    card.className = 'building-card';
    
    const cardInner = document.createElement('div');
    cardInner.onclick = () => goToDetail(command);
    
    // 使用getTypeName函数获取类型名称
    const typeTag = getTypeName(command.type);
    
    // 获取作品的标签
    const workTags = getWorkTags(command.tags);
    
    // 处理图片路径，确保使用正确的相对路径
    let imagePath = command.image;
    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('../')) {
        imagePath = '../' + imagePath;
    }
    
    // 构建标签HTML
    let tagsHtml = '';
    if (command.tags && Array.isArray(command.tags) && tagsData.length > 0) {
        command.tags.forEach(tagId => {
            const tag = tagsData.find(t => t.id === tagId);
            if (tag) {
                // 判断颜色深浅，决定文字颜色
                const isLightColor = isColorLight(tag.color);
                const textColor = isLightColor ? '#333' : '#fff';
                
                tagsHtml += `<span class="building-tag" style="background: ${tag.color} !important; border-color: ${tag.color} !important; color: ${textColor} !important;">${tag.name}</span>`;
            }
        });
    }
    
    cardInner.innerHTML = `
        <img src="${imagePath}" alt="${command.title}" class="building-image" onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=暂无图片'">
        <div class="building-info">
            <h3 class="building-title">${command.title}</h3>
            <p class="building-author">作者: ${command.author || '未知'}</p>
            <div class="building-stats">
                <div class="building-stats-left">
                    <span class="building-tag">${typeTag}</span>
                    ${tagsHtml}
                </div>
                <div class="building-stats-right">
                    <span><i class="fas fa-file"></i> ${command.size || command.fileSize || '未知'}</span>
                    <span><i class="fas fa-code"></i> ${command.fileFormat || '未知'}</span>
                    <span><i class="fas fa-terminal"></i> 指令</span>
                </div>
            </div>
        </div>
    `;
    
    // 添加分享按钮
    const shareBtn = document.createElement('button');
    shareBtn.className = 'card-share-btn';
    shareBtn.innerHTML = '<i class="fas fa-share"></i>';
    shareBtn.onclick = (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        shareWorkFromCard(command);
    };
    
    card.appendChild(cardInner);
    card.appendChild(shareBtn);
    
    return card;
}

// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        'building': '建筑',
        'tool': '工具',
        'music': '音乐',
        'command': '指令'
    };
    return categoryMap[category] || '其他';
}

// 获取类型名称
function getTypeName(type) {
    const typeMap = {
        'building': '建筑',
        'tool': '工具',
        'music': '音乐',
        'command': '指令'
    };
    return typeMap[type] || '其他';
}

// 搜索处理
function handleSearch() {
    renderCommand();
}

// 过滤处理
function handleFilter(event) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    commandCurrentFilter = event.target.dataset.filter;
    renderCommand();
}

// 随机刷新处理
function handleRandomRefresh() {
    commandPageData = [...commandPageData].sort(() => Math.random() - 0.5);
    renderCommand();
}

// 视图切换
function handleViewChange(event) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    commandCurrentView = event.target.dataset.view;
    const grid = document.getElementById('buildingsGrid');
    
    if (commandCurrentView === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// 跳转到详情页面
function goToDetail(command) {
    // 保存当前作品到localStorage
    localStorage.setItem('currentWork', JSON.stringify(command));
    
    // 跳转到详情页
    window.location.href = `detail.html?id=${command.id}`;
}

// 从卡片分享作品
function shareWorkFromCard(command) {
    // 构建详情页URL - 确保在GitHub Pages上正常工作
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes('/pages/');
    let detailUrl;
    
    if (isInPagesDir) {
        // 如果已经在pages目录中，使用相对路径
        detailUrl = `detail.html?id=${command.id}`;
    } else {
        // 如果在根目录，使用完整路径
        detailUrl = `pages/detail.html?id=${command.id}`;
    }
    
    // 构建完整URL用于分享
    const fullUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + detailUrl;
    
    const workType = getTypeName(command.type);
    const shareText = `快来看看！我在"创艺方块"发现了一个好东西！\n${workType}: ${command.title}\n快点击链接查看下载吧：${fullUrl}`;
    
    // 复制格式化的文本
    copyToClipboard(shareText);
    showNotification('链接已复制到剪贴板！', 'success');
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

// 键盘事件监听
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});