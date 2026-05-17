---
name: 知识导航网页开发（含Karpathy架构+打卡功能）
overview: 创建一个基于纯前端的知识导航网页，采用Karpathy架构理念（简洁至上、避免过度工程化），包含知识地图导航、搜索过滤、进度追踪、每日打卡计划和每日总结功能
design:
  architecture:
    framework: html
  styleKeywords:
    - 简洁
    - 清晰
    - 易用
    - 现代
    - 方便快捷
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#1890ff"
      - "#40a9ff"
    background:
      - "#f0f2f5"
      - "#ffffff"
    text:
      - "#333333"
      - "#666666"
      - "#999999"
    functional:
      - "#52c41a"
      - "#ff4d4f"
      - "#faad14"
todos:
  - id: create-structure
    content: 创建项目基础文件结构（HTML、CSS、JS目录）
    status: completed
  - id: implement-data-structure
    content: 实现知识数据结构和内容解析逻辑
    status: completed
    dependencies:
      - create-structure
  - id: implement-navigation
    content: 实现知识地图导航树生成和交互功能
    status: completed
    dependencies:
      - implement-data-structure
  - id: implement-search
    content: 实现搜索过滤功能和高亮显示
    status: completed
    dependencies:
      - implement-navigation
  - id: implement-progress
    content: 实现进度追踪和localStorage存储功能
    status: completed
    dependencies:
      - implement-search
  - id: implement-checkin
    content: 实现每日打卡计划和日历视图功能
    status: completed
    dependencies:
      - implement-progress
  - id: implement-summary
    content: 实现每日总结撰写和历史记录功能
    status: completed
    dependencies:
      - implement-checkin
  - id: test-optimize
    content: 测试所有功能并优化用户体验
    status: completed
    dependencies:
      - implement-summary
  - id: add-mindmap-homepage
    content: 添加思维导图主页（中心辐射式布局，导航栏新增主页按钮）
    status: completed
    dependencies:
      - test-optimize
---

