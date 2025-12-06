// 音乐页面专用JavaScript
let musicPageData = [];

// 加载音乐数据
async function loadMusicData() {
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
            // 只保留音乐类型的数据
            musicPageData = data
                .filter(item => item.category === 'music' || item.type === 'music')
                .map(item => ({
                    ...item,
                    type: item.type || item.category || 'music',
                    downloads: item.downloads || 0,
                    likes: item.likes || 0,
                    views: item.views || 0
                }));
            
            console.log('从GitHub加载的音乐数据:', musicPageData);
            
            // 如果没有音乐数据，加载示例数据
            if (musicPageData.length === 0) {
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
                musicPageData = data
                    .filter(item => item.category === 'music' || item.type === 'music')
                    .map(item => ({
                        ...item,
                        type: item.type || item.category || 'music',
                        downloads: item.downloads || 0,
                        likes: item.likes || 0,
                        views: item.views || 0
                    }));
                
                console.log('从本地加载的音乐数据:', musicPageData);
                
                if (musicPageData.length === 0) {
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
        // 过滤出音乐类型的数据
        musicPageData = data.filter(item => item.type === 'music');
    } catch (error) {
        console.error('加载示例数据失败:', error);
        musicPageData = [];
    }
}

// 初始化音乐页面
document.addEventListener('DOMContentLoaded', async function() {
    setupEventListeners();
    setupMobileMenu();
    
    // 检查是否有搜索参数
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        document.getElementById('searchInput').value = decodeURIComponent(searchParam);
    }
    
    await loadMusicData();
    renderMusic();
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

// 渲染音乐内容
function renderMusic() {
    const grid = document.getElementById('buildingsGrid');
    grid.innerHTML = '';
    
    let dataToShow = [...musicPageData];
    
    // 应用过滤
    if (currentFilter !== 'all') {
        dataToShow = dataToShow.filter(item => item.category === currentFilter);
    }
    
    // 应用搜索
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        dataToShow = dataToShow.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // 限制显示数量
    const itemsToDisplay = dataToShow.slice(0, displayedItems);
    
    itemsToDisplay.forEach((music, index) => {
        const card = createMusicCard(music);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666;">没有找到相关音乐作品</div>';
    }
    
    updateLoadMoreButton(dataToShow.length);
}

// 创建音乐卡片
function createMusicCard(music) {
    const card = document.createElement('div');
    card.className = 'building-card';
    
    const cardInner = document.createElement('div');
    cardInner.onclick = () => goToDetail(music);
    
    const typeTag = music.type === 'tool' ? '工具' : '音乐';
    const categoryTag = getCategoryName(music.category);
    
    cardInner.innerHTML = `
        <img src="${music.image}" alt="${music.title}" class="building-image">
        <div class="building-info">
            <h3 class="building-title">${music.title}</h3>
            <p class="building-author">作者: ${music.author}</p>
            <div class="building-stats">
                <span class="building-tag">${typeTag}</span>
                <span class="building-tag">${categoryTag}</span>
                <span><i class="fas fa-file"></i> ${music.fileSize}</span>
                <span><i class="fas fa-code"></i> ${music.fileFormat || '未知'}</span>
                <span><i class="fas fa-music"></i> 音乐</span>
            </div>
        </div>
    `;
    
    // 添加分享按钮
    const shareBtn = document.createElement('button');
    shareBtn.className = 'card-share-btn';
    shareBtn.innerHTML = '<i class="fas fa-share"></i>';
    shareBtn.onclick = (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        shareWorkFromCard(music);
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

// 搜索处理
function handleSearch() {
    displayedItems = itemsPerPage;
    renderMusic();
}

// 过滤处理
function handleFilter(event) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFilter = event.target.dataset.filter;
    displayedItems = itemsPerPage;
    renderMusic();
}

// 随机刷新处理
function handleRandomRefresh() {
    musicPageData = [...musicPageData].sort(() => Math.random() - 0.5);
    displayedItems = itemsPerPage;
    renderMusic();
    
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
    
    currentView = event.target.dataset.view;
    const grid = document.getElementById('buildingsGrid');
    
    if (currentView === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// 加载更多
function loadMore() {
    displayedItems += itemsPerPage;
    renderMusic();
}

// 更新加载更多按钮状态
function updateLoadMoreButton(totalItems) {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (displayedItems >= totalItems) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 跳转到详情页面
function goToDetail(music) {
    // 保存当前作品到localStorage
    localStorage.setItem('currentWork', JSON.stringify(music));
    
    // 跳转到详情页
    window.location.href = `detail.html?id=${music.id}`;
}

// 从卡片分享作品
function shareWorkFromCard(music) {
    // 构建详情页URL - 确保在GitHub Pages上正常工作
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes('/pages/');
    let detailUrl;
    
    if (isInPagesDir) {
        // 如果已经在pages目录中，使用相对路径
        detailUrl = `detail.html?id=${music.id}`;
    } else {
        // 如果在根目录，使用完整路径
        detailUrl = `pages/detail.html?id=${music.id}`;
    }
    
    // 构建完整URL用于分享
    const fullUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + detailUrl;
    
    const workType = music.type === 'music' ? '音乐' : '建筑';
    const shareText = `快来看看！我在"创艺方块"发现了一个好东西！\n${workType}: ${music.title}\n快点击链接查看下载吧：${fullUrl}`;
    
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