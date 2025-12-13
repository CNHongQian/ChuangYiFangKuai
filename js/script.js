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
        if (data && data.length > 0) {
            buildingsData = data;
            renderBuildings();
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
            buildingsData = data.map(item => ({
                ...item,
                type: item.type || 'building',
                downloads: item.downloads || 0,
                likes: item.likes || 0,
                views: item.views || 0
            }));
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
let currentFormatFilter = 'all'; // 添加格式筛选变量
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
    // 检查是否是详情页面，如果是则允许正常跳转
    if (window.location.pathname.includes('detail.html')) {
        // 详情页面不阻止默认行为，允许正常跳转
        return;
    }
    
    // 首页或其他页面使用SPA导航
    event.preventDefault();
    const section = event.target.dataset.section;
    if (section) {
        showSection(section);
    } else {
        // 如果没有data-section属性，使用默认跳转
        window.location.href = event.target.href;
    }
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
    
    const searchTerm = document.getElementById('searchInput').toLowerCase();
    if (searchTerm) {
        dataToShow = dataToShow.filter(item => 
            item.title.toLowerCase().includes(searchTerm) ||
            item.author.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            (item.fileFormat && item.fileFormat.toLowerCase().includes(searchTerm))
        );
    }
    
    // 应用格式筛选
    if (currentFormatFilter !== 'all') {
        dataToShow = dataToShow.filter(item => 
            item.fileFormat === currentFormatFilter || 
            (item.fileFormat && item.fileFormat.toLowerCase().includes(currentFormatFilter))
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
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1; width: 100%; display: flex; justify-content: center; align-items: center;">没有找到相关作品</div>';
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
    
    const typeTag = getTypeName(building.type);
    const categoryTag = getCategoryName(building.category);
    
    // 处理图片路径，使用CDN地址
    let imagePath = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png'; // 默认图片
    if (building.image && building.image.trim() !== '') {
        // 如果是相对路径，添加CDN前缀
        if (!building.image.startsWith('http')) {
            imagePath = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/' + building.image;
        } else {
            imagePath = building.image;
        }
    }
    
    card.innerHTML = `
        <img src="${imagePath}" alt="${building.title}" class="building-image" onerror="this.src='https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png'">
        <div class="building-info">
            <h3 class="building-title">${building.title}</h3>
            <p class="building-author">作者: ${building.author}</p>
            <div class="building-stats">
                <div class="building-stats-left">
                    <span class="building-tag">${typeTag}</span>
                    <span class="building-tag">${categoryTag}</span>
                </div>
                <div class="building-stats-right">
                    <span><i class="fas fa-download"></i> ${building.downloads}</span>
                    <span><i class="fas fa-heart"></i> ${building.likes}</span>
                </div>
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

// 随机刷新处理
function handleRandomRefresh() {
    // 随机打乱数据
    buildingsData = [...buildingsData].sort(() => Math.random() - 0.5);
    renderContent();
}

// 搜索处理
function handleSearch() {
    // 重置显示数量
    displayedItems[currentSection] = itemsPerPage;
    renderBuildings();
}

// 格式筛选功能
function handleFormatFilter() {
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFormatFilter = event.target.dataset.format;
    
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
    
    currentFilter = event.target.filter;
    
    // 重置显示数量
    displayedItems[currentSection] = itemsPerPage;
    
    renderBuildings();
}

// 格式筛选处理
function handleFormatFilter(event) {
    // 更新按钮状态
    const formatButtons = document.querySelectorAll('.format-btn');
    formatButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFormatFilter = event.target.dataset.format;
    
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

// 全局主题加载功能
const themePresets = [
    {
        id: 'pink',
        name: '粉白渐变',
        description: '温馨浪漫的粉白渐变主题',
        primary: '#ff69b4',
        secondary: '#ff1493',
        text: '#d63384',
        background: '#ffffff'
    },
    {
        id: 'blue',
        name: '蓝白清新',
        description: '清新自然的蓝白渐变主题',
        primary: '#4285f4',
        secondary: '#1a73e8',
        text: '#1a73e8',
        background: '#ffffff'
    },
    {
        id: 'green',
        name: '绿色自然',
        description: '自然清新的绿色渐变主题',
        primary: '#34a853',
        secondary: '#0f9d58',
        text: '#0f9d58',
        background: '#ffffff'
    },
    {
        id: 'purple',
        name: '紫色梦幻',
        description: '神秘梦幻的紫色渐变主题',
        primary: '#9c27b0',
        secondary: '#7b1fa2',
        text: '#7b1fa2',
        background: '#ffffff'
    },
    {
        id: 'orange',
        name: '橙色活力',
        description: '充满活力的橙色渐变主题',
        primary: '#ff9800',
        secondary: '#f57c00',
        text: '#f57c00',
        background: '#ffffff'
    },
    {
        id: 'dark',
        name: '深色模式',
        description: '护眼的深色主题',
        primary: '#bb86fc',
        secondary: '#6200ee',
        text: '#bb86fc',
        background: '#121212'
    }
];

// 加载保存的主题
function loadGlobalTheme() {
    const savedTheme = localStorage.getItem('chuangyi-theme');
    if (savedTheme) {
        try {
            const currentTheme = JSON.parse(savedTheme);
            // 如果是自定义主题，则使用默认主题
            if (currentTheme.id === 'custom') {
                applyGlobalTheme(themePresets[0]);
            } else {
                applyGlobalTheme(currentTheme);
            }
        } catch (error) {
            console.error('加载保存的主题失败:', error);
            applyGlobalTheme(themePresets[0]);
        }
    } else {
        applyGlobalTheme(themePresets[0]);
    }
}

// 获取主题变量
function getThemeVariables(themeId) {
    const themes = {
        light: {
            '--primary-color': '#ff69b4',
            '--secondary-color': '#ff1493',
            '--accent-color': '#c71585',
            '--primary-light': '#ffeef8',
            '--primary-medium': '#fff5f7',
            '--primary-dark': '#ffd1dc',
            '--text-primary': '#333',
            '--text-secondary': '#666',
            '--text-muted': '#888',
            '--background-start': '#ffeef8',
            '--background-25': '#fff5f7',
            '--background-50': '#fff0f5',
            '--background-75': '#ffe4e1',
            '--background-end': '#ffd1dc',
            '--card-bg': 'rgba(255, 255, 255, 0.95)',
            '--card-border': 'rgba(255, 192, 203, 0.3)',
            '--card-shadow': 'rgba(255, 192, 203, 0.2)',
            '--card-hover-shadow': 'rgba(255, 192, 203, 0.3)',
            '--transition-speed': '0.3s',
            '--animation-duration': '15s'
        },
        dark: {
            '--primary-color': '#bb86fc',
            '--secondary-color': '#3700b3',
            '--accent-color': '#6200ee',
            '--primary-light': '#1a1a2e',
            '--primary-medium': '#16213e',
            '--primary-dark': '#0f3460',
            '--text-primary': '#e0e0e0',
            '--text-secondary': '#b0b0b0',
            '--text-muted': '#808080',
            '--background-start': '#1a1a2e',
            '--background-25': '#16213e',
            '--background-50': '#0f3460',
            '--background-75': '#533483',
            '--background-end': '#e94560',
            '--card-bg': 'rgba(30, 30, 46, 0.95)',
            '--card-border': 'rgba(187, 134, 252, 0.3)',
            '--card-shadow': 'rgba(187, 134, 252, 0.2)',
            '--card-hover-shadow': 'rgba(187, 134, 252, 0.4)',
            '--transition-speed': '0.3s',
            '--animation-duration': '20s'
        },
        blue: {
            '--primary-color': '#4facfe',
            '--secondary-color': '#00f2fe',
            '--accent-color': '#0099ff',
            '--primary-light': '#e6f7ff',
            '--primary-medium': '#bae7ff',
            '--primary-dark': '#91d5ff',
            '--text-primary': '#262626',
            '--text-secondary': '#595959',
            '--text-muted': '#8c8c8c',
            '--background-start': '#e6f7ff',
            '--background-25': '#bae7ff',
            '--background-50': '#91d5ff',
            '--background-75': '#69c0ff',
            '--background-end': '#40a9ff',
            '--card-bg': 'rgba(255, 255, 255, 0.95)',
            '--card-border': 'rgba(79, 172, 254, 0.3)',
            '--card-shadow': 'rgba(79, 172, 254, 0.2)',
            '--card-hover-shadow': 'rgba(79, 172, 254, 0.3)',
            '--transition-speed': '0.3s',
            '--animation-duration': '18s'
        },
        green: {
            '--primary-color': '#52c41a',
            '--secondary-color': '#389e0d',
            '--accent-color': '#237804',
            '--primary-light': '#f6ffed',
            '--primary-medium': '#d9f7be',
            '--primary-dark': '#b7eb8f',
            '--text-primary': '#262626',
            '--text-secondary': '#595959',
            '--text-muted': '#8c8c8c',
            '--background-start': '#f6ffed',
            '--background-25': '#d9f7be',
            '--background-50': '#b7eb8f',
            '--background-75': '#95de64',
            '--background-end': '#73d13d',
            '--card-bg': 'rgba(255, 255, 255, 0.95)',
            '--card-border': 'rgba(82, 196, 26, 0.3)',
            '--card-shadow': 'rgba(82, 196, 26, 0.2)',
            '--card-hover-shadow': 'rgba(82, 196, 26, 0.3)',
            '--transition-speed': '0.3s',
            '--animation-duration': '16s'
        }
    };
    
    return themes[themeId] || themes.light;
}

// 应用全局主题
function applyGlobalTheme(theme) {
    // 根据主题ID设置完整的主题变量
    const themeVariables = getThemeVariables(theme.id);
    
    // 设置CSS变量
    const root = document.documentElement;
    Object.keys(themeVariables).forEach(key => {
        root.style.setProperty(key, themeVariables[key]);
    });
    
    // 创建动态样式
    let dynamicStyle = document.getElementById('global-theme-style');
    if (!dynamicStyle) {
        dynamicStyle = document.createElement('style');
        dynamicStyle.id = 'global-theme-style';
        document.head.appendChild(dynamicStyle);
    }
    
    // 设置空的CSS，让CSS变量生效
    dynamicStyle.textContent = '';
}

// 页面加载时应用主题
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadGlobalTheme();
    }, 100);
});