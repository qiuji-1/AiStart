// AI编程知识体系 - 知识数据结构
// 根据 AI编程知识体系.md 的章节结构创建

const knowledgeData = [
    {
        id: 'chapter-1',
        title: 'AI发展史',
        icon: '📚',
        children: [
            { id: '1-1', title: '发展脉络', completed: false, content: '' },
            { id: '1-2', title: '关键里程碑', completed: false, content: '' },
            { id: '1-3', title: '核心人物', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-2',
        title: '大模型（LLM）',
        icon: '🤖',
        children: [
            { id: '2-1', title: '什么是大模型', completed: false, content: '' },
            { id: '2-2', title: 'LLM 3×3 矩阵', completed: false, content: '' },
            { id: '2-3', title: '主流大模型介绍', completed: false, content: '' },
            { id: '2-4', title: '如何选择大模型', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-3',
        title: 'AI模型底层原理',
        icon: '⚙️',
        children: [
            { id: '3-1', title: 'NLP基础', completed: false, content: '' },
            { id: '3-2', title: 'Transformer架构', completed: false, content: '' },
            { id: '3-3', title: '自注意力机制', completed: false, content: '' },
            { id: '3-4', title: '训练与推理', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-4',
        title: '提示词-Prompt与上下文',
        icon: '💬',
        children: [
            { id: '4-1', title: '什么是Prompt', completed: false, content: '' },
            { id: '4-2', title: 'Prompt原理', completed: false, content: '' },
            { id: '4-3', title: 'Prompt进阶技巧', completed: false, content: '' },
            { id: '4-4', title: '上下文', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-5',
        title: 'MCP-Model Context Protocol',
        icon: '🔌',
        children: [
            { id: '5-1', title: '什么是MCP', completed: false, content: '' },
            { id: '5-2', title: 'MCP原理', completed: false, content: '' },
            { id: '5-3', title: 'MCP发展历程', completed: false, content: '' },
            { id: '5-4', title: 'MCP优缺点', completed: false, content: '' },
            { id: '5-5', title: '如何开发/引用MCP', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-6',
        title: '技能-Skills',
        icon: '🎯',
        children: [
            { id: '6-1', title: '什么是Skill', completed: false, content: '' },
            { id: '6-2', title: 'Skill原理', completed: false, content: '' },
            { id: '6-3', title: 'Skill发展历程', completed: false, content: '' },
            { id: '6-4', title: 'Skill优缺点', completed: false, content: '' },
            { id: '6-5', title: 'Skill与MCP对比', completed: false, content: '' },
            { id: '6-6', title: '如何开发/引用Skill', completed: false, content: '' },
            { id: '6-7', title: '优秀Skill vs 普通Skill', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-7',
        title: 'Harness工程',
        icon: '🔧',
        children: [
            { id: '7-1', title: '什么是Harness', completed: false, content: '' },
            { id: '7-2', title: 'Harness原理', completed: false, content: '' },
            { id: '7-3', title: 'Harness发展历程', completed: false, content: '' },
            { id: '7-4', title: 'Harness优缺点', completed: false, content: '' },
            { id: '7-5', title: 'Harness应用场景', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-8',
        title: 'RAG检索增强生成',
        icon: '🔍',
        children: [
            { id: '8-1', title: '什么是RAG', completed: false, content: '' },
            { id: '8-2', title: 'RAG优缺点', completed: false, content: '' },
            { id: '8-3', title: 'RAG应用场景', completed: false, content: '' },
            { id: '8-4', title: '为什么RAG范畴越来越窄', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-9',
        title: '智能体-Agent',
        icon: '🤖',
        children: [
            { id: '9-1', title: '什么是Agent', completed: false, content: '' },
            { id: '9-2', title: 'Agent核心原理', completed: false, content: '' },
            { id: '9-3', title: '经典Agent案例', completed: false, content: '' },
            { id: '9-4', title: '如何设计Agent', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-10',
        title: '记忆-Memory',
        icon: '🧠',
        children: [
            { id: '10-1', title: '什么是Memory', completed: false, content: '' },
            { id: '10-2', title: '主流Memory技术', completed: false, content: '' },
            { id: '10-3', title: 'Memory实现原理', completed: false, content: '' },
            { id: '10-4', title: 'Memory应用实践', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-11',
        title: 'Karpathy架构',
        icon: '🏗️',
        children: [
            { id: '11-1', title: '什么是Karpathy架构', completed: false, content: '' },
            { id: '11-2', title: '核心原理', completed: false, content: '' },
            { id: '11-3', title: '经典案例分析', completed: false, content: '' },
            { id: '11-4', title: '实战：构建自己的Karpathy架构', completed: false, content: '' }
        ]
    },
    {
        id: 'chapter-12',
        title: '实战应用',
        icon: '🚀',
        children: [
            { id: '12-1', title: '项目一：[待定]', completed: false, content: '' },
            { id: '12-2', title: '项目二：[待定]', completed: false, content: '' }
        ]
    }
];

// 导出数据（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = knowledgeData;
}