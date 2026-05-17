// AI编程知识体系 - 每日打卡计划功能
// 负责实现每日学习目标设置、打卡记录、日历视图功能

const Checklist = {
    init() {
        this.modal = document.getElementById('checkin-modal');
        this.checkinBtn = document.getElementById('checkin-btn');
        this.closeCheckinBtn = document.getElementById('close-checkin');
        this.checkinActionBtn = document.getElementById('checkin-action-btn');
        this.cancelCheckinBtn = document.getElementById('cancel-checkin-btn');
        this.calendar = document.getElementById('calendar');
        this.todayGoals = document.getElementById('today-goals');
        this.newGoalInput = document.getElementById('new-goal-input');
        this.addGoalBtn = document.getElementById('add-goal-btn');
        
        this.currentDate = new Date();
        this.checkinData = this.loadCheckinData();
        
        this.bindEvents();
        this.renderCalendar();
        this.renderTodayGoals();
        this.updateCheckinButton();
        this.updateHeaderCheckinStatus();
    },

    // 加载打卡数据
    loadCheckinData() {
        const data = localStorage.getItem('checkinData');
        return data ? JSON.parse(data) : {};
    },

    // 保存打卡数据
    saveCheckinData() {
        localStorage.setItem('checkinData', JSON.stringify(this.checkinData));
    },

    // 绑定事件
    bindEvents() {
        // 打开打卡弹窗
        if (this.checkinBtn) {
            this.checkinBtn.addEventListener('click', () => {
                this.openModal();
            });
        }
        
        // 关闭打卡弹窗
        if (this.closeCheckinBtn) {
            this.closeCheckinBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // 点击弹窗背景关闭
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        // 打卡按钮
        if (this.checkinActionBtn) {
            this.checkinActionBtn.addEventListener('click', () => {
                this.performCheckin();
            });
        }
        
        // 取消打卡按钮
        if (this.cancelCheckinBtn) {
            this.cancelCheckinBtn.addEventListener('click', () => {
                this.cancelTodayCheckin();
            });
        }
        
        // 添加目标
        if (this.addGoalBtn && this.newGoalInput) {
            this.addGoalBtn.addEventListener('click', () => {
                this.addGoal();
            });
            
            this.newGoalInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addGoal();
                }
            });
        }
    },

    // 打开打卡弹窗
    openModal() {
        if (this.modal) {
            // 每次打开都重新从localStorage加载数据
            this.checkinData = this.loadCheckinData();
            this.modal.classList.remove('hidden');
            this.renderCalendar();
            this.renderTodayGoals();
            this.updateCheckinButton();
            this.renderSummaryEditor();
        }
    },

    // 渲染总结编辑器
    renderSummaryEditor() {
        const container = document.getElementById('summary-editor-container');
        if (container && typeof Summary !== 'undefined') {
            container.innerHTML = Summary.createSummaryEditor();
            Summary.bindSummaryEditorEvents();
        }
    },

    // 关闭打卡弹窗
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    },

    // 渲染日历视图
    renderCalendar() {
        if (!this.calendar) return;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();
        
        let html = '';
        
        // 星期标题
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        weekDays.forEach(day => {
            html += `<div class="text-center font-semibold text-gray-600 py-2">${day}</div>`;
        });
        
        // 空白填充
        for (let i = 0; i < startDayOfWeek; i++) {
            html += `<div class="calendar-day"></div>`;
        }
        
        // 日期格子
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isChecked = this.checkinData[dateStr] && this.checkinData[dateStr].checked;
            const isToday = today.getFullYear() === year && 
                           today.getMonth() === month && 
                           today.getDate() === day;
            
            let className = 'calendar-day';
            if (isChecked) className += ' checked';
            if (isToday) className += ' today';
            
            html += `<div class="${className}" data-date="${dateStr}">${day}</div>`;
        }
        
        this.calendar.innerHTML = html;
        
        // 绑定日历日期点击事件
        this.bindCalendarEvents();
    },

    // 绑定日历日期点击事件
    bindCalendarEvents() {
        if (!this.calendar) return;
        
        this.calendar.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                const dateStr = e.target.dataset.date;
                if (dateStr) {
                    this.toggleDayCheckin(dateStr, e.target);
                }
            });
        });
    },

    // 切换某天打卡状态
    toggleDayCheckin(dateStr, dayEl) {
        const dayData = this.checkinData[dateStr];
        
        if (dayData && dayData.checked) {
            // 已经是打卡状态，询问是否取消
            if (confirm('确定要取消这一天的打卡记录吗？')) {
                dayData.checked = false;
                delete dayData.checkinTime;
                this.saveCheckinData();
                this.renderCalendar();
                this.updateCheckinButton();
                this.updateHeaderCheckinStatus();
            }
        }
    },

    // 渲染今日目标
    renderTodayGoals() {
        if (!this.todayGoals) return;
        
        const todayStr = this.getTodayString();
        const todayData = this.checkinData[todayStr] || { goals: [], completed: [] };
        
        let html = '';
        
        if (todayData.goals && todayData.goals.length > 0) {
            todayData.goals.forEach((goal, index) => {
                const isCompleted = todayData.completed && todayData.completed.includes(goal);
                const completedClass = isCompleted ? 'completed' : '';
                
                html += `
                    <div class="goal-item ${completedClass}" data-index="${index}">
                        <input type="checkbox" ${isCompleted ? 'checked' : ''} data-goal="${goal}">
                        <span class="goal-text flex-1">${goal}</span>
                        <button class="delete-goal text-red-500 hover:text-red-700" data-index="${index}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                `;
            });
        } else {
            html = `
                <div class="empty-state">
                    <p>暂无学习目标</p>
                    <p class="text-sm">在下方输入框添加今日学习目标</p>
                </div>
            `;
        }
        
        this.todayGoals.innerHTML = html;
        
        // 绑定目标事件
        this.bindGoalEvents();
    },

    // 绑定目标事件
    bindGoalEvents() {
        // 复选框切换完成状态
        this.todayGoals.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const goal = e.target.dataset.goal;
                this.toggleGoalComplete(goal);
            });
        });
        
        // 删除目标
        this.todayGoals.querySelectorAll('.delete-goal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.delete-goal').dataset.index);
                this.deleteGoal(index);
            });
        });
    },

    // 添加目标
    addGoal() {
        if (!this.newGoalInput) return;
        
        const goalText = this.newGoalInput.value.trim();
        if (!goalText) return;
        
        const todayStr = this.getTodayString();
        if (!this.checkinData[todayStr]) {
            this.checkinData[todayStr] = { goals: [], completed: [], checked: false };
        }
        
        this.checkinData[todayStr].goals.push(goalText);
        this.saveCheckinData();
        
        this.newGoalInput.value = '';
        this.renderTodayGoals();
    },

    // 删除目标
    deleteGoal(index) {
        const todayStr = this.getTodayString();
        if (this.checkinData[todayStr] && this.checkinData[todayStr].goals) {
            const goal = this.checkinData[todayStr].goals[index];
            this.checkinData[todayStr].goals.splice(index, 1);
            
            // 也从completed中移除
            if (this.checkinData[todayStr].completed) {
                const completedIndex = this.checkinData[todayStr].completed.indexOf(goal);
                if (completedIndex > -1) {
                    this.checkinData[todayStr].completed.splice(completedIndex, 1);
                }
            }
            
            this.saveCheckinData();
            this.renderTodayGoals();
        }
    },

    // 切换目标完成状态
    toggleGoalComplete(goal) {
        const todayStr = this.getTodayString();
        if (!this.checkinData[todayStr]) {
            this.checkinData[todayStr] = { goals: [], completed: [], checked: false };
        }
        
        if (!this.checkinData[todayStr].completed) {
            this.checkinData[todayStr].completed = [];
        }
        
        const index = this.checkinData[todayStr].completed.indexOf(goal);
        if (index > -1) {
            this.checkinData[todayStr].completed.splice(index, 1);
        } else {
            this.checkinData[todayStr].completed.push(goal);
        }
        
        this.saveCheckinData();
        this.renderTodayGoals();
    },

    // 执行打卡
    performCheckin() {
        const todayStr = this.getTodayString();
        if (!this.checkinData[todayStr]) {
            this.checkinData[todayStr] = { goals: [], completed: [], checked: false };
        }
        
        this.checkinData[todayStr].checked = true;
        this.checkinData[todayStr].checkinTime = new Date().toISOString();
        
        this.saveCheckinData();
        
        // 刷新UI
        this.renderCalendar();
        this.updateCheckinButton();
        
        // 更新右上角进度显示
        if (typeof Progress !== 'undefined') {
            Progress.updateProgressDisplay();
        }
        
        // 更新顶部打卡状态
        this.updateHeaderCheckinStatus();
        
        // 显示打卡成功提示
        this.showToast('打卡成功！继续加油！💪');
    },

    // 显示提示消息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] transition-opacity duration-300';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    // 更新打卡按钮状态
    updateCheckinButton() {
        if (!this.checkinActionBtn) return;
        
        const todayStr = this.getTodayString();
        const isChecked = this.checkinData[todayStr] && this.checkinData[todayStr].checked;
        
        if (isChecked) {
            this.checkinActionBtn.textContent = '今日已打卡 ✓';
            this.checkinActionBtn.disabled = true;
            this.checkinActionBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            this.checkinActionBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            // 显示取消按钮
            if (this.cancelCheckinBtn) {
                this.cancelCheckinBtn.classList.remove('hidden');
            }
        } else {
            this.checkinActionBtn.textContent = '立即打卡';
            this.checkinActionBtn.disabled = false;
            this.checkinActionBtn.classList.remove('bg-gray-400', 'cursor-not-allowed');
            this.checkinActionBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            // 隐藏取消按钮
            if (this.cancelCheckinBtn) {
                this.cancelCheckinBtn.classList.add('hidden');
            }
        }
    },

    // 取消今日打卡
    cancelTodayCheckin() {
        if (!confirm('确定要取消今日打卡吗？')) return;
        
        const todayStr = this.getTodayString();
        if (this.checkinData[todayStr]) {
            this.checkinData[todayStr].checked = false;
            delete this.checkinData[todayStr].checkinTime;
        }
        
        this.saveCheckinData();
        this.renderCalendar();
        this.updateCheckinButton();
        this.updateHeaderCheckinStatus();
        this.showToast('已取消今日打卡');
    },

    // 获取今日日期字符串
    getTodayString() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    },

    // 获取打卡统计
    getCheckinStats() {
        const data = this.checkinData;
        const dates = Object.keys(data).filter(date => data[date].checked);
        
        // 计算连续打卡天数
        let streak = 0;
        const today = new Date();
        for (let i = 0; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            if (data[dateStr] && data[dateStr].checked) {
                streak++;
            } else {
                break;
            }
        }
        
        return {
            totalCheckins: dates.length,
            currentStreak: streak,
            thisMonthCheckins: dates.filter(date => {
                const d = new Date(date);
                return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            }).length
        };
    },

    // 更新顶部导航栏的打卡状态
    updateHeaderCheckinStatus() {
        const statusEl = document.getElementById('checkin-status');
        if (!statusEl) return;

        const stats = this.getCheckinStats();
        
        if (stats.currentStreak > 0) {
            statusEl.innerHTML = `🔥 连续${stats.currentStreak}天`;
        } else if (stats.totalCheckins > 0) {
            statusEl.innerHTML = `已打卡${stats.totalCheckins}次`;
        } else {
            statusEl.innerHTML = '';
        }
    }
};