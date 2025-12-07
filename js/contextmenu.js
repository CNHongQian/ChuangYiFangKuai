// 自定义右键菜单
class CustomContextMenu {
    constructor() {
        this.menu = null;
        this.isVisible = false;
        this.currentTarget = null;
        this.savedSelection = null; // 保存选中的文本
        this.init();
    }

    init() {
        this.createMenu();
        this.bindEvents();
    }

    createMenu() {
        // 创建菜单容器
        this.menu = document.createElement('div');
        this.menu.className = 'custom-context-menu';
        this.menu.innerHTML = `
            <div class="context-menu-item" data-action="refresh">
                <i class="fas fa-sync-alt"></i>
                <span>刷新</span>
            </div>
            <div class="context-menu-item" data-action="copy" style="display: none;">
                <i class="fas fa-copy"></i>
                <span>复制</span>
            </div>
            <div class="context-menu-item" data-action="paste" style="display: none;">
                <i class="fas fa-paste"></i>
                <span>粘贴</span>
            </div>
        `;
        document.body.appendChild(this.menu);
    }

    bindEvents() {
        // 阻止默认右键菜单
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showMenu(e);
        });

        // 点击其他地方隐藏菜单
        document.addEventListener('click', () => {
            this.hideMenu();
        });

        // 菜单项点击事件
        this.menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.getAttribute('data-action');
                this.executeAction(action);
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideMenu();
            }
        });
    }

    showMenu(e) {
        this.currentTarget = e.target;
        this.updateMenuItems();
        
        // 设置菜单位置
        const x = e.clientX;
        const y = e.clientY;
        
        // 确保菜单不会超出屏幕边界
        const menuRect = this.menu.getBoundingClientRect();
        const maxX = window.innerWidth - menuRect.width;
        const maxY = window.innerHeight - menuRect.height;
        
        this.menu.style.left = Math.min(x, maxX) + 'px';
        this.menu.style.top = Math.min(y, maxY) + 'px';
        
        // 显示菜单
        this.menu.classList.add('show');
        this.isVisible = true;
    }

    hideMenu() {
        this.menu.classList.remove('show');
        this.isVisible = false;
    }

    updateMenuItems() {
        const refreshItem = this.menu.querySelector('[data-action="refresh"]');
        const copyItem = this.menu.querySelector('[data-action="copy"]');
        const pasteItem = this.menu.querySelector('[data-action="paste"]');

        // 刷新按钮始终显示
        refreshItem.style.display = 'flex';

        // 检查是否有选中的文本 - 使用多种方法检测
        let selectedText = '';
        
        // 方法1: 标准的 getSelection
        const selection = window.getSelection();
        if (selection && selection.toString()) {
            selectedText = selection.toString().trim();
        }
        
        // 方法2: 检查输入框中的选择
        if (!selectedText && this.currentTarget) {
            const tagName = this.currentTarget.tagName.toUpperCase();
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
                const start = this.currentTarget.selectionStart;
                const end = this.currentTarget.selectionEnd;
                if (start !== end) {
                    selectedText = this.currentTarget.value.substring(start, end).trim();
                }
            }
        }
        
        // 保存选中的文本供复制使用
        this.savedSelection = selectedText;
        
        console.log('检测到的选中文本:', `"${selectedText}"`, '长度:', selectedText.length);
        
        if (selectedText && selectedText.length > 0) {
            copyItem.style.display = 'flex';
        } else {
            copyItem.style.display = 'none';
        }

        // 检查是否在输入框中
        const isInput = this.currentTarget.tagName === 'INPUT' || 
                       this.currentTarget.tagName === 'TEXTAREA' ||
                       this.currentTarget.contentEditable === 'true';
        
        if (isInput) {
            pasteItem.style.display = 'flex';
        } else {
            pasteItem.style.display = 'none';
        }
    }

    executeAction(action) {
        switch (action) {
            case 'refresh':
                this.refreshPage();
                break;
            case 'copy':
                this.copySelectedText();
                break;
            case 'paste':
                this.pasteText();
                break;
        }
        this.hideMenu();
    }

    refreshPage() {
        // 添加刷新动画
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }

    copySelectedText() {
        // 使用保存的选中文本
        let selectedText = this.savedSelection || '';
        
        console.log('复制文本:', `"${selectedText}"`, '长度:', selectedText.length);
        
        if (selectedText && selectedText.length > 0) {
            // 先尝试现代API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selectedText).then(() => {
                    this.showNotification('复制成功');
                }).catch(err => {
                    console.error('现代API复制失败:', err);
                    // 降级方案
                    this.fallbackCopy(selectedText);
                });
            } else {
                // 直接使用降级方案
                this.fallbackCopy(selectedText);
            }
        } else {
            this.showNotification('没有选中的文本');
        }
    }

    pasteText() {
        // 优先使用 execCommand，避免权限询问
        if (this.currentTarget.tagName === 'INPUT' || this.currentTarget.tagName === 'TEXTAREA') {
            // 对于输入框，先尝试现代API，失败则使用降级方案
            if (navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard.readText().then(text => {
                    this.insertTextAtCursor(this.currentTarget, text);
                    this.showNotification('粘贴成功');
                }).catch(err => {
                    console.error('现代API粘贴失败:', err);
                    this.fallbackPaste();
                });
            } else {
                this.fallbackPaste();
            }
        } else if (this.currentTarget.contentEditable === 'true') {
            // 对于可编辑区域，直接使用 execCommand
            try {
                document.execCommand('paste');
                this.showNotification('粘贴成功');
            } catch (err) {
                console.error('粘贴失败:', err);
                this.showNotification('粘贴失败');
            }
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showNotification('复制成功');
            } else {
                this.showNotification('复制失败');
            }
        } catch (err) {
            console.error('复制失败:', err);
            this.showNotification('复制失败');
        }
        
        document.body.removeChild(textArea);
    }

    insertTextAtCursor(element, text) {
        const start = element.selectionStart;
        const end = element.selectionEnd;
        const value = element.value;
        
        element.value = value.substring(0, start) + text + value.substring(end);
        element.selectionStart = element.selectionEnd = start + text.length;
        
        // 触发 input 事件以确保框架能检测到变化
        const event = new Event('input', { bubbles: true });
        element.dispatchEvent(event);
    }

    fallbackPaste() {
        // 创建一个临时的可编辑区域来执行粘贴
        const tempDiv = document.createElement('div');
        tempDiv.contentEditable = true;
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-999999px';
        tempDiv.style.top = '-999999px';
        tempDiv.style.opacity = '0';
        document.body.appendChild(tempDiv);
        
        tempDiv.focus();
        
        try {
            // 执行粘贴命令
            document.execCommand('paste');
            
            // 获取粘贴的内容
            const pastedText = tempDiv.textContent || tempDiv.innerText;
            
            if (pastedText && this.currentTarget) {
                this.insertTextAtCursor(this.currentTarget, pastedText);
                this.showNotification('粘贴成功');
            } else {
                this.showNotification('剪贴板为空');
            }
        } catch (err) {
            console.error('粘贴失败:', err);
            this.showNotification('粘贴失败');
        }
        
        document.body.removeChild(tempDiv);
    }

    showNotification(message) {
        // 移除已存在的通知
        const existingNotification = document.querySelector('.context-menu-notification');
        if (existingNotification) {
            existingNotification.parentNode.removeChild(existingNotification);
        }
        
        const notification = document.createElement('div');
        notification.className = 'context-menu-notification';
        notification.textContent = message;
        
        // 获取菜单位置，在菜单附近显示通知
        if (this.menu && this.menu.classList.contains('show')) {
            const menuRect = this.menu.getBoundingClientRect();
            notification.style.top = (menuRect.bottom + 10) + 'px';
            notification.style.right = (window.innerWidth - menuRect.right) + 'px';
            notification.style.left = 'auto';
        }
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.customContextMenu = new CustomContextMenu();
});

// 导出供其他脚本使用
window.CustomContextMenu = CustomContextMenu;