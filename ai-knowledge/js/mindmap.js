// AI编程知识体系 - 思维导图模块
// 实现中心辐射式布局的交互式知识地图

(function() {
    'use strict';

    // 思维导图模块
    const Mindmap = {
        // 配置
        config: {
            centerRadius: 80,          // 中心节点半径
            nodeRadius: 60,            // 一级节点半径
            level2Offset: 120,         // 二级节点偏移距离（默认）
            nodeColors: [
                '#667eea', '#f093fb', '#f5576c', '#4facfe',
                '#43e97b', '#fa709a', '#fee140', '#fa709a',
                '#a8edea', '#fed6e3', '#d299c2', '#f5af19'
            ],
            animationDuration: 300,
            // 子节点展开配置
            childNodeConfig: {
                small: { maxCount: 3, spreadAngle: Math.PI / 4, offset: 150 },
                medium: { maxCount: 5, spreadAngle: Math.PI / 2.5, offset: 140 },
                large: { spreadAngle: Math.PI / 1.8, offset: 130 }
            }
        },

        // 状态
        state: {
            expandedNodes: new Set(),
            container: null,
            svg: null,
            nodesContainer: null,
            scale: 1,           // 当前缩放比例
            minScale: 0.3,       // 最小缩放
            maxScale: 2,         // 最大缩放
            // 拖动相关
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            translateX: 0,       // 累计拖动偏移 X
            translateY: 0        // 累计拖动偏移 Y
        },

        // 初始化
        init() {
            this.state.container = document.getElementById('mindmap-container');
            this.state.svg = document.getElementById('mindmap-lines');
            this.state.nodesContainer = document.getElementById('mindmap-nodes');

            if (!this.state.container) {
                console.error('思维导图容器未找到');
                return;
            }

            this.renderMindmap();
            this.bindEvents();
        },

        // 渲染思维导图
        renderMindmap() {
            // 先清理旧的一级节点和连线
            this.clearBaseNodes();

            const container = this.state.container;
            const containerRect = container.getBoundingClientRect();
            
            // 如果容器还没完全加载，延迟重试
            if (containerRect.width === 0 || containerRect.height === 0) {
                setTimeout(() => this.renderMindmap(), 100);
                return;
            }

            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;

            // 计算每个一级节点的半径和角度
            const nodeCount = knowledgeData.length;
            const baseRadius = 280;  // 固定像素值，确保所有连线等长

            // 绘制连线（在节点之后绘制，确保连线在底层）
            
            // 渲染一级节点（先渲染所有节点）
            knowledgeData.forEach((chapter, index) => {
                this.renderNode(chapter, index, centerX, centerY, baseRadius, nodeCount);
            });

            // 最后绘制连线（确保在节点下方）
            this.drawLines(centerX, centerY, baseRadius, nodeCount);

            // 设置中心节点位置（使用CSS定位）
            this.positionCenterNode(centerX, centerY);
        },

        // 定位中心节点
        positionCenterNode(centerX, centerY) {
            const centerEl = document.getElementById('mindmap-center');
            if (centerEl) {
                centerEl.style.left = `${centerX}px`;
                centerEl.style.top = `${centerY}px`;
            }
        },

        // 清理基础节点（一级节点和主连线）
        clearBaseNodes() {
            // 移除一级节点和子节点
            const allNodes = this.state.nodesContainer.querySelectorAll('.mindmap-node, .mindmap-child-node');
            allNodes.forEach(node => node.remove());
            
            // 清空所有连线
            this.state.svg.innerHTML = '';
            
            // 重置展开状态
            this.state.expandedNodes.clear();
        },

        // 绘制中心到各节点的连线
        drawLines(centerX, centerY, radius, nodeCount) {
            const svg = this.state.svg;
            
            // 只清空主连线，保留子连线（子连线由expandNode管理）
            const existingChildLines = svg.querySelectorAll('.mindmap-line-child');
            svg.innerHTML = '';
            // 恢复子连线
            existingChildLines.forEach(line => svg.appendChild(line));

            // 设置SVG尺寸
            const container = this.state.container;
            svg.setAttribute('width', container.offsetWidth);
            svg.setAttribute('height', container.offsetHeight);

            for (let i = 0; i < nodeCount; i++) {
                const angle = this.getNodeAngle(i, nodeCount);
                const nodeX = centerX + radius * Math.cos(angle);
                const nodeY = centerY + radius * Math.sin(angle);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', centerX);
                line.setAttribute('y1', centerY);
                line.setAttribute('x2', nodeX);
                line.setAttribute('y2', nodeY);
                line.classList.add('mindmap-line');

                svg.appendChild(line);
            }
        },

        // 渲染单个一级节点
        renderNode(chapter, index, centerX, centerY, radius, nodeCount) {
            const node = document.createElement('div');
            node.className = 'mindmap-node node-level-1';
            node.dataset.chapterId = chapter.id;

            // 计算位置 - 统一角度算法
            const angle = this.getNodeAngle(index, nodeCount);
            const nodeX = centerX + radius * Math.cos(angle);
            const nodeY = centerY + radius * Math.sin(angle);

            // 计算完成进度
            const completedCount = chapter.children.filter(child => {
                return Progress && Progress.progressData[child.id]?.completed;
            }).length;
            const totalCount = chapter.children.length;

            // 统一节点样式：白色背景 + 彩色边框 + 横向排列
            const colorIndex = index % this.config.nodeColors.length;
            
            // 截断过长标题
            const displayTitle = chapter.title.length > 8 ? chapter.title.substring(0, 7) + '...' : chapter.title;

            node.innerHTML = `
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="font-size:14px;flex-shrink:0;">${chapter.icon}</span>
                    <span style="font-weight:600;font-size:11px;white-space:nowrap;">${displayTitle}</span>
                    ${totalCount > 0 ? `<span style="font-size:9px;opacity:0.6;">${completedCount}/${totalCount}</span>` : ''}
                </div>
            `;

            // 统一样式
            node.style.background = '#fff';
            node.style.borderColor = this.config.nodeColors[colorIndex];
            node.style.color = '#333';
            node.style.borderWidth = '2px';
            node.style.borderStyle = 'solid';

            // 定位
            node.style.left = `${nodeX}px`;
            node.style.top = `${nodeY}px`;
            node.style.transform = 'translate(-50%, -50%)';

            this.state.nodesContainer.appendChild(node);
        },

        // 获取节点的角度（与drawLines保持一致）
        getNodeAngle(index, nodeCount) {
            return (2 * Math.PI / nodeCount) * index - Math.PI / 2;
        },

        // 展开/收起子节点
        toggleNode(chapterId) {
            const chapter = knowledgeData.find(c => c.id === chapterId);
            if (!chapter) return;

            if (this.state.expandedNodes.has(chapterId)) {
                this.collapseNode(chapterId);
                this.state.expandedNodes.delete(chapterId);
            } else {
                this.expandNode(chapter);
                this.state.expandedNodes.add(chapterId);
            }
        },

        // 展开节点
        expandNode(chapter) {
            const chapterIndex = knowledgeData.findIndex(c => c.id === chapter.id);
            const nodeEl = document.querySelector(`[data-chapter-id="${chapter.id}"]`);
            if (!nodeEl) return;

            const nodeRect = nodeEl.getBoundingClientRect();
            const containerRect = this.state.container.getBoundingClientRect();
            // 减去拖动偏移量（getBoundingClientRect包含transform偏移）
            const offsetX = this.state.translateX / this.state.scale;
            const offsetY = this.state.translateY / this.state.scale;
            const nodeX = nodeRect.left - containerRect.left + nodeRect.width / 2 - offsetX;
            const nodeY = nodeRect.top - containerRect.top + nodeRect.height / 2 - offsetY;

            // 计算主节点角度
            const containerCenterX = containerRect.width / 2;
            const containerCenterY = containerRect.height / 2;
            const baseRadius = 280;
            const mainAngle = this.getNodeAngle(chapterIndex, knowledgeData.length);

            // 调整主节点位置（向中心收缩一点）
            const newRadius = baseRadius * 0.90;
            const newX = containerCenterX + newRadius * Math.cos(mainAngle);
            const newY = containerCenterY + newRadius * Math.sin(mainAngle);
            nodeEl.style.left = `${newX}px`;
            nodeEl.style.top = `${newY}px`;
            nodeEl.classList.add('expanded');

            // 绘制从主节点到子节点的连线
            this.drawChildLines(chapter.id, nodeX, nodeY, chapter.children.length, mainAngle);

            // 创建子节点
            const childCount = chapter.children.length;
            // 根据子节点数量调整展开角度和偏移距离
            let spreadAngle, childOffset;
            if (childCount <= 3) {
                spreadAngle = Math.PI / 4;  // 45度
                childOffset = 150;
            } else if (childCount <= 5) {
                spreadAngle = Math.PI / 2.5;  // 72度
                childOffset = 140;
            } else {
                spreadAngle = Math.PI / 1.8;  // 100度，更大的展开角度
                childOffset = 130;
            }
            
            const startAngle = mainAngle - spreadAngle / 2;

            chapter.children.forEach((child, index) => {
                const childNode = document.createElement('div');
                childNode.className = 'mindmap-child-node';
                childNode.dataset.sectionId = child.id;

                // 根据进度设置样式
                if (Progress && Progress.progressData[child.id]?.completed) {
                    childNode.classList.add('completed');
                } else if (Progress && Progress.currentSection === child.id) {
                    childNode.classList.add('active');
                }

                // 根据完成状态设置边框颜色
                const borderColor = this.config.nodeColors[chapterIndex % this.config.nodeColors.length];
                childNode.style.borderColor = borderColor;
                childNode.style.color = borderColor;

                childNode.innerHTML = child.title;

                // 计算子节点位置 - 更均匀的分布
                const angleStep = spreadAngle / (childCount - 1 || 1);
                const childAngle = startAngle + angleStep * index;

                const finalX = nodeX + childOffset * Math.cos(childAngle);
                const finalY = nodeY + childOffset * Math.sin(childAngle);

                // 初始位置在父节点
                childNode.style.left = `${nodeX}px`;
                childNode.style.top = `${nodeY}px`;
                childNode.style.transform = 'translate(-50%, -50%) scale(0)';
                childNode.style.opacity = '0';

                // 添加点击事件
                childNode.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectSection(child.id, chapter.id);
                });

                // 添加悬停事件
                childNode.addEventListener('mouseenter', () => {
                    childNode.style.boxShadow = `0 0 15px ${borderColor}40`;
                });
                childNode.addEventListener('mouseleave', () => {
                    childNode.style.boxShadow = '';
                });

                this.state.nodesContainer.appendChild(childNode);

                // 添加动画 - 从中心向目标位置展开
                setTimeout(() => {
                    childNode.style.left = `${finalX}px`;
                    childNode.style.top = `${finalY}px`;
                    childNode.style.transform = 'translate(-50%, -50%) scale(1)';
                    childNode.style.opacity = '1';
                }, 50 + index * 80);
            });
        },

        // 绘制子节点连线
        drawChildLines(chapterId, parentX, parentY, childCount, mainAngle) {
            let spreadAngle, childOffset;
            if (childCount <= 3) {
                spreadAngle = Math.PI / 4;
                childOffset = 150;
            } else if (childCount <= 5) {
                spreadAngle = Math.PI / 2.5;
                childOffset = 140;
            } else {
                spreadAngle = Math.PI / 1.8;
                childOffset = 130;
            }
            
            const startAngle = mainAngle - spreadAngle / 2;
            const angleStep = spreadAngle / (childCount - 1 || 1);

            for (let i = 0; i < childCount; i++) {
                const childAngle = startAngle + angleStep * i;
                const childX = parentX + childOffset * Math.cos(childAngle);
                const childY = parentY + childOffset * Math.sin(childAngle);

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parentX);
                line.setAttribute('y1', parentY);
                line.setAttribute('x2', childX);
                line.setAttribute('y2', childY);
                line.classList.add('mindmap-line');
                line.classList.add('mindmap-line-child');

                this.state.svg.appendChild(line);
            }
        },

        // 收起节点
        collapseNode(chapterId) {
            // 移除所有子节点
            const childNodes = this.state.nodesContainer.querySelectorAll('.mindmap-child-node');
            childNodes.forEach(node => node.remove());

            // 移除子节点连线
            const childLines = this.state.svg.querySelectorAll('.mindmap-line-child');
            childLines.forEach(line => line.remove());

            // 恢复主节点样式（不重绘全部）
            const nodeEl = document.querySelector(`[data-chapter-id="${chapterId}"]`);
            if (nodeEl) {
                nodeEl.classList.remove('expanded');
                // 重新计算该节点的正确位置
                const containerRect = this.state.container.getBoundingClientRect();
                const centerX = containerRect.width / 2;
                const centerY = containerRect.height / 2;
                const nodeCount = knowledgeData.length;
                const baseRadius = 280;
                const index = knowledgeData.findIndex(c => c.id === chapterId);
                
                if (index >= 0) {
                    const angle = this.getNodeAngle(index, nodeCount);
                    const newX = centerX + baseRadius * Math.cos(angle);
                    const newY = centerY + baseRadius * Math.sin(angle);
                    nodeEl.style.left = `${newX}px`;
                    nodeEl.style.top = `${newY}px`;
                    nodeEl.style.transform = 'translate(-50%, -50%)';
                    
                    // 更新连线
                    this.drawLines(centerX, centerY, baseRadius, nodeCount);
                }
            }
        },

        // 选择章节
        selectSection(sectionId, chapterId) {
            // 收起所有展开的节点
            this.state.expandedNodes.forEach(id => {
                this.collapseNode(id);
            });
            this.state.expandedNodes.clear();

            // 导航到对应章节
            if (typeof Navigation !== 'undefined') {
                // 展开左侧导航树的对应章节
                Navigation.expandChapter(chapterId);

                // 找到对应的section元素并选中
                const sectionEl = document.querySelector(`[data-section="${sectionId}"]`);
                if (sectionEl) {
                    Navigation.selectSection(sectionEl);
                }
            }
        },

        // 重置视图
        resetView() {
            this.state.translateX = 0;
            this.state.translateY = 0;
            this.state.scale = 1;
            this.applyTransform();
        },

        // 绑定事件
        bindEvents() {
            const content = document.getElementById('mindmap-content');
            
            // 鼠标拖动
            content.addEventListener('mousedown', (e) => {
                if (e.target.closest('.mindmap-node, .mindmap-child-node')) return;
                this.state.isDragging = true;
                this.state.dragStartX = e.clientX - this.state.translateX;
                this.state.dragStartY = e.clientY - this.state.translateY;
                content.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!this.state.isDragging) return;
                this.state.translateX = e.clientX - this.state.dragStartX;
                this.state.translateY = e.clientY - this.state.dragStartY;
                this.applyTransform();
            });

            document.addEventListener('mouseup', () => {
                this.state.isDragging = false;
                if (content) content.style.cursor = 'grab';
            });

            // 滚轮缩放
            content.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.setScale(this.state.scale + delta);
            });

            // 主节点点击事件
            this.state.nodesContainer.addEventListener('click', (e) => {
                const node = e.target.closest('.mindmap-node');
                if (node && node.classList.contains('node-level-1')) {
                    const chapterId = node.dataset.chapterId;
                    this.toggleNode(chapterId);
                }
            });

            // 返回首页按钮
            document.getElementById('back-home')?.addEventListener('click', () => {
                this.hide();
                // 显示欢迎页面
                const welcomePage = document.getElementById('welcome-page');
                if (welcomePage) {
                    welcomePage.classList.remove('hidden');
                }
            });

            // 缩放控制按钮
            document.getElementById('zoom-in')?.addEventListener('click', () => {
                this.setScale(this.state.scale + 0.1);
            });
            document.getElementById('zoom-out')?.addEventListener('click', () => {
                this.setScale(this.state.scale - 0.1);
            });
            document.getElementById('zoom-reset')?.addEventListener('click', () => {
                this.setScale(1);
            });

            // 窗口大小变化时防抖重渲染
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    // 收起所有展开的节点
                    this.state.expandedNodes.forEach(id => {
                        this.collapseNode(id);
                    });
                    this.state.expandedNodes.clear();
                    // 重新渲染
                    this.renderMindmap();
                }, 250);
            });
        },

        // 应用变换（缩放+拖动）
        applyTransform() {
            const content = document.getElementById('mindmap-content');
            if (content) {
                content.style.transform = `translate(${this.state.translateX}px, ${this.state.translateY}px) scale(${this.state.scale})`;
                content.style.transformOrigin = 'center center';
            }
            
            // 更新缩放显示
            const zoomLevel = document.getElementById('zoom-level');
            if (zoomLevel) {
                zoomLevel.textContent = `${Math.round(this.state.scale * 100)}%`;
            }
        },

        // 设置缩放比例
        setScale(scale) {
            // 限制范围
            scale = Math.max(this.state.minScale, Math.min(this.state.maxScale, scale));
            this.state.scale = scale;
            this.applyTransform();
        },

        // 显示思维导图
        show() {
            const mindmapPage = document.getElementById('mindmap-page');
            const welcomePage = document.getElementById('welcome-page');
            const contentDisplay = document.getElementById('content-display');
            const controls = document.getElementById('mindmap-controls');
            const content = document.getElementById('mindmap-content');

            if (mindmapPage) {
                mindmapPage.classList.remove('hidden');
            }
            if (welcomePage) {
                welcomePage.classList.add('hidden');
            }
            if (contentDisplay) {
                contentDisplay.classList.add('hidden');
            }

            // 显示缩放控制面板
            if (controls) {
                controls.style.display = 'flex';
            }

            // 重置拖动和缩放
            this.state.translateX = 0;
            this.state.translateY = 0;
            this.state.scale = 1;
            this.applyTransform();
            if (content) content.style.cursor = 'grab';

            // 收起所有展开的节点
            this.state.expandedNodes.forEach(id => {
                this.collapseNode(id);
            });
            this.state.expandedNodes.clear();

            // 重新渲染思维导图
            setTimeout(() => {
                this.renderMindmap();
            }, 150);
        },

        // 隐藏思维导图
        hide() {
            const mindmapPage = document.getElementById('mindmap-page');
            if (mindmapPage) {
                mindmapPage.classList.add('hidden');
            }

            // 隐藏缩放控制面板
            const controls = document.getElementById('mindmap-controls');
            if (controls) {
                controls.style.display = 'none';
            }
        },

        // 刷新思维导图（更新进度显示）
        refresh() {
            if (document.getElementById('mindmap-page') && !document.getElementById('mindmap-page').classList.contains('hidden')) {
                this.renderMindmap();
            }
        }
    };

    // 暴露到全局
    window.Mindmap = Mindmap;

})();
