// AI编程知识体系 - 进度追踪
// 负责跟踪学习进度，使用localStorage保存完成状态

const Progress = {
    // 进度数据（供其他模块访问）
    progressData: {},
    currentSection: null,

    init() {
        this.progressText = document.getElementById('progress-text');
        this.loadProgress();
        this.updateProgressDisplay();
    },

    // 加载进度（从localStorage）
    loadProgress() {
        const savedProgress = localStorage.getItem('knowledgeProgress');
        if (savedProgress) {
            this.progressData = JSON.parse(savedProgress);
            
            // 更新knowledgeData中的完成状态
            knowledgeData.forEach(chapter => {
                chapter.children.forEach(section => {
                    if (this.progressData[section.id]) {
                        section.completed = true;
                    }
                });
            });
        }
    },

    // 保存进度到localStorage
    saveProgress() {
        const progressData = {};
        
        knowledgeData.forEach(chapter => {
            chapter.children.forEach(section => {
                if (section.completed) {
                    progressData[section.id] = true;
                }
            });
        });
        
        localStorage.setItem('knowledgeProgress', JSON.stringify(progressData));
    },

    // 更新进度显示
    updateProgressDisplay() {
        if (!this.progressText) return;
        
        const total = this.getTotalSections();
        const completed = this.getCompletedSections();
        
        this.progressText.textContent = `${completed}/${total}`;
        
        // 更新进度条（如果有）
        this.updateProgressBar(completed, total);
        
        // 如果思维导图正在显示，刷新它
        if (typeof Mindmap !== 'undefined') {
            Mindmap.refresh();
        }
    },

    // 获取总章节数
    getTotalSections() {
        let total = 0;
        knowledgeData.forEach(chapter => {
            total += chapter.children.length;
        });
        return total;
    },

    // 获取已完成章节数
    getCompletedSections() {
        let completed = 0;
        knowledgeData.forEach(chapter => {
            chapter.children.forEach(section => {
                if (section.completed) {
                    completed++;
                }
            });
        });
        return completed;
    },

    // 更新进度条（可选功能）
    updateProgressBar(completed, total) {
        let progressBar = document.getElementById('progress-bar');
        
        // 如果进度条不存在，创建一个
        if (!progressBar && this.progressText) {
            progressBar = document.createElement('div');
            progressBar.id = 'progress-bar';
            progressBar.className = 'progress-bar mt-2';
            progressBar.innerHTML = '<div class="progress-bar-fill"></div>';
            
            const container = this.progressText.closest('.flex');
            if (container) {
                container.appendChild(progressBar);
            }
        }
        
        if (progressBar) {
            const fill = progressBar.querySelector('.progress-bar-fill');
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            fill.style.width = `${percentage}%`;
        }
    },

    // 重置进度
    resetProgress() {
        if (!confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
            return;
        }
        
        // 重置数据
        knowledgeData.forEach(chapter => {
            chapter.children.forEach(section => {
                section.completed = false;
            });
        });
        
        // 清除localStorage
        localStorage.removeItem('knowledgeProgress');
        
        // 重新生成导航树
        Navigation.generateTree();
        
        // 更新显示
        this.updateProgressDisplay();
        
        alert('进度已重置！');
    },

    // 获取完成百分比
    getCompletionPercentage() {
        const total = this.getTotalSections();
        const completed = this.getCompletedSections();
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    },

    // 获取最近学习的章节
    getRecentSections(limit = 5) {
        const recent = [];
        // 这里可以从localStorage获取最近访问记录
        // 暂时返回已完成的前N个章节
        knowledgeData.forEach(chapter => {
            chapter.children.forEach(section => {
                if (section.completed) {
                    recent.push({
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        sectionId: section.id,
                        sectionTitle: section.title
                    });
                }
            });
        });
        
        return recent.slice(0, limit);
    }
};