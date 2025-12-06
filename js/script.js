let buildingsData = [];

// 从GitHub仓库JSON文件加载数据
async function loadBuildingsData() {
    try {
        // 尝试从GitHub仓库加载数据
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json';
        const response = await fetch(githubUrl);
        
        if (!response.ok) {
            throw new Error('无法从GitHub加载数据文件');
        }
        
        const data = await response.json();
        // 处理数据结构，添加缺失的默认值
        buildingsData = data.map(item => ({
            ...item,
            type: item.type || 'building', // 默认为建筑类型
            downloads: item.downloads || 0,
            likes: item.likes || 0,
            views: item.views || 0
        }));
        console.log('从GitHub加载数据成功:', buildingsData.length, '个作品');
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
            console.log('从本地加载数据成功:', buildingsData.length, '个作品');
        } catch (localError) {
            console.error('本地数据也加载失败:', localError);
            // 如果都失败，使用默认数据
            buildingsData = getDefaultData();
        }
    }
}

// 默认数据（备用）
function getDefaultData() {
    return [
        {
            id: 1,
            title: "梦幻城堡",
            author: "建筑师小明",
            type: "building",
            category: "medieval",
            image: "https://via.placeholder.com/300x200/ff69b4/ffffff?text=梦幻城堡",
            coverImage: "https://via.placeholder.com/300x200/ff69b4/ffffff?text=梦幻城堡",
            description: "一座美丽的中世纪城堡，拥有高耸的塔楼和精美的装饰。",
            size: "15.2 MB",
            buildingSize: "64x64x80",
            date: "2025-11-28",
            downloads: 1234,
            likes: 567,
            views: 8901
        },
        {
            id: 2,
            title: "现代别墅",
            author: "设计师小红",
            type: "building",
            category: "modern",
            image: "https://via.placeholder.com/300x200/ff1493/ffffff?text=现代别墅",
            coverImage: "https://via.placeholder.com/300x200/ff1493/ffffff?text=现代别墅",
            description: "极简主义的现代别墅设计，采用大面积玻璃窗和开放式布局。",
            size: "8.7 MB",
            buildingSize: "32x32x40",
            date: "2025-11-27",
            downloads: 892,
            likes: 445,
            views: 5678
        }
    ];
}

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    // 首页不需要加载数据
    setupEventListeners();
});

let currentFilter = 'all';
let currentView = 'grid';
let currentSection = 'home'; // 添加缺失的变量
let displayedItems = {
    home: 6,
    buildings: 12,
    tools: 6
}; // 使用对象存储不同部分的显示项数
const itemsPerPage = 6;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    // 首页不需要渲染建筑卡片
});

// 设置事件监听器
function setupEventListeners() {
    // 设置移动端菜单
    setupMobileMenu();
    
    // 导航链接
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // 搜索功能 - 检查元素是否存在
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // 过滤按钮 - 检查元素是否存在
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // 随机刷新按钮
    const refreshBtn = document.getElementById('randomRefresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRandomRefresh);
    }
    
    // 视图切换按钮
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // 加载更多按钮
    const loadMoreBtns = document.querySelectorAll('.load-more-btn');
    loadMoreBtns.forEach(btn => {
        btn.addEventListener('click', loadMore);
    });
    
    // 模态框关闭按钮
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // 点击模态框外部关闭
    const modal = document.getElementById('detailModal');
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// 导航处理
function handleNavigation(event) {
    event.preventDefault();
    const section = event.target.dataset.section;
    showSection(section);
}

// 显示指定部分
function showSection(section) {
    // 更新导航状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    // 显示对应内容
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = section;
        renderBuildings();
    }
}

// 渲染建筑卡片
function renderBuildings() {
    // 首页不显示任何卡片，直接返回
    if (currentSection === 'home') {
        return;
    }
    
    let gridId = null;
    let dataToShow = [...buildingsData];
    
    // 根据当前部分选择数据和网格
    if (currentSection === 'buildings') {
        gridId = 'buildingsGrid';
        dataToShow = buildingsData.filter(item => item.type === 'building');
    } else if (currentSection === 'tools') {
        gridId = 'toolsGrid';
        dataToShow = buildingsData.filter(item => item.type === 'tool');
    } else {
        // 其他页面也不显示卡片
        return;
    }
    
    // 应用搜索和过滤
    if (currentFilter !== 'all') {
        dataToShow = dataToShow.filter(item => {
            // 处理不同的数据结构
            if (currentFilter === 'building') {
                return item.category === 'building' || item.type === 'building';
            }
            return item.category === currentFilter;
        });
    }
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        dataToShow = dataToShow.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    const grid = document.getElementById(gridId);
    if (!grid) {
        console.error(`找不到元素: ${gridId}`);
        return;
    }
    grid.innerHTML = '';
    
    // 限制显示数量
    const itemsToDisplay = dataToShow.slice(0, displayedItems[currentSection] || 6);
    
    itemsToDisplay.forEach((building, index) => {
        const card = createBuildingCard(building);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666;">没有找到相关作品</div>';
    }
    
    // 更新加载更多按钮状态
    updateLoadMoreButton(dataToShow.length);
}

// 更新加载更多按钮状态
function updateLoadMoreButton(totalItems) {
    const loadMoreBtn = document.querySelector(`#${currentSection}-section .load-more-btn`);
    if (loadMoreBtn) {
        if (displayedItems[currentSection] >= totalItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// 创建建筑卡片
function createBuildingCard(building) {
    const card = document.createElement('div');
    card.className = 'building-card';
    card.onclick = () => showDetail(building);
    
    const typeTag = building.type === 'tool' ? '工具' : '建筑';
    const categoryTag = getCategoryName(building.category);
    
    card.innerHTML = `
        <img src="${building.image}" alt="${building.title}" class="building-image">
        <div class="building-info">
            <h3 class="building-title">${building.title}</h3>
            <p class="building-author">作者: ${building.author}</p>
            <div class="building-stats">
                <span class="building-tag">${typeTag}</span>
                <span class="building-tag">${categoryTag}</span>
                <span><i class="fas fa-download"></i> ${building.downloads}</span>
                <span><i class="fas fa-heart"></i> ${building.likes}</span>
            </div>
        </div>
    `;
    
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

// 随机刷新处理
function handleRandomRefresh() {
    // 随机排序数据
    const shuffled = [...buildingsData].sort(() => Math.random() - 0.5);
    buildingsData.length = 0; // 清空原数组
    buildingsData.push(...shuffled); // 添加随机排序的数据
    
    // 重置显示数量
    displayedItems[currentSection] = itemsPerPage;
    
    // 重新渲染
    renderBuildings();
    
    // 添加动画效果
    const refreshBtn = document.getElementById('randomRefresh');
    if (refreshBtn) {
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
    }
}

// 搜索处理
function handleSearch() {
    // 重置显示数量
    displayedItems[currentSection] = itemsPerPage;
    renderBuildings();
}

// 过滤处理
function handleFilter(event) {
    // 更新按钮状态
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFilter = event.target.dataset.filter;
    
    // 重置显示数量
    displayedItems[currentSection] = itemsPerPage;
    
    renderBuildings();
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
function loadMore(event) {
    const section = event.target.dataset.section || currentSection;
    displayedItems[section] = (displayedItems[section] || 6) + itemsPerPage;
    renderBuildings();
}

// 显示详细信息
function showDetail(building) {
    const modal = document.getElementById('detailModal');
    
    // 填充详细信息
    document.getElementById('detailImage').src = building.coverImage;
    document.getElementById('detailTitle').textContent = building.title;
    document.getElementById('detailAuthor').textContent = building.author;
    document.getElementById('detailDate').textContent = building.date;
    document.getElementById('detailSize').textContent = building.size;
    document.getElementById('detailDescription').textContent = building.description;
    document.getElementById('detailDownloads').textContent = building.downloads;
    document.getElementById('detailLikes').textContent = building.likes;
    document.getElementById('detailViews').textContent = building.views;
    
    // 显示模态框
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 添加键盘事件监听
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

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

// 添加滚动动画
function addScrollAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, {
        threshold: 0.1
    });
    
    document.querySelectorAll('.building-card').forEach(card => {
        observer.observe(card);
    });
}

// 页面加载完成后添加滚动动画
window.addEventListener('load', addScrollAnimation);