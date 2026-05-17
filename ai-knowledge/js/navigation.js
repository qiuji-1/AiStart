// AI编程知识体系 - 导航生成和交互
// 负责生成左侧导航树，处理展开/折叠、点击交互

// 轻量 Markdown 解析器（不依赖外部库）
function parseMarkdown(text) {
    if (!text) return '';
    let html = text;
    
    // 转义 HTML（仅转义内容部分，保留 Markdown 语法）
    const escapeHtml = (str) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    
    // 代码块（先处理，避免其他规则干扰）
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
        return '<pre><code class="language-' + lang + '">' + escapeHtml(code.trim()) + '</code></pre>';
    });
    
    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 标题
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // 加粗和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // 删除线
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    
    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;">');
    
    // 引用块
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');
    
    // 无序列表
    html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // 有序列表
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    
    // 分隔线
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^\*\*\*+$/gm, '<hr>');
    
    // 换行分段（空行=段落）
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || 
            p.startsWith('<blockquote') || p.startsWith('<pre') || p.startsWith('<hr')) {
            return p;
        }
        // li 标签不包裹 p
        if (p.startsWith('<li>')) return p;
        return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
    
    return html;
}

const Navigation = {
    // 内容缩放状态
    contentScale: 1,
    contentMinScale: 0.5,
    contentMaxScale: 2,
    
    // 首页缩放状态
    welcomeScale: 1,
    welcomeMinScale: 0.7,
    welcomeMaxScale: 1.5,

    init() {
        this.tree = document.getElementById('navigation-tree');
        this.contentDisplay = document.getElementById('content-display');
        this.welcomePage = document.getElementById('welcome-page');
        this.contentBody = document.getElementById('content-body');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebar-toggle');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        
        // 加载自定义章节
        this.loadCustomSections();
        
        this.generateTree();
        this.bindEvents();
        this.bindAddSectionEvents();
        this.bindContentZoomEvents();
        this.bindWelcomeZoomEvents();
    },
    
    // 内容缩放控制
    setContentScale(scale) {
        scale = Math.max(this.contentMinScale, Math.min(this.contentMaxScale, scale));
        this.contentScale = scale;
        
        const contentBody = document.getElementById('content-body');
        const zoomLevel = document.getElementById('content-zoom-level');
        
        if (contentBody) {
            contentBody.style.transform = `scale(${scale})`;
        }
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(scale * 100)}%`;
        }
    },
    
    // 首页缩放控制
    setWelcomeScale(scale) {
        scale = Math.max(this.welcomeMinScale, Math.min(this.welcomeMaxScale, scale));
        this.welcomeScale = scale;
        
        const welcomeContent = document.getElementById('welcome-content');
        const zoomLevel = document.getElementById('welcome-zoom-level');
        
        if (welcomeContent) {
            welcomeContent.style.transform = `scale(${scale})`;
            welcomeContent.style.transformOrigin = 'top center';
            welcomeContent.style.width = `${100 / scale}%`;
            welcomeContent.style.marginLeft = 'auto';
            welcomeContent.style.marginRight = 'auto';
            welcomeContent.style.maxWidth = `${100 / scale * 896}px`; // 896px 是 max-w-4xl 的宽度
        }
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(scale * 100)}%`;
        }
    },
    
    // 首页缩放事件绑定
    bindWelcomeZoomEvents() {
        const zoomIn = document.getElementById('welcome-zoom-in');
        const zoomOut = document.getElementById('welcome-zoom-out');
        const zoomReset = document.getElementById('welcome-zoom-reset');
        
        zoomIn?.addEventListener('click', () => {
            this.setWelcomeScale(this.welcomeScale + 0.1);
        });
        
        zoomOut?.addEventListener('click', () => {
            this.setWelcomeScale(this.welcomeScale - 0.1);
        });
        
        zoomReset?.addEventListener('click', () => {
            this.setWelcomeScale(1);
        });
        
        // 轮播图功能
        this.initCarousel();
    },
    
    // 轮播图初始化
    initCarousel() {
        const track = document.getElementById('carousel-track');
        const dots = document.querySelectorAll('.carousel-dot');
        const prevBtn = document.getElementById('carousel-prev');
        const nextBtn = document.getElementById('carousel-next');
        
        if (!track || dots.length === 0) return;
        
        let currentIndex = 0;
        const totalSlides = dots.length;
        let autoPlayInterval;
        
        const goToSlide = (index) => {
            currentIndex = index;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
                dot.style.backgroundColor = i === index ? 'white' : 'rgba(255,255,255,0.5)';
            });
        };
        
        const nextSlide = () => {
            goToSlide((currentIndex + 1) % totalSlides);
        };
        
        const prevSlide = () => {
            goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
        };
        
        const startAutoPlay = () => {
            autoPlayInterval = setInterval(nextSlide, 4000);
        };
        
        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };
        
        // 绑定点击事件
        prevBtn?.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
        
        nextBtn?.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                goToSlide(parseInt(dot.dataset.index));
                stopAutoPlay();
                startAutoPlay();
            });
        });
        
        // 鼠标悬停暂停
        const carousel = document.getElementById('carousel');
        carousel?.addEventListener('mouseenter', stopAutoPlay);
        carousel?.addEventListener('mouseleave', startAutoPlay);
        
        // 初始化
        goToSlide(0);
        startAutoPlay();
    },

    bindContentZoomEvents() {
        const zoomIn = document.getElementById('content-zoom-in');
        const zoomOut = document.getElementById('content-zoom-out');
        const zoomReset = document.getElementById('content-zoom-reset');
        const zoomWrapper = document.getElementById('content-zoom-wrapper');
        const backBtn = document.getElementById('back-to-home');
        
        zoomIn?.addEventListener('click', () => {
            this.setContentScale(this.contentScale + 0.1);
        });
        
        zoomOut?.addEventListener('click', () => {
            this.setContentScale(this.contentScale - 0.1);
        });
        
        zoomReset?.addEventListener('click', () => {
            this.setContentScale(1);
        });
        
        // 返回首页按钮
        backBtn?.addEventListener('click', () => {
            this.goToHome();
        });
        
        // 滚轮缩放
        zoomWrapper?.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.setContentScale(this.contentScale + delta);
            }
        });
    },
    
    // 返回首页
    goToHome() {
        this.welcomePage.classList.remove('hidden');
        this.contentDisplay.classList.add('hidden');
        
        // 重置缩放
        this.setContentScale(1);
        
        // 重置首页缩放（先清空样式再设置为1）
        const welcomeContent = document.getElementById('welcome-content');
        if (welcomeContent) {
            welcomeContent.style.transform = 'scale(1)';
            welcomeContent.style.width = '';
            welcomeContent.style.marginLeft = '';
            welcomeContent.style.marginRight = '';
            welcomeContent.style.maxWidth = '';
        }
        this.welcomeScale = 1;
        const zoomLevel = document.getElementById('welcome-zoom-level');
        if (zoomLevel) zoomLevel.textContent = '100%';
        
        // 隐藏思维导图
        const mindmapPage = document.getElementById('mindmap-page');
        if (mindmapPage) {
            mindmapPage.classList.add('hidden');
        }
    },

    // 加载自定义章节
    loadCustomSections() {
            const customData = JSON.parse(localStorage.getItem('customSections') || '[]');
            // 将自定义章节添加到 knowledgeData
            customData.forEach(chapter => {
                knowledgeData.push(chapter);
            });
            
            // 重新加载进度数据（确保自定义章节的完成状态被恢复）
            if (typeof Progress !== 'undefined' && Progress.loadProgress) {
                Progress.loadProgress();
                Progress.updateProgressDisplay();
            }
        },
    
    // 保存自定义章节
    saveCustomSections() {
        const customData = JSON.parse(localStorage.getItem('customSections') || '[]');
        localStorage.setItem('customSections', JSON.stringify(customData));
    },

    // 生成导航树
    generateTree() {
        let html = '';
        
        knowledgeData.forEach((chapter, index) => {
            const isExpanded = this.getChapterState(chapter.id);
            const chapterClass = isExpanded ? 'expanded' : '';
            const isCustom = chapter.isCustom || false;
            
            html += `
                <div class="nav-item ${isCustom ? 'nav-item-custom' : ''}" data-chapter="${chapter.id}">
                    <div class="nav-chapter ${chapterClass}" data-chapter="${chapter.id}">
                        <div class="flex items-center space-x-2">
                            <span>${chapter.icon}</span>
                            <span>${chapter.title}</span>
                            ${isCustom ? `<button class="delete-chapter ml-auto text-gray-400 hover:text-red-500 hidden" data-chapter="${chapter.id}" title="删除">×</button>` : ''}
                        </div>
                        <svg class="arrow w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="nav-sections ${isExpanded ? 'block' : 'hidden'}">
            `;
            
            chapter.children.forEach(section => {
                const completedClass = section.completed ? 'completed' : '';
                const isSectionCustom = section.isCustom || false;
                html += `
                    <div class="nav-section ${completedClass} ${isSectionCustom ? 'section-custom' : ''}" 
                         data-section="${section.id}" 
                         data-chapter="${chapter.id}">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" ${section.completed ? 'checked' : ''} 
                                   data-section="${section.id}">
                            <span class="section-text">${section.title}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        this.tree.innerHTML = html;
    },

    // 获取章节展开状态（从localStorage）
    getChapterState(chapterId) {
        const states = JSON.parse(localStorage.getItem('chapterStates') || '{}');
        return states[chapterId] || false;
    },

    // 保存章节展开状态
    saveChapterState(chapterId, isExpanded) {
        const states = JSON.parse(localStorage.getItem('chapterStates') || '{}');
        states[chapterId] = isExpanded;
        localStorage.setItem('chapterStates', JSON.stringify(states));
    },

    // 绑定事件
    bindEvents() {
        this.tree.addEventListener('click', (e) => {
            // 优先检查：复选框点击 - 标记完成（必须在最前面，否则被nav-section拦截）
            const checkbox = e.target.closest('input[type="checkbox"]');
            if (checkbox) {
                e.stopPropagation();
                this.toggleSectionComplete(checkbox);
                return;
            }
            
            // 章节标题点击 - 展开/折叠
            const chapterHeader = e.target.closest('.nav-chapter');
            if (chapterHeader) {
                this.toggleChapter(chapterHeader);
                return;
            }
            
            // 子章节点击 - 显示内容（排除已处理的checkbox）
            const sectionItem = e.target.closest('.nav-section');
            if (sectionItem) {
                this.selectSection(sectionItem);
                return;
            }
        });

        // 移动端侧边栏切换
        this.sidebarToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
            this.sidebarOverlay.classList.toggle('hidden');
        });

        // 遮罩点击关闭侧边栏
        this.sidebarOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
            this.sidebarOverlay.classList.add('hidden');
        });
    },

    // 切换章节展开/折叠
    toggleChapter(chapterHeader) {
        const chapterId = chapterHeader.dataset.chapter;
        const sections = chapterHeader.nextElementSibling;
        const isExpanded = !sections.classList.contains('hidden');
        
        if (isExpanded) {
            sections.classList.add('hidden');
            chapterHeader.classList.remove('expanded');
        } else {
            sections.classList.remove('hidden');
            chapterHeader.classList.add('expanded');
        }
        
        this.saveChapterState(chapterId, !isExpanded);
    },

    // 展开指定章节（供外部调用，如思维导图）
    expandChapter(chapterId) {
        const chapterHeader = this.tree.querySelector(`.nav-chapter[data-chapter="${chapterId}"]`);
        if (chapterHeader) {
            const sections = chapterHeader.nextElementSibling;
            if (sections.classList.contains('hidden')) {
                sections.classList.remove('hidden');
                chapterHeader.classList.add('expanded');
                this.saveChapterState(chapterId, true);
            }
        }
    },

    // 选择子章节 - 显示内容
    selectSection(sectionItem) {
        const sectionId = sectionItem.dataset.section;
        const chapterId = sectionItem.dataset.chapter;
        
        // 更新当前章节（供思维导图使用）
        if (typeof Progress !== 'undefined') {
            Progress.currentSection = sectionId;
        }
        
        // 移除所有active状态
        this.tree.querySelectorAll('.nav-section.active').forEach(el => {
            el.classList.remove('active');
        });
        this.tree.querySelectorAll('.nav-chapter.active').forEach(el => {
            el.classList.remove('active');
        });
        
        // 添加active状态
        sectionItem.classList.add('active');
        const chapterHeader = sectionItem.closest('.nav-item').querySelector('.nav-chapter');
        chapterHeader.classList.add('active');
        
        // 显示内容
        this.showContent(chapterId, sectionId);
        
        // 移动端关闭侧边栏
        if (window.innerWidth < 768) {
            this.sidebar.classList.remove('open');
            this.sidebarOverlay.classList.add('hidden');
        }
    },

    // 切换章节完成状态
    toggleSectionComplete(checkbox) {
        const sectionId = checkbox.dataset.section;
        const sectionItem = checkbox.closest('.nav-section');
        
        // 更新数据
        knowledgeData.forEach(chapter => {
            chapter.children.forEach(section => {
                if (section.id === sectionId) {
                    section.completed = checkbox.checked;
                }
            });
        });
        
        // 更新UI
        if (checkbox.checked) {
            sectionItem.classList.add('completed');
        } else {
            sectionItem.classList.remove('completed');
        }
        
        // 保存进度
        Progress.saveProgress();
        
        // 更新进度显示
        Progress.updateProgressDisplay();
    },

    // 显示内容
    showContent(chapterId, sectionId) {
        // 隐藏欢迎页，显示内容区，隐藏思维导图
        this.welcomePage.classList.add('hidden');
        this.contentDisplay.classList.remove('hidden');
        
        // 重置缩放
        this.setContentScale(1);
        
        // 隐藏思维导图页面
        const mindmapPage = document.getElementById('mindmap-page');
        if (mindmapPage) {
            mindmapPage.classList.add('hidden');
        }
        
        // 查找章节和子章节数据
        let chapter = null;
        let section = null;
        
        knowledgeData.forEach(ch => {
            if (ch.id === chapterId) {
                chapter = ch;
                ch.children.forEach(sec => {
                    if (sec.id === sectionId) {
                        section = sec;
                    }
                });
            }
        });
        
        if (!chapter || !section) return;
        
        // 获取用户保存的笔记数据
        const userNotes = this.getUserNotes(sectionId);
        const userTest = this.getUserTest(sectionId);
        
        // 获取用户编辑的知识点内容（优先显示用户编辑的内容）
        const userKnowledge = this.getUserKnowledge(sectionId);
        const knowledgeContent = userKnowledge || section.content || '';
        const isEmptyKnowledge = !section.content?.trim() && !userKnowledge;
        
        // 生成内容HTML - 新布局：左侧知识区，右侧三个可编辑区域
        let html = `
            <div class="study-layout fade-in">
                <!-- 顶部标题 -->
                <div class="study-header">
                    <h2>${chapter.icon} ${chapter.title} - ${section.title}</h2>
                    <div class="header-actions">
                        <button id="open-knowledge-page" class="view-tab-btn" data-chapter="${chapterId}" data-section="${sectionId}" data-type="knowledge">📖 新页面打开知识点</button>
                        <button id="open-notes-page" class="view-tab-btn" data-chapter="${chapterId}" data-section="${sectionId}" data-type="notes">📝 新页面打开笔记</button>
                        <button id="open-test-page" class="view-tab-btn" data-chapter="${chapterId}" data-section="${sectionId}" data-type="test">📋 新页面打开练习题</button>
                        <button id="toggle-edit-mode" class="edit-mode-btn" data-section="${sectionId}">
                            <span class="edit-icon">✏️</span>
                            <span class="edit-text">编辑知识点</span>
                        </button>
                    </div>
                </div>
                
                <!-- 主内容区 -->
                <div class="study-container">
                    <!-- 左侧：知识展示区 -->
                    <div class="knowledge-panel">
                        <div class="panel-header knowledge-header">
                            <span class="panel-icon">📖</span>
                            <span class="panel-title">知识点</span>
                            <span class="md-hint text-xs text-gray-400 ml-2">支持 Markdown</span>
                            <button id="save-knowledge" class="save-knowledge-btn hidden" data-section="${sectionId}">保存修改</button>
                        </div>
                        <div class="knowledge-content markdown-body" id="knowledge-content">
                            ${isEmptyKnowledge ? `
                                <div class="empty-knowledge">
                                    <p>📚 本章节内容正在整理中...</p>
                                    <p>点击上方「编辑知识点」按钮添加内容</p>
                                </div>
                            ` : ''}
                        </div>
                        <textarea 
                            id="knowledge-editor" 
                            class="knowledge-editor hidden"
                            placeholder="在这里编写知识点内容，支持Markdown格式（如 # 标题、**粗体**、- 列表等）..."
                            data-section="${sectionId}"
                        >${knowledgeContent}</textarea>
                    </div>
                    
                    <!-- 右侧：用户学习区域 -->
                    <div class="user-panel" id="user-panel">
                        <!-- 学习笔记区 -->
                        <div class="note-section">
                            <div class="panel-header">
                                <span class="panel-icon">📝</span>
                                <span>学习笔记</span>
                            </div>
                            <textarea 
                                id="user-notes" 
                                class="note-textarea"
                                placeholder="在这里记录你的学习笔记、理解、心得..."
                                data-section="${sectionId}"
                            >${userNotes || ''}</textarea>
                            <div class="note-footer">
                                <span class="char-count">${(userNotes || '').length} 字</span>
                                <button id="save-notes" class="save-btn" data-section="${sectionId}">保存笔记</button>
                            </div>
                        </div>
                        
                        <!-- 练习测试区 -->
                        <div class="test-section">
                            <div class="panel-header">
                                <span class="panel-icon">✍️</span>
                                <span>练习题</span>
                                <span class="section-hint">（可粘贴面试题或练习题）</span>
                            </div>
                            <textarea 
                                id="user-test" 
                                class="test-textarea"
                                placeholder="在这里写下你遇到的问题、面试题或练习题..."
                                data-section="${sectionId}"
                            >${userTest || ''}</textarea>
                            <div class="note-footer">
                                <span class="char-count">${(userTest || '').length} 字</span>
                                <button id="save-test" class="save-btn" data-section="${sectionId}">保存题目</button>
                            </div>
                        </div>
                        
                        <!-- 学习建议区 -->
                        <div class="advice-section">
                            <div class="panel-header">
                                <span class="panel-icon">💡</span>
                                <span>学习建议</span>
                            </div>
                            <div class="advice-content">
                                <div class="advice-item">
                                    <span class="advice-num">1</span>
                                    <span>先理解核心概念，不要死记硬背</span>
                                </div>
                                <div class="advice-item">
                                    <span class="advice-num">2</span>
                                    <span>结合实际场景思考，如工作中的案例</span>
                                </div>
                                <div class="advice-item">
                                    <span class="advice-num">3</span>
                                    <span>动手实践，代码要多写多练</span>
                                </div>
                                <div class="advice-item">
                                    <span class="advice-num">4</span>
                                    <span>学会用自己的话复述，能讲出来才算真正理解</span>
                                </div>
                                <div class="advice-item">
                                    <span class="advice-num">5</span>
                                    <span>定期复习，形成长期记忆</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.contentBody.innerHTML = html;
        
        // 绑定笔记保存事件
        this.bindNoteEvents(sectionId);
    },
    
    // 获取用户笔记
    getUserNotes(sectionId) {
        const notesData = JSON.parse(localStorage.getItem('userNotes') || '{}');
        return notesData[sectionId] || '';
    },
    
    // 保存用户笔记
    saveUserNotes(sectionId, content) {
        const notesData = JSON.parse(localStorage.getItem('userNotes') || '{}');
        notesData[sectionId] = content;
        localStorage.setItem('userNotes', JSON.stringify(notesData));
    },
    
    // 获取用户测试题
    getUserTest(sectionId) {
        const testData = JSON.parse(localStorage.getItem('userTests') || '{}');
        return testData[sectionId] || '';
    },
    
    // 保存用户测试题
    saveUserTest(sectionId, content) {
        const testData = JSON.parse(localStorage.getItem('userTests') || '{}');
        testData[sectionId] = content;
        localStorage.setItem('userTests', JSON.stringify(testData));
    },
    
    // 绑定笔记相关事件
    bindNoteEvents(sectionId) {
        // 新页面打开功能
        document.querySelectorAll('[id^="open-"][id$="-page"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const chapterId = btn.dataset.chapter;
                const sectionId = btn.dataset.section;
                this.openInNewPage(type, chapterId, sectionId);
            });
        });
        
        // 保存笔记按钮
        const saveNotesBtn = document.getElementById('save-notes');
        const notesTextarea = document.getElementById('user-notes');
        
        if (saveNotesBtn && notesTextarea) {
            saveNotesBtn.addEventListener('click', () => {
                this.saveUserNotes(sectionId, notesTextarea.value);
                this.showSaveSuccess(saveNotesBtn);
            });
            
            // 实时更新字数统计
            notesTextarea.addEventListener('input', () => {
                const charCount = notesTextarea.parentElement.querySelector('.char-count');
                if (charCount) {
                    charCount.textContent = `${notesTextarea.value.length} 字`;
                }
            });
        }
        
        // 保存测试题按钮
        const saveTestBtn = document.getElementById('save-test');
        const testTextarea = document.getElementById('user-test');
        
        if (saveTestBtn && testTextarea) {
            saveTestBtn.addEventListener('click', () => {
                this.saveUserTest(sectionId, testTextarea.value);
                this.showSaveSuccess(saveTestBtn);
            });
            
            // 实时更新字数统计
            testTextarea.addEventListener('input', () => {
                const charCount = testTextarea.parentElement.querySelector('.char-count');
                if (charCount) {
                    charCount.textContent = `${testTextarea.value.length} 字`;
                }
            });
        }
        
        // 编辑模式切换 - 切换知识点的编辑状态
        const toggleBtn = document.getElementById('toggle-edit-mode');
        const knowledgeContent = document.getElementById('knowledge-content');
        const knowledgeEditor = document.getElementById('knowledge-editor');
        const saveKnowledgeBtn = document.getElementById('save-knowledge');
        
        if (toggleBtn && knowledgeContent && knowledgeEditor) {
            toggleBtn.addEventListener('click', () => {
                const isEditMode = toggleBtn.classList.contains('active');
                
                if (isEditMode) {
                    // 退出编辑模式
                    toggleBtn.classList.remove('active');
                    toggleBtn.querySelector('.edit-text').textContent = '编辑知识点';
                    knowledgeEditor.classList.add('hidden');
                    saveKnowledgeBtn.classList.add('hidden');
                    
                    // 显示编辑后的内容（Markdown 渲染）
                    const content = knowledgeEditor.value;
                    if (content.trim()) {
                        knowledgeContent.innerHTML = parseMarkdown(content);
                        knowledgeContent.classList.remove('hidden');
                    } else {
                        knowledgeContent.innerHTML = `
                            <div class="empty-knowledge">
                                <p>📚 本章节内容正在整理中...</p>
                                <p>点击上方「编辑知识点」按钮添加内容</p>
                            </div>
                        `;
                        knowledgeContent.classList.remove('hidden');
                    }
                } else {
                    // 进入编辑模式
                    toggleBtn.classList.add('active');
                    toggleBtn.querySelector('.edit-text').textContent = '完成编辑';
                    knowledgeContent.classList.add('hidden');
                    knowledgeEditor.classList.remove('hidden');
                    saveKnowledgeBtn.classList.remove('hidden');
                    knowledgeEditor.focus();
                }
            });
        }
        
        // 保存知识点内容
        if (saveKnowledgeBtn && knowledgeEditor) {
            saveKnowledgeBtn.addEventListener('click', () => {
                this.saveUserKnowledge(sectionId, knowledgeEditor.value);
                this.showSaveSuccess(saveKnowledgeBtn);
            });
        }
        
        // 初始化渲染 Markdown 内容
        if (knowledgeEditor && knowledgeEditor.value.trim() && knowledgeContent) {
            knowledgeContent.innerHTML = parseMarkdown(knowledgeEditor.value);
        }
    },
    
    // 获取用户编辑的知识点
    getUserKnowledge(sectionId) {
        const knowledgeData = JSON.parse(localStorage.getItem('userKnowledge') || '{}');
        return knowledgeData[sectionId] || '';
    },
    
    // 保存用户编辑的知识点
    saveUserKnowledge(sectionId, content) {
        const knowledgeData = JSON.parse(localStorage.getItem('userKnowledge') || '{}');
        knowledgeData[sectionId] = content;
        localStorage.setItem('userKnowledge', JSON.stringify(knowledgeData));
    },
    
    // 显示保存成功提示
    showSaveSuccess(btn) {
        const originalText = btn.textContent;
        btn.textContent = '已保存 ✓';
        btn.classList.add('success');
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('success');
        }, 1500);
    },

    // 在新页面打开内容
    openInNewPage(type, chapterId, sectionId) {
        // 查找章节数据
        let chapter = null;
        let section = null;
        knowledgeData.forEach(ch => {
            if (ch.id === chapterId) {
                chapter = ch;
                ch.children.forEach(sec => {
                    if (sec.id === sectionId) {
                        section = sec;
                    }
                });
            }
        });
        
        if (!chapter || !section) return;
        
        // 获取对应内容
        let title = '';
        let content = '';
        let placeholder = '';
        
        switch(type) {
            case 'knowledge':
                title = chapter.icon + ' ' + section.title + ' - 知识点';
                const userKnowledge = this.getUserKnowledge(sectionId);
                content = userKnowledge || section.content || '';
                placeholder = '在这里编写知识点内容，支持 Markdown 格式...';
                break;
            case 'notes':
                title = chapter.icon + ' ' + section.title + ' - 学习笔记';
                content = this.getUserNotes(sectionId) || '';
                placeholder = '在这里记录你的学习笔记、理解、心得...';
                break;
            case 'test':
                title = chapter.icon + ' ' + section.title + ' - 练习题';
                content = this.getUserTest(sectionId) || '';
                placeholder = '在这里写下你遇到的问题、面试题或练习题...';
                break;
        }
        
        // 生成新页面 HTML
        const htmlContent = this.generateNewPageHTML(title, content, placeholder, sectionId, type);
        
        // 打开新窗口
        const newWindow = window.open('', '_blank', 'width=1100,height=750,scrollbars=yes');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    },
    
    // 生成新页面 HTML 内容
    generateNewPageHTML(title, content, placeholder, sectionId, type) {
        // HTML 转义函数
        const escapeHTML = function(str) {
            if (!str) return '';
            return str.replace(/&/g, '&amp;')
                       .replace(/</g, '&lt;')
                       .replace(/>/g, '&gt;')
                       .replace(/"/g, '&quot;')
                       .replace(/'/g, '&#39;');
        };
        
        const escapedTitle = escapeHTML(title);
        const escapedContent = escapeHTML(content);
        const escapedPlaceholder = escapeHTML(placeholder);
        
        // 构建完整的 HTML 页面
        return '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>' + escapedTitle + '</title>\n' +
'    <style>\n' +
'        * { box-sizing: border-box; margin: 0; padding: 0; }\n' +
'        body { \n' +
'            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n' +
'            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);\n' +
'            min-height: 100vh;\n' +
'            padding: 24px;\n' +
'        }\n' +
'        .container { max-width: 1100px; margin: 0 auto; }\n' +
'        .header {\n' +
'            background: white;\n' +
'            padding: 16px 24px;\n' +
'            border-radius: 12px;\n' +
'            box-shadow: 0 2px 8px rgba(0,0,0,0.08);\n' +
'            margin-bottom: 20px;\n' +
'        }\n' +
'        .header-top {\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            align-items: center;\n' +
'            flex-wrap: wrap;\n' +
'            gap: 16px;\n' +
'            margin-bottom: 16px;\n' +
'        }\n' +
'        .header h1 { font-size: 20px; color: #333; }\n' +
'        .mode-switcher {\n' +
'            display: flex;\n' +
'            background: #f0f0f0;\n' +
'            border-radius: 8px;\n' +
'            padding: 4px;\n' +
'            gap: 4px;\n' +
'        }\n' +
'        .mode-btn {\n' +
'            padding: 8px 16px;\n' +
'            border: none;\n' +
'            background: transparent;\n' +
'            border-radius: 6px;\n' +
'            cursor: pointer;\n' +
'            font-size: 14px;\n' +
'            color: #666;\n' +
'            transition: all 0.2s;\n' +
'        }\n' +
'        .mode-btn:hover { background: #e0e0e0; }\n' +
'        .mode-btn.active {\n' +
'            background: #1890ff;\n' +
'            color: white;\n' +
'            box-shadow: 0 2px 4px rgba(24,144,255,0.3);\n' +
'        }\n' +
'        .content-area {\n' +
'            display: flex;\n' +
'            gap: 20px;\n' +
'            flex-wrap: wrap;\n' +
'        }\n' +
'        .content-pane {\n' +
'            flex: 1;\n' +
'            min-width: 300px;\n' +
'            background: white;\n' +
'            border-radius: 12px;\n' +
'            box-shadow: 0 2px 8px rgba(0,0,0,0.08);\n' +
'            overflow: hidden;\n' +
'            display: none;\n' +
'        }\n' +
'        .content-pane.active { display: block; }\n' +
'        .content-area.split-mode .content-pane { display: block; }\n' +
'        .pane-header {\n' +
'            padding: 12px 16px;\n' +
'            background: #fafafa;\n' +
'            border-bottom: 1px solid #eee;\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            align-items: center;\n' +
'        }\n' +
'        .pane-header h3 { font-size: 14px; color: #666; }\n' +
'        .editor {\n' +
'            width: 100%;\n' +
'            min-height: 500px;\n' +
'            padding: 20px;\n' +
'            border: none;\n' +
'            font-size: 15px;\n' +
'            line-height: 1.8;\n' +
'            resize: vertical;\n' +
'            font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;\n' +
'        }\n' +
'        .editor:focus { outline: none; }\n' +
'        .preview {\n' +
'            padding: 20px;\n' +
'            min-height: 500px;\n' +
'            line-height: 1.8;\n' +
'            overflow-y: auto;\n' +
'            max-height: 80vh;\n' +
'        }\n' +
'        .preview h1 { font-size: 28px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin: 0 0 20px; }\n' +
'        .preview h2 { font-size: 24px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin: 24px 0 16px; }\n' +
'        .preview h3 { font-size: 20px; margin: 20px 0 12px; }\n' +
'        .preview h4 { font-size: 18px; margin: 16px 0 10px; }\n' +
'        .preview p { margin: 12px 0; }\n' +
'        .preview ul, .preview ol { margin: 12px 0; padding-left: 24px; }\n' +
'        .preview li { margin: 6px 0; }\n' +
'        .preview blockquote {\n' +
'            border-left: 4px solid #1890ff;\n' +
'            background: #f0f7ff;\n' +
'            padding: 12px 16px;\n' +
'            margin: 16px 0;\n' +
'            border-radius: 0 8px 8px 0;\n' +
'        }\n' +
'        .preview code {\n' +
'            background: #f5f5f5;\n' +
'            padding: 2px 6px;\n' +
'            border-radius: 4px;\n' +
'            font-family: "Monaco", "Menlo", monospace;\n' +
'            font-size: 14px;\n' +
'        }\n' +
'        .preview pre {\n' +
'            background: #1e1e1e;\n' +
'            color: #d4d4d4;\n' +
'            padding: 16px;\n' +
'            border-radius: 8px;\n' +
'            overflow-x: auto;\n' +
'            margin: 16px 0;\n' +
'        }\n' +
'        .preview pre code { background: transparent; padding: 0; color: inherit; }\n' +
'        .preview strong { font-weight: 600; }\n' +
'        .preview em { font-style: italic; }\n' +
'        .preview del { text-decoration: line-through; color: #999; }\n' +
'        .preview a { color: #1890ff; text-decoration: none; }\n' +
'        .preview a:hover { text-decoration: underline; }\n' +
'        .preview img { max-width: 100%; border-radius: 8px; }\n' +
'        .preview hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }\n' +
'        .preview table { border-collapse: collapse; width: 100%; margin: 16px 0; }\n' +
'        .preview th, .preview td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }\n' +
'        .preview th { background: #f5f5f5; font-weight: 600; }\n' +
'        .toolbar {\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            align-items: center;\n' +
'            margin-top: 16px;\n' +
'            flex-wrap: wrap;\n' +
'            gap: 12px;\n' +
'        }\n' +
'        .toolbar-left { display: flex; gap: 8px; align-items: center; }\n' +
'        .char-count { color: #999; font-size: 13px; }\n' +
'        .save-btn {\n' +
'            padding: 10px 24px;\n' +
'            background: #1890ff;\n' +
'            color: white;\n' +
'            border: none;\n' +
'            border-radius: 8px;\n' +
'            cursor: pointer;\n' +
'            font-size: 14px;\n' +
'            transition: background 0.2s;\n' +
'        }\n' +
'        .save-btn:hover { background: #40a9ff; }\n' +
'        .save-btn.success { background: #52c41a; }\n' +
'        .save-btn.hidden { display: none; }\n' +
'        .back-link { color: #1890ff; text-decoration: none; font-size: 14px; }\n' +
'        .back-link:hover { text-decoration: underline; }\n' +
'        .hint-tag { font-size: 12px; color: #999; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <div class="container">\n' +
'        <div class="header">\n' +
'            <div class="header-top">\n' +
'                <h1>' + escapedTitle + '</h1>\n' +
'                <div class="mode-switcher">\n' +
'                    <button class="mode-btn active" data-mode="view">只读浏览</button>\n' +
'                    <button class="mode-btn" data-mode="edit">编辑编写</button>\n' +
'                    <button class="mode-btn" data-mode="split">分栏显示</button>\n' +
'                </div>\n' +
'            </div>\n' +
'            <div class="toolbar">\n' +
'                <div class="toolbar-left">\n' +
'                    <button class="save-btn" id="saveBtn">保存</button>\n' +
'                    <span class="char-count" id="charCount">0 字</span>\n' +
'                    <span class="hint-tag" id="modeHint">Markdown 渲染</span>\n' +
'                </div>\n' +
'                <a href="javascript:window.close()" class="back-link">关闭页面</a>\n' +
'            </div>\n' +
'        </div>\n' +
'        <div class="content-area" id="contentArea">\n' +
'            <div class="content-pane" id="editPane">\n' +
'                <div class="pane-header">\n' +
'                    <h3>编辑器</h3>\n' +
'                    <span class="hint-tag">支持 Markdown</span>\n' +
'                </div>\n' +
'                <textarea class="editor" id="editor" placeholder="' + escapedPlaceholder + '">' + escapedContent + '</textarea>\n' +
'            </div>\n' +
'            <div class="content-pane active" id="previewPane">\n' +
'                <div class="pane-header">\n' +
'                    <h3>预览</h3>\n' +
'                    <span class="hint-tag">Markdown 渲染</span>\n' +
'                </div>\n' +
'                <div class="preview" id="preview"></div>\n' +
'            </div>\n' +
'        </div>\n' +
'    </div>\n' +
'    <script>\n' +
'        var sectionId = "' + sectionId + '";\n' +
'        var type = "' + type + '";\n' +
'        var editor = document.getElementById("editor");\n' +
'        var preview = document.getElementById("preview");\n' +
'        var saveBtn = document.getElementById("saveBtn");\n' +
'        var charCount = document.getElementById("charCount");\n' +
'        var contentArea = document.getElementById("contentArea");\n' +
'        var editPane = document.getElementById("editPane");\n' +
'        var previewPane = document.getElementById("previewPane");\n' +
'        var modeBtns = document.querySelectorAll(".mode-btn");\n' +
'        var modeHint = document.getElementById("modeHint");\n' +
'        var currentMode = "view";\n' +
'        \n' +
'        function parseMarkdown(text) {\n' +
'            if (!text) return "<p style=\'color:#999;\'>暂无内容</p>";\n' +
'            var html = text;\n' +
'            var escapeHtml = function(str) {\n' +
'                return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");\n' +
'            };\n' +
'            // 代码块\n' +
'            html = html.replace(/```(\\w*)\\n?([\\s\\S]*?)```/g, function(_, lang, code) {\n' +
'                return "<pre><code class=\'language-" + lang + "\'>" + escapeHtml(code.trim()) + "</code></pre>";\n' +
'            });\n' +
'            // 行内代码\n' +
'            html = html.replace(/`([^`]+)`/g, "<code>$1</code>");\n' +
'            // 标题\n' +
'            html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>");\n' +
'            html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>");\n' +
'            html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");\n' +
'            html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");\n' +
'            html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");\n' +
'            html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");\n' +
'            // 加粗斜体\n' +
'            html = html.replace(/\\*\\*\\*(.+?)\\*\\*\\*/g, "<strong><em>$1</em></strong>");\n' +
'            html = html.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");\n' +
'            html = html.replace(/\\*(.+?)\\*/g, "<em>$1</em>");\n' +
'            html = html.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");\n' +
'            html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");\n' +
'            html = html.replace(/_(.+?)_/g, "<em>$1</em>");\n' +
'            // 删除线\n' +
'            html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");\n' +
'            // 链接图片\n' +
'            html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, "<a href=\'$2\' target=\'_blank\'>$1</a>");\n' +
'            html = html.replace(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/g, "<img src=\'$2\' alt=\'$1\'>");\n' +
'            // 引用块\n' +
'            html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");\n' +
'            // 列表\n' +
'            html = html.replace(/^[\\*\\-] (.+)$/gm, "<li>$1</li>");\n' +
'            html = html.replace(/(<li>.*<\\/li>\\n?)+/g, "<ul>$&</ul>");\n' +
'            html = html.replace(/^\\d+\\. (.+)$/gm, "<li>$1</li>");\n' +
'            // 分隔线\n' +
'            html = html.replace(/^---+$/gm, "<hr>");\n' +
'            html = html.replace(/^\\*\\*\\*+$/gm, "<hr>");\n' +
'            // 段落\n' +
'            var paragraphs = html.split(/\\n\\n+/);\n' +
'            html = paragraphs.map(function(p) {\n' +
'                p = p.trim();\n' +
'                if (!p) return "";\n' +
'                if (p.indexOf("<h") === 0 || p.indexOf("<ul") === 0 || p.indexOf("<ol") === 0 || \n' +
'                    p.indexOf("<blockquote") === 0 || p.indexOf("<pre") === 0 || p.indexOf("<hr") === 0 ||\n' +
'                    p.indexOf("<li") === 0) {\n' +
'                    return p;\n' +
'                }\n' +
'                return "<p>" + p.replace(/\\n/g, "<br>") + "</p>";\n' +
'            }).join("\\n");\n' +
'            return html;\n' +
'        }\n' +
'        \n' +
'        function renderPreview() {\n' +
'            preview.innerHTML = parseMarkdown(editor.value);\n' +
'            charCount.textContent = editor.value.length + " 字";\n' +
'        }\n' +
'        \n' +
'        function setMode(mode) {\n' +
'            currentMode = mode;\n' +
'            modeBtns.forEach(function(btn) {\n' +
'                btn.classList.toggle("active", btn.dataset.mode === mode);\n' +
'            });\n' +
'            contentArea.classList.remove("split-mode");\n' +
'            editPane.classList.remove("active");\n' +
'            previewPane.classList.remove("active");\n' +
'            \n' +
'            if (mode === "view") {\n' +
'                previewPane.classList.add("active");\n' +
'                modeHint.textContent = "只读模式";\n' +
'                saveBtn.classList.add("hidden");\n' +
'            } else if (mode === "edit") {\n' +
'                editPane.classList.add("active");\n' +
'                modeHint.textContent = "编辑模式";\n' +
'                saveBtn.classList.remove("hidden");\n' +
'            } else if (mode === "split") {\n' +
'                contentArea.classList.add("split-mode");\n' +
'                modeHint.textContent = "分栏模式：左编右预览";\n' +
'                saveBtn.classList.remove("hidden");\n' +
'            }\n' +
'        }\n' +
'        \n' +
'        function loadData() {\n' +
'            var key = type === "knowledge" ? "userKnowledge" : (type === "notes" ? "userNotes" : "userTests");\n' +
'            var data = JSON.parse(localStorage.getItem(key) || "{}");\n' +
'            return data[sectionId] || "";\n' +
'        }\n' +
'        \n' +
'        function saveData() {\n' +
'            var key = type === "knowledge" ? "userKnowledge" : (type === "notes" ? "userNotes" : "userTests");\n' +
'            var data = JSON.parse(localStorage.getItem(key) || "{}");\n' +
'            data[sectionId] = editor.value;\n' +
'            localStorage.setItem(key, JSON.stringify(data));\n' +
'            saveBtn.textContent = "已保存 ✓";\n' +
'            saveBtn.classList.add("success");\n' +
'            setTimeout(function() {\n' +
'                saveBtn.textContent = "保存";\n' +
'                saveBtn.classList.remove("success");\n' +
'            }, 1500);\n' +
'        }\n' +
'        \n' +
'        editor.value = loadData();\n' +
'        renderPreview();\n' +
'        setMode("view");\n' +
'        \n' +
'        modeBtns.forEach(function(btn) {\n' +
'            btn.addEventListener("click", function() {\n' +
'                setMode(btn.dataset.mode);\n' +
'            });\n' +
'        });\n' +
'        \n' +
'        editor.addEventListener("input", function() {\n' +
'            renderPreview();\n' +
'        });\n' +
'        \n' +
'        saveBtn.addEventListener("click", saveData);\n' +
'        \n' +
'        editor.addEventListener("keydown", function(e) {\n' +
'            if ((e.ctrlKey || e.metaKey) && e.key === "s") {\n' +
'                e.preventDefault();\n' +
'                if (currentMode !== "view") saveData();\n' +
'            }\n' +
'        });\n' +
'        \n' +
'        window.addEventListener("storage", function(e) {\n' +
'            var key = type === "knowledge" ? "userKnowledge" : (type === "notes" ? "userNotes" : "userTests");\n' +
'            if (e.key === key) {\n' +
'                editor.value = loadData();\n' +
'                renderPreview();\n' +
'            }\n' +
'        });\n' +
'    <\/script>\n' +
'</body>\n' +
'</html>';
    },

    // 统一搜索：高亮 + 显示/隐藏 + 展开（一次性完成）
    searchAndHighlight(searchTerm) {
        const chapters = this.tree.querySelectorAll('.nav-item');
        const term = searchTerm.toLowerCase();
        
        chapters.forEach(chapter => {
            // 检查章节标题是否匹配
            const chapterTitleEl = chapter.querySelector('.nav-chapter span:nth-child(2)');
            const chapterTitle = chapterTitleEl ? chapterTitleEl.textContent.toLowerCase() : '';
            const sections = chapter.querySelectorAll('.nav-section');
            
            let chapterHasMatch = chapterTitle.includes(term);
            let sectionMatchCount = 0;
            
            // 检查每个子章节
            sections.forEach(section => {
                const textEl = section.querySelector('.section-text');
                if (!textEl) return;
                
                const sectionText = textEl.textContent.toLowerCase();
                const isMatch = sectionText.includes(term) || chapterTitle.includes(term);
                
                if (isMatch) {
                    sectionMatchCount++;
                    section.classList.add('bg-yellow-100', 'search-match');
                    section.style.display = '';
                    // 高亮匹配的文字
                    this.highlightText(textEl, term);
                } else {
                    section.classList.remove('bg-yellow-100', 'search-match');
                    section.style.display = 'none';
                }
            });
            
            if (chapterHasMatch || sectionMatchCount > 0) {
                // 章节有匹配项，展开并显示
                chapter.style.display = '';
                const sectionsDiv = chapter.querySelector('.nav-sections');
                const chapterHeader = chapter.querySelector('.nav-chapter');
                if (sectionsDiv) sectionsDiv.classList.remove('hidden');
                if (chapterHeader) chapterHeader.classList.add('expanded');
                this.saveChapterState(chapter.dataset.chapter, true);
            } else {
                // 章节无匹配项，隐藏
                chapter.style.display = 'none';
            }
        });
    },
    
    // 高亮文本中的匹配词
    highlightText(element, term) {
        const text = element.textContent;
        if (!text) return;
        
        // 只高亮一次，避免重复包装
        if (element.innerHTML.includes('<mark>')) return;
        
        const regex = new RegExp(`(${term})`, 'gi');
        element.innerHTML = text.replace(regex, '<mark class="bg-yellow-300 rounded px-0.5">$1</mark>');
    },

    // 清除搜索高亮
    clearHighlight() {
        const sections = this.tree.querySelectorAll('.nav-section');
        sections.forEach(section => {
            section.classList.remove('bg-yellow-100', 'search-match');
            section.style.display = '';
            // 恢复原始文本（移除mark标签）
            const textEl = section.querySelector('.section-text');
            if (textEl && textEl.innerHTML.includes('<mark')) {
                textEl.textContent = textEl.textContent;
            }
        });
        
        const chapters = this.tree.querySelectorAll('.nav-item');
        chapters.forEach(chapter => {
            chapter.style.display = '';
        });
    },
    
    // 绑定新增章节相关事件
    bindAddSectionEvents() {
        const modal = document.getElementById('add-section-modal');
        const addBtn = document.getElementById('add-section-btn');
        const closeBtn = document.getElementById('close-add-modal');
        const cancelBtn = document.getElementById('cancel-add-section');
        const confirmBtn = document.getElementById('confirm-add-section');
        const titleInput = document.getElementById('new-chapter-title');
        const contentInput = document.getElementById('new-chapter-content');
        const iconBtns = document.querySelectorAll('.icon-picker');
        
        // 打开弹窗
        addBtn?.addEventListener('click', () => {
            modal.classList.remove('hidden');
            titleInput.value = '';
            contentInput.value = '';
            // 重置图标选择
            iconBtns.forEach(btn => btn.classList.remove('selected'));
            iconBtns[0].classList.add('selected');
        });
        
        // 关闭弹窗
        const closeModal = () => modal.classList.add('hidden');
        closeBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);
        
        // 点击遮罩关闭
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // 图标选择
        iconBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                iconBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        
        // 确认添加
        confirmBtn?.addEventListener('click', () => {
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            const selectedIcon = document.querySelector('.icon-picker.selected');
            const icon = selectedIcon?.dataset.icon || '📚';
            
            if (!title) {
                alert('请输入章节标题');
                return;
            }
            
            // 创建新章节
            const chapterId = 'custom-' + Date.now();
            const newChapter = {
                id: chapterId,
                title: title,
                icon: icon,
                isCustom: true,
                children: [
                    {
                        id: chapterId + '-main',
                        title: title,
                        content: content,
                        completed: false,
                        isCustom: true
                    }
                ]
            };
            
            // 保存到本地存储
            const customData = JSON.parse(localStorage.getItem('customSections') || '[]');
            customData.push(newChapter);
            localStorage.setItem('customSections', JSON.stringify(customData));
            
            // 添加到 knowledgeData
            knowledgeData.push(newChapter);
            
            // 重新生成导航树
            this.generateTree();
            
            // 关闭弹窗
            closeModal();
            
            // 提示成功
            AppUtils.showSuccessMessage?.('章节添加成功！');
        });
    }
};