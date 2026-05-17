// AI编程知识体系 - 搜索过滤功能
// 负责实现搜索框的实时搜索、高亮显示功能

const Search = {
    init() {
        this.searchInput = document.getElementById('search-input');
        this.initSearch();
    },

    // 初始化搜索功能
    initSearch() {
        if (!this.searchInput) return;
        
        // 实时搜索
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            this.performSearch(searchTerm);
        });
        
        // 回车键搜索
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                this.performSearch(searchTerm);
            }
        });
        
        // 清空搜索时恢复
        this.searchInput.addEventListener('blur', (e) => {
            if (!e.target.value.trim()) {
                Navigation.clearHighlight();
            }
        });
    },

    // 执行搜索
    performSearch(searchTerm) {
        if (!searchTerm) {
            Navigation.clearHighlight();
            return;
        }
        
        // 统一处理：高亮 + 显示/隐藏 + 展开（一次性完成）
        Navigation.searchAndHighlight(searchTerm);
    },

    // 展开匹配的章节（保留供其他地方调用）
    expandMatchingChapters(searchTerm) {
        const chapters = document.querySelectorAll('.nav-item');
        
        chapters.forEach(chapter => {
            const chapterTitle = chapter.querySelector('.nav-chapter span:nth-child(2)').textContent.toLowerCase();
            const sections = chapter.querySelectorAll('.nav-section');
            
            let hasMatch = chapterTitle.includes(searchTerm.toLowerCase());
            
            sections.forEach(section => {
                const sectionText = section.querySelector('.section-text').textContent.toLowerCase();
                if (sectionText.includes(searchTerm.toLowerCase())) {
                    hasMatch = true;
                }
            });
            
            if (hasMatch) {
                const sectionsDiv = chapter.querySelector('.nav-sections');
                const chapterHeader = chapter.querySelector('.nav-chapter');
                sectionsDiv.classList.remove('hidden');
                chapterHeader.classList.add('expanded');
                
                Navigation.saveChapterState(chapter.dataset.chapter, true);
            }
        });
    },

    // 清除搜索
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            Navigation.clearHighlight();
        }
    },

    // 获取搜索建议（可选功能，用于未来扩展）
    getSuggestions(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) return [];
        
        const suggestions = [];
        const term = searchTerm.toLowerCase();
        
        knowledgeData.forEach(chapter => {
            // 检查章节标题
            if (chapter.title.toLowerCase().includes(term)) {
                suggestions.push({
                    type: 'chapter',
                    id: chapter.id,
                    title: chapter.title,
                    icon: chapter.icon
                });
            }
            
            // 检查子章节
            chapter.children.forEach(section => {
                if (section.title.toLowerCase().includes(term)) {
                    suggestions.push({
                        type: 'section',
                        id: section.id,
                        title: section.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title
                    });
                }
            });
        });
        
        return suggestions.slice(0, 10); // 最多返回10条建议
    }
};