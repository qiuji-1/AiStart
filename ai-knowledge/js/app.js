// AI编程知识体系 - 主逻辑和初始化
// 负责整体初始化、模块协调、全局事件处理

(function() {
    'use strict';
    
    // 应用配置
    const CONFIG = {
        appName: 'AI编程知识体系',
        version: '1.0.0',
        author: '秋霁',
        useTailwind: true,
        debugMode: false
    };
    
    // 应用状态
    const AppState = {
        currentChapter: null,
        currentSection: null,
        searchActive: false,
        sidebarOpen: false
    };
    
    // 主初始化函数
    function initApp() {
        console.log(`${CONFIG.appName} v${CONFIG.version} 正在初始化...`);
        
        try {
            // 第一步：初始化 Progress 模块（加载保存的进度到内存 + 获取DOM引用）
            if (typeof Progress !== 'undefined') {
                Progress.init();
            }
            
            // 第二步：生成导航树（此时 knowledgeData 已包含完成状态）
            if (typeof Navigation !== 'undefined') {
                Navigation.init();
            }
            
            // 第三步：初始化搜索功能
            if (typeof Search !== 'undefined') {
                Search.init();
            }
            
            // 第四步：再次更新进度显示（确保导航树已生成后数字正确）
            if (typeof Progress !== 'undefined') {
                Progress.updateProgressDisplay();
            }
            
            // 第五步：初始化打卡模块
            if (typeof Checklist !== 'undefined') {
                Checklist.init();
            }
            
            // 第六步：初始化总结模块
            if (typeof Summary !== 'undefined') {
                Summary.init();
            }
            
            // 第七步：初始化思维导图模块
            if (typeof Mindmap !== 'undefined') {
                Mindmap.init();
            }
            
            // 绑定全局事件
            bindGlobalEvents();
            
            // 加载保存的状态
            loadSavedState();
            
            console.log('初始化完成！');
            
        } catch (error) {
            console.error('初始化失败：', error);
            showErrorMessage('应用初始化失败，请刷新页面重试');
        }
    }
    
    // 绑定全局事件
    function bindGlobalEvents() {
        // 主页按钮点击
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                if (typeof Mindmap !== 'undefined') {
                    Mindmap.show();
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // 窗口大小变化
        window.addEventListener('resize', handleResize);
        
        // 页面卸载前保存状态
        window.addEventListener('beforeunload', saveCurrentState);
        
        // 监听localStorage变化（多标签页同步）
        window.addEventListener('storage', handleStorageChange);
    }
    
    // 处理键盘快捷键
    function handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K = 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // ESC = 关闭弹窗/清除搜索
        if (e.key === 'Escape') {
            const modal = document.getElementById('checkin-modal');
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
            
            const searchInput = document.getElementById('search-input');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                if (typeof Navigation !== 'undefined') {
                    Navigation.clearHighlight();
                }
            }
        }
        
        // Ctrl/Cmd + D = 打开打卡弹窗
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            const modal = document.getElementById('checkin-modal');
            if (modal) {
                if (modal.classList.contains('hidden')) {
                    if (typeof Checklist !== 'undefined') {
                        Checklist.openModal();
                    }
                } else {
                    modal.classList.add('hidden');
                }
            }
        }
    }
    
    // 处理窗口大小变化
    function handleResize() {
        // 桌面端自动显示侧边栏
        if (window.innerWidth >= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.add('hidden');
        }
    }
    
    // 保存当前状态
    function saveCurrentState() {
        const state = {
            currentChapter: AppState.currentChapter,
            currentSection: AppState.currentSection,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('appState', JSON.stringify(state));
    }
    
    // 加载保存的状态
    function loadSavedState() {
        const savedState = localStorage.getItem('appState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                AppState.currentChapter = state.currentChapter;
                AppState.currentSection = state.currentSection;
                
                // 如果有上次查看的章节，自动打开
                if (state.currentSection && state.currentChapter) {
                    setTimeout(() => {
                        const sectionEl = document.querySelector(`[data-section="${state.currentSection}"]`);
                        if (sectionEl && typeof Navigation !== 'undefined') {
                            Navigation.selectSection(sectionEl);
                        }
                    }, 500);
                }
            } catch (e) {
                console.error('加载保存状态失败：', e);
            }
        }
    }
    
    // 处理localStorage变化（多标签页同步）
    function handleStorageChange(e) {
        if (e.key === 'knowledgeProgress' && typeof Progress !== 'undefined') {
            Progress.loadProgress();
            Progress.updateProgressDisplay();
        }
        
        if (e.key === 'checkinData' && typeof Checklist !== 'undefined') {
            Checklist.checkinData = Checklist.loadCheckinData();
            Checklist.renderCalendar();
        }
    }
    
    // 显示错误信息
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    // 显示成功信息
    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
    
    // 工具函数：防抖
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 工具函数：节流
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // 将工具函数暴露到全局
    window.AppUtils = {
        debounce,
        throttle,
        showErrorMessage,
        showSuccessMessage,
        CONFIG,
        AppState
    };
    
    // DOMContentLoaded 时初始化应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM已经加载完成
        setTimeout(initApp, 100);
    }
    
})();