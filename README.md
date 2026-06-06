# ☽ Tarot Oracle · 塔罗神谕

一个神秘的塔罗牌占卜网站，支持中英双语，集成 AI 智能解读功能。

![Vercel](https://img.shields.io/badge/deploy-Vercel-black) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 功能特性

- **78 张完整塔罗牌库** — 包含大阿卡纳（22张）和小阿卡纳（56张），中英双语牌面数据
- **8 种经典牌阵** — 单牌、三牌时间之流、凯尔特十字、四元素、圣三角、关系十字、马赛特、生命之轮
- **沉浸式抽牌体验** — 背面朝上选牌 → 翻牌揭示 → AI 解读，完整的仪式感流程
- **正位 / 逆位判定** — 每张牌自动随机正逆位，并在翻牌后显示标识
- **AI 智能神谕解读** — 接入通义千问（Qwen）大语言模型，根据问题与牌面生成个性化深度解读
- **中英双语界面** — 支持中文 / English 切换，AI 解读内容跟随语言
- **历史记录** — 本地保存占卜历史（最多 50 条）
- **牌库浏览** — Gallery 页面展示全部 78 张牌的详细释义
- **使用指南** — Guide 页面介绍塔罗基础知识和各牌阵含义
- **神秘视觉风格** — 深色背景 + 紫金色调 + 星空粒子动画

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5.9 |
| 构建工具 | Vite 7 |
| 样式方案 | Tailwind CSS 3.4 + 内联样式（动态主题） |
| 国际化 | 自定义 React Context i18n 系统 |
| AI 解读 | 通义千问 DashScope API（qwen-plus）前端直连 |
| 部署平台 | Vercel（纯静态站点） |

## 📋 环境要求

- **Node.js** >= 18.x（推荐 20+）
- **npm** >= 9.x（或 pnpm / yarn）

> 本项目为纯前端静态站点，**无需后端服务器**或数据库。

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repository-url>
cd tarot-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动后访问 `http://localhost:5173` 即可预览网站。支持热更新（HMR），代码修改即时生效。

### 4. 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可直接部署到任何静态托管服务。

### 5. 预览生产构建

```bash
npm run preview
```

在本地预览构建后的效果（模拟生产环境）。

## 📁 项目结构

```
tarot-app/
├── src/
│   ├── App.tsx                    # 主应用组件（核心逻辑：抽牌→翻牌→解读流程）
│   ├── App.css                    # 全局样式
│   ├── main.tsx                   # 应用入口
│   ├── index.css                  # Tailwind 基础样式 + 全局变量
│   │
│   ├── components/
│   │   ├── TarotCard.tsx          # 单张塔罗牌组件（3D翻转动画、正逆位徽章）
│   │   ├── CardFan.tsx            # 选牌界面（网格布局、背面朝上）
│   │   ├── CardGallery.tsx        # 牌库浏览页
│   │   ├── Guide.tsx              # 使用指南页
│   │   ├── LanguageSelect.tsx     # 语言选择入口页
│   │   └── ui/                    # UI 组件库
│   │
│   ├── data/
│   │   └── tarot.ts               # 78 张牌的数据定义 + 8 种牌阵配置
│   │
│   └── i18n/
│       ├── context.tsx            # 语言上下文 Provider
│       └── locales.ts             # 中英文翻译文本
│
├── public/                        # 静态资源目录
├── dist/                          # 构建产物（运行 npm run build 后生成）
├── package.json                   # 项目配置与依赖声明
├── tsconfig.json                  # TypeScript 配置
├── tsconfig.app.json              # 应用层 TypeScript 配置
├── tsconfig.node.json             # Node 层 TypeScript 配置
├── vite.config.ts                 # Vite 构建配置
├── tailwind.config.js             # Tailwind CSS 配置
├── postcss.config.js              # PostCSS 配置
├── eslint.config.js               # ESLint 代码规范配置
├── .gitignore                     # Git 忽略规则
└── README.md                      # 项目说明文档（本文件）
```

## 🎴 核心功能说明

### 占卜流程

1. **选择语言** — 首次进入时选择中文或 English
2. **输入问题** — 在文本框中输入想要询问的问题（必填）
3. **选择牌阵** — 从 8 种牌阵中选择适合的布局
4. **抽牌** — 从 78 张背面朝上的卡牌中抽取指定数量
5. **翻牌** — 点击逐张翻开或一键全部揭示，显示正位/逆位状态
6. **请求神谕** — 点击"解牌"按钮，调用 AI 生成个性化解读
7. **查看结果** — 阅读每张牌的详细位置含义及整体综合分析

### AI 解读说明

- AI 服务采用**前端直连模式**：浏览器直接调用通义千问 DashScope OpenAI 兼容接口
- 无需后端服务器，不受平台超时限制
- 解读内容包含：每张牌在其位置的详细含义 → 整体综合分析 → 温和建议
- Prompt 根据所选语言自动切换（中文/English）

### 牌阵一览

| 中文名 | 英文名 | 卡牌数 | 用途 |
|--------|--------|--------|------|
| 单牌 | Single Card | 1 | 快速指引 |
| 三牌时间之流 | Three Card Spread | 3 | 过去·现在·未来 |
| 凯尔特十字 | Celtic Cross | 10 | 全面深入分析 |
| 四元素 | Four Elements | 4 | 水·火·土·风能量分析 |
| 圣三角 | Pyramidal Spread | 6 | 决策分析 |
| 关系十字 | Relationship Cross | 5 | 双人关系解读 |
| 马赛特 | horseshoe Spread | 7 | 多维度现状评估 |
| 生命之轮 | Wheel of Life | 10 | 人生阶段全景 |

## 🌐 部署方式

### Vercel 部署（推荐）

本项目已适配 Vercel 平台：

1. 将代码推送到 GitHub / GitLab 仓库
2. 在 [vercel.com](https://vercel.com) 导入项目
3. Vercel 会自动检测 Vite 框架并完成构建部署
4. 无需额外环境变量配置（纯静态站点）

### 其他静态托管

构建后的 `dist/` 目录可部署到任意支持静态文件的平台：
- GitHub Pages
- Netlify
- Cloudflare Pages
- 任意 Web 服务器（Nginx / Apache 等）

## 📦 主要依赖项

### 运行时依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| react / react-dom | ^19.2.0 | UI 框架 |
| lucide-react | ^0.562.0 | 图标库 |
| clsx / tailwind-merge | ^2.1.1 / ^3.4.0 | 样式工具类 |
| class-variance-authority | ^0.7.1 | 变体样式管理 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vite | ^7.2.4 | 构建工具 |
| typescript | ~5.9.3 | 类型系统 |
| @vitejs/plugin-react | ^5.1.1 | React Fast Refresh |
| tailwindcss | ^3.4.19 | CSS 工具框架 |
| postcss / autoprefixer | ^8.5.6 / ^10.4.23 | CSS 处理 |
| eslint 系列 | ^9.39.1 | 代码规范检查 |

## 📄 License

MIT License

---

<p align="center">
  <b>☽ Tarot Oracle · 塔罗神谕 ☾</b><br/>
  Ancient Wisdom Revealed
</p>
