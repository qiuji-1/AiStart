// AI编程知识体系 - 每日总结功能
// 负责实现每日学习总结的撰写、保存、查看历史记录功能

const Summary = {
    init() {
        this.summaryData = this.loadSummaryData();
        this.checkinData = JSON.parse(localStorage.getItem('checkinData') || '{}');
    },

    // 加载总结数据
    loadSummaryData() {
        const data = localStorage.getItem('summaryData');
        return data ? JSON.parse(data) : {};
    },

    // 保存总结数据
    saveSummaryData() {
        localStorage.setItem('summaryData', JSON.stringify(this.summaryData));
    },

    // 保存今日总结
    saveTodaySummary(content) {
        const todayStr = this.getTodayString();
        this.summaryData[todayStr] = {
            content: content,
            timestamp: new Date().toISOString()
        };
        this.saveSummaryData();
        
        // 同时更新打卡数据中的总结
        if (!this.checkinData[todayStr]) {
            this.checkinData[todayStr] = { goals: [], completed: [], checked: false };
        }
        this.checkinData[todayStr].summary = content;
        localStorage.setItem('checkinData', JSON.stringify(this.checkinData));
    },

    // 获取今日总结
    getTodaySummary() {
        const todayStr = this.getTodayString();
        return this.summaryData[todayStr] ? this.summaryData[todayStr].content : '';
    },

    // 获取指定日期的总结
    getSummary(dateStr) {
        return this.summaryData[dateStr] ? this.summaryData[dateStr].content : '';
    },

    // 获取所有总结（按日期排序）
    getAllSummaries() {
        const summaries = [];
        
        Object.keys(this.summaryData).sort().reverse().forEach(date => {
            summaries.push({
                date: date,
                content: this.summaryData[date].content,
                timestamp: this.summaryData[date].timestamp
            });
        });
        
        return summaries;
    },

    // 删除总结
    deleteSummary(dateStr) {
        if (!confirm('确定要删除这条总结吗？')) {
            return;
        }
        
        delete this.summaryData[dateStr];
        this.saveSummaryData();
        
        // 同时删除打卡数据中的总结
        if (this.checkinData[dateStr]) {
            delete this.checkinData[dateStr].summary;
            localStorage.setItem('checkinData', JSON.stringify(this.checkinData));
        }
    },

    // 获取今日日期字符串
    getTodayString() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },

    // 创建总结编辑器（集成到打卡弹窗中）
    createSummaryEditor() {
        const todayStr = this.getTodayString();
        const existingSummary = this.getTodaySummary();
        
        let html = `
            <div class="mt-6 pt-6 border-t border-gray-200">
                <h3 class="text-lg font-semibold mb-4">今日学习总结</h3>
                <textarea id="summary-editor" 
                          class="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                          placeholder="记录今天的学习心得、收获和疑问...">${existingSummary}</textarea>
                <div class="mt-2 flex justify-between items-center">
                    <span class="text-sm text-gray-500" id="summary-char-count">0 字</span>
                    <button id="save-summary-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        保存总结
                    </button>
                </div>
            </div>
        `;
        
        return html;
    },

    // 绑定总结编辑器事件
    bindSummaryEditorEvents() {
        const editor = document.getElementById('summary-editor');
        const saveBtn = document.getElementById('save-summary-btn');
        const charCount = document.getElementById('summary-char-count');
        
        if (editor && charCount) {
            // 实时显示字数
            editor.addEventListener('input', () => {
                const count = editor.value.length;
                charCount.textContent = `${count} 字`;
            });
            
            // 初始化字数显示
            charCount.textContent = `${editor.value.length} 字`;
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (editor) {
                    this.saveTodaySummary(editor.value);
                    alert('总结保存成功！');
                }
            });
        }
    },

    // 渲染总结历史记录
    renderSummaryHistory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const summaries = this.getAllSummaries();
        
        if (summaries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无学习总结</p>
                    <p class="text-sm">在打卡弹窗中撰写今日总结</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="space-y-4">';
        
        summaries.forEach(summary => {
            const date = new Date(summary.date);
            const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
            const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
            
            html += `
                <div class="summary-item bg-white p-4 rounded-lg shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="font-semibold text-gray-800">${formattedDate}</span>
                            <span class="text-sm text-gray-500">星期${weekDay}</span>
                        </div>
                        <button class="delete-summary-btn text-red-500 hover:text-red-700" data-date="${summary.date}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-gray-600 whitespace-pre-wrap">${summary.content}</p>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // 绑定删除按钮事件
        container.querySelectorAll('.delete-summary-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                this.deleteSummary(dateStr);
                this.renderSummaryHistory(containerId); // 重新渲染
            });
        });
    }
};