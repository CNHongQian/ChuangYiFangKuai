// 建筑页面专用JavaScript
let buildingsPageData = [];
let buildingsCurrentFilter = 'all'; // 重命名以避免冲突
let buildingsCurrentView = 'grid'; // 重命名以避免冲突
let buildingsDisplayedItems = 12; // 重命名以避免冲突
const buildingsItemsPerPage = 12; // 重命名以避免冲突

// 加载建筑数据
async function loadBuildingsData() {
    console.log('开始加载建筑数据...');
    
    // 只从GitHub加载数据
    try {
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json';
        console.log('尝试从GitHub加载数据:', githubUrl);
        
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch(githubUrl, {
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        console.log('GitHub响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`GitHub请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GitHub原始数据:', data);
        
        if (data && data.length > 0) {
            // 处理content_data.json中的数据结构，添加缺失的默认值
            // 只保留建筑类型的数据
            buildingsPageData = data
                .filter(item => {
                    console.log('过滤项目:', item, 'category:', item.category, 'type:', item.type);
                    return item.category === 'building' || item.type === 'building';
                })
                .map(item => ({
                    ...item,
                    type: item.type || item.category || 'building', // 使用category作为type的备用值
                    downloads: item.downloads || 0,
                    likes: item.likes || 0,
                    views: item.views || 0
                }));
            
            console.log('从GitHub加载的建筑数据:', buildingsPageData);
            
            if (buildingsPageData.length > 0) {
                // 确保数据加载完成后渲染
                console.log('GitHub数据加载完成，开始渲染，数据量:', buildingsPageData.length);
                renderBuildings();
                return;
            } else {
                console.log('GitHub数据中没有找到建筑类型的项目');
            }
        } else {
            console.log('GitHub数据为空');
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('GitHub请求超时:', error);
        } else {
            console.error('从GitHub加载数据失败:', error);
        }
    }
    
    // 数据加载失败，保持空数组
    buildingsPageData = [];
    console.log('数据加载失败，不显示任何内容');
    
    // 仍然调用渲染函数以显示"没有找到相关建筑作品"消息
    renderBuildings();
}

// 加载示例数据
async function loadSampleData() {
    try {
        console.log('开始加载示例数据...');
        const response = await fetch('../data/sample_data.json');
        if (!response.ok) {
            throw new Error('无法加载示例数据文件');
        }
        const data = await response.json();
        console.log('示例原始数据:', data);
        
        // 过滤出建筑类型的数据（sample_data.json使用type字段）
        buildingsPageData = data.filter(item => item.type === 'building');
        console.log('过滤后的建筑示例数据:', buildingsPageData);
        
        // 确保数据有必要的字段
        buildingsPageData = buildingsPageData.map(item => ({
            ...item,
            downloads: item.downloads || 0,
            likes: item.likes || 0,
            views: item.views || 0
        }));
    } catch (error) {
        console.error('加载示例数据失败:', error);
        buildingsPageData = [];
    }
}

// 初始化建筑页面
document.addEventListener('DOMContentLoaded', async function() {
    setupEventListeners();
    setupMobileMenu();
    
    // 检查是否有搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        document.getElementById('searchInput').value = decodeURIComponent(searchParam);
    }
    
    // 加载数据（会在加载完成后自动渲染）
    await loadBuildingsData();
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
    
    // 加载更多按钮
    const loadMoreBtn = document.querySelector('.load-more-btn');
    loadMoreBtn.addEventListener('click', loadMore);
    
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

// 渲染建筑内容
function renderBuildings() {
    const grid = document.getElementById('buildingsGrid');
    if (!grid) {
        console.error('找不到 buildingsGrid 元素');
        return;
    }
    
    grid.innerHTML = '';
    
    console.log('当前建筑数据:', buildingsPageData);
    
    let dataToShow = [...buildingsPageData];
    
    // 应用搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            dataToShow = dataToShow.filter(item => 
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.author && item.author.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
        }
    }
    
    // 限制显示数量
    const itemsToDisplay = dataToShow.slice(0, buildingsDisplayedItems);
    
    console.log('要显示的数据:', itemsToDisplay);
    
    itemsToDisplay.forEach((building, index) => {
        const card = createBuildingCard(building);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666;">没有找到相关建筑作品</div>';
    }
    
    updateLoadMoreButton(dataToShow.length);
}

// 创建建筑卡片
function createBuildingCard(building) {
    const card = document.createElement('div');
    card.className = 'building-card';
    
    const cardInner = document.createElement('div');
    cardInner.onclick = () => goToDetail(building);
    
    const categoryTag = getCategoryName(building.category);
    
    // 处理图片路径，确保使用正确的相对路径
    let imagePath = building.image;
    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('../')) {
        imagePath = '../' + imagePath;
    }
    
    cardInner.innerHTML = `
        <img src="${imagePath}" alt="${building.title}" class="building-image" onerror="this.src='https://via.placeholder.com/300x200/ff69b4/ffffff?text=暂无图片'">
        <div class="building-info">
            <h3 class="building-title">${building.title}</h3>
            <p class="building-author">作者: ${building.author || '未知'}</p>
            <div class="building-stats">
                <span class="building-tag">${categoryTag}</span>
                <span><i class="fas fa-file"></i> ${building.size || '未知'}</span>
                <span><i class="fas fa-cube"></i> ${building.buildingSize || '未知'}</span>
                <span><i class="fas fa-code"></i> ${building.fileFormat || '未知'}</span>
            </div>
        </div>
    `;
    
    // 添加分享按钮
    const shareBtn = document.createElement('button');
    shareBtn.className = 'card-share-btn';
    shareBtn.innerHTML = '<i class="fas fa-share"></i>';
    shareBtn.onclick = (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        shareWorkFromCard(building);
    };
    
    card.appendChild(cardInner);
    card.appendChild(shareBtn);
    
    return card;
}

// 获取分类名称
function getCategoryName(category) {
    const categoryMap = {
        'modern': '现代',
        'medieval': '中世纪',
        'pixel': '像素',
        'fantasy': '奇幻',
        'traditional': '传统'
    };
    return categoryMap[category] || '其他';
}

// 搜索处理
function handleSearch() {
    displayedItems = itemsPerPage;
    renderBuildings();
}

// 过滤处理
function handleFilter(event) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    buildingsCurrentFilter = event.target.dataset.filter;
    displayedItems = itemsPerPage;
    renderBuildings();
}

// 随机刷新处理
function handleRandomRefresh() {
    buildingsPageData = [...buildingsPageData].sort(() => Math.random() - 0.5);
    displayedItems = itemsPerPage;
    renderBuildings();
    
    const refreshBtn = document.getElementById('randomRefresh');
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
}

// 视图切换
function handleViewChange(event) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    buildingsCurrentView = event.target.dataset.view;
    const grid = document.getElementById('buildingsGrid');
    
    if (buildingsCurrentView === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// 加载更多
function loadMore() {
    buildingsDisplayedItems += buildingsItemsPerPage;
    renderBuildings();
}

// 更新加载更多按钮状态
function updateLoadMoreButton(totalItems) {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (buildingsDisplayedItems >= totalItems) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 跳转到详情页面
function goToDetail(building) {
    // 保存当前作品到localStorage
    localStorage.setItem('currentWork', JSON.stringify(building));
    
    // 跳转到详情页 - 使用绝对路径确保在GitHub Pages上正常工作
    window.location.href = `detail.html?id=${building.id}`;
}

// 从卡片分享作品
function shareWorkFromCard(building) {
    // 构建详情页URL - 确保在GitHub Pages上正常工作
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes('/pages/');
    let detailUrl;
    
    if (isInPagesDir) {
        // 如果已经在pages目录中，使用相对路径
        detailUrl = `detail.html?id=${building.id}`;
    } else {
        // 如果在根目录，使用完整路径
        detailUrl = `pages/detail.html?id=${building.id}`;
    }
    
    // 构建完整URL用于分享
    const fullUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + detailUrl;
    
    const workType = building.type === 'building' ? '建筑' : '工具';
    const shareText = `快来看看！我在"创艺方块"发现了一个好东西！\n${workType}: ${building.title}\n快点击链接查看下载吧：${fullUrl}`;
    
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