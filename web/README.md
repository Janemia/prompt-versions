# Prompt Versions Web UI

基于 Next.js 的可视化界面，用于管理 Prompt 版本。

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 生产构建

```bash
npm run build
npm start
```

## 功能

- ✅ 查看所有 Prompt
- ✅ 创建新 Prompt
- ✅ 查看版本历史
- ✅ 删除 Prompt
- 🔄 版本对比（开发中）
- 🔄 运行测试（开发中）
- 🔄 A/B 测试（开发中）

## 技术栈

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## 项目结构

```
web/
├── src/
│   ├── app/
│   │   ├── api/              # API 路由
│   │   │   └── prompts/      # Prompts API
│   │   ├── globals.css       # 全局样式
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 主页面
├── package.json
├── tailwind.config.js
└── next.config.js
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/prompts | 获取所有 Prompt |
| POST | /api/prompts | 创建 Prompt |
| GET | /api/prompts/:name/history | 获取版本历史 |
| DELETE | /api/prompts/:name | 删除 Prompt |

## 开发中

- 版本对比界面
- Prompt 测试界面
- A/B 测试界面
- 统计图表
- 深色模式切换
