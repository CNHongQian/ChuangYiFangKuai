// 音乐页面专用JavaScript
let musicPageData = [];
let musicCurrentFilter = 'all';
let musicCurrentFormatFilter = 'all'; // 添加格式筛选变量
let tagsData = []; // 存储标签数据

// 分页相关变量
let currentPage = 1;
const musicItemsPerPage = 12;
let filteredData = [];

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
    const refreshButton = document.querySelector('#randomRefresh');
    
    // 清空现有按钮（除了保留的）
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    if (allButton) {
        filterContainer.appendChild(allButton);
    }
    
    // 根据当前页面类型添加相应的标签按钮
    const currentPageType = 'music'; // 当前是音乐页面
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
    musicPageData.forEach(item => {
        if (item.fileFormat) {
            formats.add(item.fileFormat);
        }
    });
    
    // 创建自定义下拉菜单
    createCustomDropdown('formatSelect', Array.from(formats).sort());
    
    console.log('生成的格式选项:', Array.from(formats));
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
            
            console.log('自定义下拉菜单选择值:', selectedValue);
            console.log('更新后的select元素值:', originalSelect.value);
            console.log('select元素selectedIndex:', originalSelect.selectedIndex);
            
            // 直接调用格式筛选处理函数
            musicCurrentFormatFilter = selectedValue;
            console.log('直接设置格式筛选器为:', selectedValue);
            
            // 触发change事件
            const event = new Event('change', { bubbles: true });
            originalSelect.dispatchEvent(event);
            
            // 立即渲染
            renderMusic();
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

// 加载音乐数据
async function loadMusicData() {
    console.log('开始加载音乐数据...');
    
    try {
        // 添加时间戳防止缓存
        const githubUrl = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/data/content_data.json?t=' + Date.now();
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
        console.log('数据总数:', data.length);
        
        // 统计各类别数量
        const categoryStats = {};
        data.forEach(item => {
            const cat = item.category || 'unknown';
            categoryStats[cat] = (categoryStats[cat] || 0) + 1;
        });
        console.log('分类统计:', categoryStats);
        
        if (data && data.length > 0) {
            // 处理content_data.json中的数据结构，添加缺失的默认值
            // 只保留音乐类型的数据
            musicPageData = data
                .filter(item => {
                    console.log('过滤项目:', item, 'category:', item.category, 'type:', item.type);
                    // 检查category值的确切类型
                    const isMusic = item.category === 'music' || item.type === 'music';
                    console.log('是否为音乐:', isMusic, 'category值:', typeof item.category, 'category值:', item.category);
                    return isMusic;
                })
                .map(item => ({
                    ...item,
                    type: item.type || item.category || 'music', // 使用category作为type的备用值
                    downloads: item.downloads || 0,
                    likes: item.likes || 0,
                    views: item.views || 0
                }));
            
            console.log('从GitHub加载的音乐数据:', musicPageData);
            
            if (musicPageData.length > 0) {
                // 动态生成格式选项
                generateFormatOptions();
                
                // 确保数据加载完成后渲染
                console.log('GitHub数据加载完成，开始渲染，数据量:', musicPageData.length);
                renderMusic();
                return;
            } else {
                console.log('GitHub数据中没有找到音乐类型的项目');
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
    musicPageData = [];
    console.log('数据加载失败，不显示任何内容');
    
    // 仍然调用渲染函数以显示"没有找到相关音乐作品"消息
    renderMusic();
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
    
    // 加载标签数据
    await loadTagsData();
    
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
        const totalPages = Math.ceil(filteredData.length / musicItemsPerPage);
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

// 渲染音乐内容
// 更新作品计数
function updateWorkCount() {
    const workCountElement = document.getElementById('workCount');
    if (workCountElement) {
        const totalCount = musicPageData.length;
        const filteredCount = filteredData.length;
        workCountElement.textContent = `(文件总数: ${totalCount} | 当前筛选: ${filteredCount})`;
    }
}

function renderMusic() {
    const grid = document.getElementById('musicGrid');
    if (!grid) {
        console.error('找不到 musicGrid 元素');
        return;
    }
    
    grid.innerHTML = '';
    
    // 应用过滤和搜索
    filteredData = [...musicPageData];
    
    // 应用标签过滤
    if (musicCurrentFilter !== 'all') {
        filteredData = filteredData.filter(item => {
            // 检查标签名称是否匹配
            if (item.tags && Array.isArray(item.tags)) {
                const matchingTags = item.tags.map(tagId => {
                    const tag = tagsData.find(t => t.id === tagId);
                    return tag ? tag.name : null;
                }).filter(name => name !== null);
                
                return matchingTags.includes(musicCurrentFilter);
            }
            return false;
        });
    }
    
    // 应用格式筛选
    if (musicCurrentFormatFilter !== 'all') {
        filteredData = filteredData.filter(item => 
            item.fileFormat && item.fileFormat.toLowerCase() === musicCurrentFormatFilter.toLowerCase()
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
                    musicCurrentFormatFilter = matchedFormat.value;
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
    const startIndex = (currentPage - 1) * musicItemsPerPage;
    const endIndex = startIndex + musicItemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);
    
    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1; width: 100%; display: flex; justify-content: center; align-items: center;">没有找到相关音乐作品</div>';
        return;
    }
    
    itemsToDisplay.forEach((music, index) => {
        const card = createMusicCard(music);
        card.style.animationDelay = `${index * 0.1}s`;
        grid.appendChild(card);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / musicItemsPerPage);
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
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * musicItemsPerPage + 1;
    const endItem = Math.min(currentPage * musicItemsPerPage, filteredData.length);
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

// 创建音乐卡片
function createMusicCard(music) {
    const card = document.createElement('div');
    card.className = 'building-card';
    
    const cardInner = document.createElement('div');
    cardInner.onclick = () => goToDetail(music);
    
    // 使用getTypeName函数获取类型名称
    const typeTag = getTypeName(music.type);
    
    // 获取作品的标签
    const workTags = getWorkTags(music.tags);
    
    // 处理图片路径，确保使用正确的相对路径
    let imagePath = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png'; // 默认图片
    if (music.image && music.image.trim() !== '') {
        // 如果是相对路径，添加CDN前缀
        if (!music.image.startsWith('http')) {
            imagePath = 'https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/' + music.image;
        } else {
            imagePath = music.image;
        }
    }
    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('../')) {
        imagePath = '../' + imagePath;
    }
    
    // 构建标签HTML
    let tagsHtml = '';
    if (music.tags && Array.isArray(music.tags) && tagsData.length > 0) {
        music.tags.forEach(tagId => {
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
        <img src="${imagePath}" alt="${music.title}" class="building-image" onerror="this.src='https://cdn.jsdelivr.net/gh/CNHongQian/ChuangYiFangKuai@main/img/none.png'">
        <div class="building-info">
            <h3 class="building-title">${music.title}</h3>
            <p class="building-author">作者: ${music.author || '未知'}</p>
            <div class="building-stats">
                <div class="building-stats-left">
                    <span class="building-tag">${typeTag}</span>
                    ${tagsHtml}
                </div>
                <div class="building-stats-right">
                    <span><i class="fas fa-file"></i> ${music.size || music.fileSize || '未知'}</span>
                    <span><i class="fas fa-code"></i> ${music.fileFormat || '未知'}</span>
                    <span><i class="fas fa-music"></i> 音乐</span>
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
    renderMusic();
}

// 格式筛选处理
function handleFormatFilter(event) {
    musicCurrentFormatFilter = event.target.value;
    console.log('格式筛选触发，选择的格式:', musicCurrentFormatFilter);
    console.log('事件目标:', event.target);
    console.log('事件目标值:', event.target.value);
    renderMusic();
}

// 过滤处理
function handleFilter(event) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    musicCurrentFilter = event.target.dataset.filter;
    renderMusic();
}

// 随机刷新处理
function handleRandomRefresh() {
    musicPageData = [...musicPageData].sort(() => Math.random() - 0.5);
    renderMusic();
}

// 视图切换
function handleViewChange(event) {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    musicCurrentView = event.target.dataset.view;
    const grid = document.getElementById('buildingsGrid');
    
    if (musicCurrentView === 'list') {
        grid.style.gridTemplateColumns = '1fr';
    } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
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
    
    const workType = getTypeName(music.type);
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