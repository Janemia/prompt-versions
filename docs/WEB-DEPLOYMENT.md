# Web UI 部署文档

## 当前状态

✅ **Web UI 已部署成功**

**访问地址：http://localhost:3000**

---

## 启动历史

### 问题排查

1. **Tailwind CSS 编译错误**
   - 错误：`Module parse failed: Unexpected character '@'`
   - 原因：PostCSS 配置与 Next.js 不兼容
   - 解决：使用纯 CSS 替代 Tailwind 指令

2. **缓存问题**
   - 错误：服务器使用旧的 CSS 文件
   - 解决：删除 `.next` 和 `node_modules/.cache`

3. **端口占用**
   - 问题：3000 端口被占用
   - 解决：清理旧进程

### 最终配置

```bash
# 清理缓存
rm -rf .next node_modules/.cache

# 启动服务器
npm run dev

# 访问
http://localhost:3000
```

---

## 功能说明

### 已实现页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | Prompt 列表、创建 |
| 版本历史 | `/prompts/[name]` | 查看版本时间线 |
| 版本对比 | `/prompts/[name]/compare` | Diff 可视化 |
| 测试中心 | `/prompts/[name]/test` | 添加/运行测试 |
| 统计概览 | `/stats` | 数据统计图表 |

### API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/prompts` | GET | 获取所有 Prompt |
| `/api/prompts` | POST | 创建 Prompt |
| `/api/prompts/:name/history` | GET | 获取版本历史 |
| `/api/prompts/:name` | DELETE | 删除 Prompt |
| `/api/prompts/:name/tests` | GET | 获取测试用例 |
| `/api/prompts/:name/tests` | POST | 添加测试用例 |
| `/api/prompts/:name/test` | POST | 运行测试 |

---

## 快速测试流程

### 1. 创建第一个 Prompt

1. 访问 http://localhost:3000
2. 点击 "新建 Prompt" 按钮
3. 输入：
   - 名称：`customer-support`
   - 内容：
     ```
     You are a customer support agent for {{company}}.
     
     Guidelines:
     1. Be friendly and professional
     2. Help the customer with their question
     
     Customer message: {{message}}
     ```
4. 点击 "创建"

### 2. 查看版本

1. 在列表中点击 "查看" 按钮
2. 看到 v1 版本和时间线

### 3. 使用 CLI 修改

```bash
cd /tmp/prompt-versions-demo
node /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions/src/cli.js save customer-support -m "添加了问候语"
```

### 4. 刷新页面

1. 刷新浏览器
2. 看到 v2 版本

### 5. 版本对比

1. 点击 "对比" 按钮
2. 选择 v1 和 v2
3. 点击 "开始对比"
4. 查看红绿标注的差异

---

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| Next.js | 14.2.35 | React 框架 |
| React | 18.3.0 | UI 库 |
| TypeScript | 5.x | 类型系统 |
| 样式 | 纯 CSS | 无 Tailwind 编译 |
| 图标 | Lucide React | 图标库 |
| 通知 | React Hot Toast | Toast 提示 |

---

## 生产部署

### 1. 构建

```bash
cd web
npm run build
```

### 2. 启动

```bash
npm start
```

### 3. 部署到 Vercel

```bash
cd web
vercel deploy
```

### 4. 部署到 Docker

```bash
docker build -t prompt-versions-web .
docker run -p 3000:3000 prompt-versions-web
```

---

## 故障排查

### 问题 1：CSS 编译错误

**错误**：`Module parse failed: Unexpected character '@'`

**解决**：
```bash
rm -rf .next node_modules/.cache
npm run dev
```

### 问题 2：端口占用

**错误**：`Port 3000 is in use`

**解决**：
```bash
pkill -f "next dev"
npm run dev
```

### 问题 3：API 调用失败

**错误**：`Failed to fetch`

**解决**：
- 确保 CLI 已初始化：`prompt init`
- 检查 `.prompts` 目录权限

---

## 性能优化建议

1. **启用缓存**
   - 使用 React Query 缓存 API 数据
   - 实现 SWR 进行数据预取

2. **代码分割**
   - 使用 Next.js 动态导入
   - 按需加载页面组件

3. **图片优化**
   - 使用 Next.js Image 组件
   - 实现懒加载

4. **样式优化**
   - 考虑迁移到 Tailwind CSS（正确配置）
   - 或使用 CSS Modules

---

## 下一步改进

- [ ] 添加真实的 Tailwind CSS 支持
- [ ] 实现用户认证
- [ ] 添加云端同步功能
- [ ] 实现实时协作编辑
- [ ] 添加更多图表类型
- [ ] 支持导出为 PDF

---

创建时间：2026-03-15 22:10
状态：✅ 运行中
地址：http://localhost:3000
