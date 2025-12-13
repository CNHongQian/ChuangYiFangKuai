// 建筑页面专用JavaScript
let buildingsPageData = [];
let buildingsCurrentFilter = 'all'; // 重命名以避免冲突
let buildingsCurrentFormatFilter = 'all'; // 添加格式筛选变量
let buildingsCurrentView = 'grid'; // 重命名以避免冲突
let tagsData = []; // 存储标签数据

// 分页相关变量
let currentPage = 1;
const buildingsItemsPerPage = 12;
let filteredData = [];

// 显示加载状态
function showLoadingState() {
    const grid = document.getElementById('buildingsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 创建骨架屏
    for (let i = 0; i < 6; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'skeleton-card';
        skeletonCard.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
            </div>
        `;
        grid.appendChild(skeletonCard);
    }
}

// 隐藏加载状态
function hideLoadingState() {
    const skeletonCards = document.querySelectorAll('.skeleton-card');
    skeletonCards.forEach(card => {
        card.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => card.remove(), 300);
    });
}

// 加载建筑数据
async function loadBuildingsData() {
    // 显示加载状态
    showLoadingState();
    
    // 只从GitHub加载数据
    try {
        // 添加时间戳防止缓存
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json?t=' + Date.now();
        
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch(githubUrl, {
            signal: controller.signal,
            mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`GitHub请求失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            // 处理content_data.json中的数据结构，添加缺失的默认值
            // 只保留建筑类型的数据
            buildingsPageData = data
                .filter(item => {
                    // 检查category值的确切类型
                    const isBuilding = item.category === 'building' || item.type === 'building';
                    return isBuilding;
                })
                .map(item => ({
                    ...item,
                    type: item.type || item.category || 'building', // 使用category作为type的备用值
                    downloads: item.downloads || 0,
                    likes: item.likes || 0,
                    views: item.views || 0
                }));
            
            if (buildingsPageData.length > 0) {
                // 动态生成格式选项
                generateFormatOptions();
                
                // 隐藏加载状态
                hideLoadingState();
                
                // 确保数据加载完成后渲染
                renderBuildings();
                return;
            } else {
                hideLoadingState();
            }
        } else {
            hideLoadingState();
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
    
    // 隐藏加载状态
    hideLoadingState();
    
    // 仍然调用渲染函数以显示"没有找到相关建筑作品"消息
    renderBuildings();
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
    const refreshButton = document.querySelector('#randomRefresh');
    
    // 清空现有按钮（除了保留的）
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    if (allButton) {
        filterContainer.appendChild(allButton);
    }
    
    // 根据当前页面类型添加相应的标签按钮
    const currentPageType = 'building'; // 当前是建筑页面
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
}

// 动态生成格式选项
function generateFormatOptions() {
    const formatSelect = document.getElementById('formatSelect');
    if (!formatSelect) return;
    
    // 收集所有可用的文件格式
    const formats = new Set();
    buildingsPageData.forEach(item => {
        if (item.fileFormat) {
            formats.add(item.fileFormat);
        }
    });
    
    // 创建自定义下拉菜单
    createCustomDropdown('formatSelect', Array.from(formats).sort());
}

// 创建自定义下拉菜单
function createCustomDropdown(selectId, formats) {
    const formatFilter = document.querySelector('.format-filter');
    if (!formatFilter) return;
    
    // 获取原始的select元素
    const originalSelect = document.getElementById(selectId);
    if (!originalSelect) return;
    
    // 创建自定义下拉菜单容器
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-dropdown';
    dropdown.id = selectId + '-custom';
    
    // 创建触发器
    const trigger = document.createElement('div');
    trigger.className = 'custom-dropdown-trigger';
    trigger.innerHTML = `
        <span class="dropdown-text">全部格式</span>
        <span class="custom-dropdown-arrow"></span>
    `;
    
    // 创建下拉菜单
    const menu = document.createElement('div');
    menu.className = 'custom-dropdown-menu';
    
    // 添加"全部格式"选项
    const allItem = document.createElement('div');
    allItem.className = 'custom-dropdown-item selected';
    allItem.setAttribute('data-value', 'all');
    allItem.textContent = '全部格式';
    menu.appendChild(allItem);
    
    // 设置默认值为"全部格式"
    originalSelect.value = 'all';
    
    // 添加格式选项
    formats.forEach(format => {
        const item = document.createElement('div');
        item.className = 'custom-dropdown-item';
        item.setAttribute('data-value', format);
        item.textContent = format.toUpperCase();
        menu.appendChild(item);
    });
    
    // 组装下拉菜单
    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    
    // 替换原有的select元素
    if (originalSelect) {
        originalSelect.parentNode.insertBefore(dropdown, originalSelect);
        originalSelect.style.display = 'none';
    }
    
    // 添加点击事件
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        
        // 关闭其他下拉菜单
        document.querySelectorAll('.custom-dropdown.active').forEach(other => {
            if (other !== dropdown) {
                other.classList.remove('active');
            }
        });
    });
    
    // 添加选项点击事件
    menu.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = e.target.closest('.custom-dropdown-item');
        if (!item) return;
        
        // 更新选中状态
        menu.querySelectorAll('.custom-dropdown-item').forEach(i => {
            i.classList.remove('selected');
        });
        item.classList.add('selected');
        
        // 更新触发器文本
        trigger.querySelector('.dropdown-text').textContent = item.textContent;
        
        // 更新隐藏的select元素
        if (originalSelect) {
            const selectedValue = item.getAttribute('data-value');
            
            // 确保select元素有对应的option
            let option = Array.from(originalSelect.options).find(opt => opt.value === selectedValue);
            if (!option) {
                // 如果没有对应的option，创建一个
                option = document.createElement('option');
                option.value = selectedValue;
                option.textContent = selectedValue.toUpperCase();
                originalSelect.appendChild(option);
            }
            
            // 设置select元素的值和selectedIndex
            originalSelect.value = selectedValue;
            originalSelect.selectedIndex = Array.from(originalSelect.options).findIndex(opt => opt.value === selectedValue);
            
            // 直接调用格式筛选处理函数
            buildingsCurrentFormatFilter = selectedValue;
            
            // 触发change事件
            const event = new Event('change', { bubbles: true });
            originalSelect.dispatchEvent(event);
            
            // 立即渲染
            renderBuildings();
        }
        
        // 关闭下拉菜单
        dropdown.classList.remove('active');
    });
    
    // 点击外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
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

// 加载示例数据
async function loadSampleData() {
    try {
        const response = await fetch('../data/sample_data.json');
        if (!response.ok) {
            throw new Error('无法加载示例数据文件');
        }
        const data = await response.json();
        
        // 过滤出建筑类型的数据（sample_data.json使用type字段）
        buildingsPageData = data.filter(item => item.type === 'building');
        
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
    
    // 初始化懒加载
    initLazyLoading();
    
    
    
    // 加载标签数据
    await loadTagsData();
    
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
    
    // 格式筛选
    const formatSelect = document.getElementById('formatSelect');
    if (formatSelect) {
        formatSelect.addEventListener('change', handleFormatFilter);
    }
    
    // 随机刷新按钮
    const refreshBtn = document.getElementById('randomRefresh');
    refreshBtn.addEventListener('click', handleRandomRefresh);
    
    // 视图切换按钮
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // 分页按钮
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / buildingsItemsPerPage);
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
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

// 图片懒加载观察器
let imageObserver = null;

// 初始化图片懒加载
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        img.src = src;
                        img.onload = () => {
                            img.classList.add('loaded');
                            img.classList.remove('loading');
                        };
                        img.classList.remove('lazy-image');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });
    }
}

// 检测WebP支持
let webpSupported = false;
(function checkWebPSupport() {
    const webP = new Image();
    webP.onload = webP.onerror = function() {
        webpSupported = (webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
})();

// 转换为WebP格式（如果支持）
function getOptimizedImageUrl(originalSrc, isHighQuality = false) {
    if (!originalSrc) {
        return originalSrc;
    }
    
    // 如果用户要求高质量，返回原始URL
    if (isHighQuality) {
        return originalSrc;
    }
    
    // 对于GitHub/CDN图片，转换为WebP格式
    if (originalSrc.includes('cdn.jsdelivr.net')) {
        // 替换为WebP格式
        if (originalSrc.includes('?')) {
            return originalSrc + '&format=webp';
        } else {
            return originalSrc + '?format=webp';
        }
    }
    
    // 对于本地图片，保持原格式
    return originalSrc;
}

// Cookie操作函数
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 创建优化后的懒加载图片
function createLazyImage(src, alt, className) {
    const img = document.createElement('img');
    img.className = `lazy-image loading ${className}`;
    img.alt = alt;
    
    // 获取优化后的图片URL
    const optimizedSrc = getOptimizedImageUrl(src);
    img.dataset.src = optimizedSrc;
    img.dataset.originalSrc = src; // 保存原始URL作为备用
    
    if (imageObserver) {
        imageObserver.observe(img);
    } else {
        // 降级处理：直接加载图片
        img.src = optimizedSrc;
        img.onload = () => {
            img.classList.add('loaded');
            img.classList.remove('loading');
        };
        img.onerror = () => {
            // 如果WebP加载失败，尝试原始格式
            if (optimizedSrc !== src) {
                img.src = src;
                img.onload = () => {
                    img.classList.add('loaded');
                    img.classList.remove('loading');
                };
            } else {
                // 如果原始格式也失败，使用默认图片
                img.src = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png';
                img.onload = () => {
                    img.classList.add('loaded');
                    img.classList.remove('loading');
                };
            }
        };
    }
    
    return img;
}

// 图片压缩服务（可选功能）
function compressImage(imgElement, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        
        ctx.drawImage(imgElement, 0, 0);
        
        canvas.toBlob((blob) => {
            const compressedUrl = URL.createObjectURL(blob);
            resolve(compressedUrl);
        }, `image/webp`, quality);
    });
}

// 更新作品计数
function updateWorkCount() {
    const workCountElement = document.getElementById('workCount');
    if (workCountElement) {
        const totalCount = buildingsPageData.length;
        const filteredCount = filteredData.length;
        workCountElement.textContent = `(文件总数: ${totalCount} | 当前筛选: ${filteredCount})`;
    }
}

// 渲染建筑内容
function renderBuildings() {
    const grid = document.getElementById('buildingsGrid');
    if (!grid) {
        console.error('找不到 buildingsGrid 元素');
        return;
    }
    
    grid.innerHTML = '';
    
    // 应用过滤和搜索
    filteredData = [...buildingsPageData];
    
    // 应用标签过滤
    if (buildingsCurrentFilter !== 'all') {
        filteredData = filteredData.filter(item => {
            // 检查标签名称是否匹配
            if (item.tags && Array.isArray(item.tags)) {
                const matchingTags = item.tags.map(tagId => {
                    const tag = tagsData.find(t => t.id === tagId);
                    return tag ? tag.name : null;
                }).filter(name => name !== null);
                
                return matchingTags.includes(buildingsCurrentFilter);
            }
            return false;
        });
    }
    
    // 应用格式筛选
    if (buildingsCurrentFormatFilter !== 'all') {
        filteredData = filteredData.filter(item => 
            item.fileFormat && item.fileFormat.toLowerCase() === buildingsCurrentFormatFilter.toLowerCase()
        );
    }
    
    // 应用搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredData = filteredData.filter(item => {
                // 检查标题
                const titleMatch = item.title && item.title.toLowerCase().includes(searchTerm);
                // 检查作者
                const authorMatch = item.author && item.author.toLowerCase().includes(searchTerm);
                // 检查描述
                const descriptionMatch = item.description && item.description.toLowerCase().includes(searchTerm);
                // 检查文件格式
                const formatMatch = item.fileFormat && item.fileFormat.toLowerCase().includes(searchTerm);
                
                return titleMatch || authorMatch || descriptionMatch || formatMatch;
            });
            
            // 如果搜索词匹配了某个文件格式，自动更新格式筛选器
            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) {
                const matchedFormat = Array.from(formatSelect.options).find(option => 
                    option.value !== 'all' && option.value.toLowerCase() === searchTerm
                );
                
                if (matchedFormat) {
                    formatSelect.value = matchedFormat.value;
                    buildingsCurrentFormatFilter = matchedFormat.value;
                }
            }
        }
    }
    
    // 重置当前页为第一页（当过滤条件改变时）
    currentPage = 1;
    
    // 渲染分页内容
    renderPaginatedItems();
    // 渲染分页控件
    renderPagination();
    
    // 更新作品计数
    updateWorkCount();
}

function renderPaginatedItems() {
    const grid = document.getElementById('buildingsGrid');
    grid.innerHTML = '';
    
    // 计算当前页的起始和结束索引
    const startIndex = (currentPage - 1) * buildingsItemsPerPage;
    const endIndex = startIndex + buildingsItemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);
    
    
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1; width: 100%; display: flex; justify-content: center; align-items: center;">没有找到相关建筑作品</div>';
        return;
    }
    
    itemsToDisplay.forEach((building, index) => {
        const card = createBuildingCard(building);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / buildingsItemsPerPage);
    const paginationNumbers = document.getElementById('paginationNumbers');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const paginationInfo = document.getElementById('paginationInfo');
    
    // 清空页码按钮
    paginationNumbers.innerHTML = '';
    
    // 生成页码按钮
    const maxVisiblePages = 5; // 最多显示5个页码
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 调整起始页，确保始终显示maxVisiblePages个页码（如果总页数足够）
    if (endPage - startPage + 1 < maxVisiblePages && totalPages >= maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 添加第一页和省略号
    if (startPage > 1) {
        addPageButton(1);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
    }
    
    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i);
    }
    
    // 添加省略号和最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
        addPageButton(totalPages);
    }
    
    function addPageButton(pageNum) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn';
        if (pageNum === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = pageNum;
        pageBtn.onclick = () => goToPage(pageNum);
        paginationNumbers.appendChild(pageBtn);
    }
    
    // 更新上一页/下一页按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // 更新分页信息
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * buildingsItemsPerPage + 1;
    const endItem = Math.min(currentPage * buildingsItemsPerPage, filteredData.length);
    paginationInfo.textContent = `显示第 ${startItem}-${endItem} 项，共 ${filteredData.length} 项`;
}

function goToPage(pageNum) {
    currentPage = pageNum;
    renderPaginatedItems();
    renderPagination();
    
    // 滚动到顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 创建建筑卡片
function createBuildingCard(building) {
    const card = document.createElement('div');
    card.className = 'building-card card-hover-effect fade-in';
    
    const cardInner = document.createElement('div');
    cardInner.onclick = () => goToDetail(building);
    
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
    
    // 创建懒加载图片
    const img = createLazyImage(imagePath, building.title, 'building-image');
    
    // 标记是否使用WebP格式
    const isWebPOptimized = webpSupported && imagePath !== 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png';
    
    cardInner.innerHTML = `
        <div class="building-info">
            <h3 class="building-title">${building.title}</h3>
            <p class="building-author">作者: ${building.author || '未知'}</p>
            <div class="building-stats">
                <div class="building-stats-left">
                    <span class="building-tag">${categoryTag}</span>
                </div>
                <div class="building-stats-right">
                    <span><i class="fas fa-file"></i> ${building.size || '未知'}</span>
                    <span><i class="fas fa-cube"></i> ${building.buildingSize || '未知'}</span>
                    <span><i class="fas fa-code"></i> ${building.fileFormat || '未知'}</span>
                </div>
            </div>
        </div>
    `;
    
    // 将图片插入到cardInner的开头
    if (isWebPOptimized) {
        // 如果使用WebP格式，创建图片容器并添加优化标识
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-optimized';
        imageContainer.appendChild(img);
        cardInner.insertBefore(imageContainer, cardInner.firstChild);
    } else {
        cardInner.insertBefore(img, cardInner.firstChild);
    }
    
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
    renderBuildings();
}

// 格式筛选处理
function handleFormatFilter(event) {
    buildingsCurrentFormatFilter = event.target.value;
    renderBuildings();
}

// 过滤处理
function handleFilter(event) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    buildingsCurrentFilter = event.target.dataset.filter;
    renderBuildings();
}

// 随机刷新处理
function handleRandomRefresh() {
    buildingsPageData = [...buildingsPageData].sort(() => Math.random() - 0.5);
    renderBuildings();
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