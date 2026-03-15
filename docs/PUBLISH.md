# 发布指南

## 发布到 GitHub

### 1. 创建 GitHub 仓库

访问 https://github.com/new

- 仓库名：`prompt-versions`
- 描述：`Git for Prompts - Version control for AI prompts`
- 选择：**Public**
- **不要** 初始化 README（我们已有）
- 点击 **Create repository**

### 2. 推送代码

```bash
cd /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions

# 初始化 Git
git init

# 添加所有文件
git add -A

# 提交
git commit -m "feat: initial commit - Prompt Versions v0.1.0"

# 关联远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/prompt-versions.git

# 推送
git branch -M main
git push -u origin main
```

### 3. 更新 README 中的链接

编辑 `README.md`，将所有 `YOUR_USERNAME` 替换为你的 GitHub 用户名：

```bash
# macOS
sed -i '' 's/YOUR_USERNAME/你的用户名/g' README.md

# Linux
sed -i 's/YOUR_USERNAME/你的用户名/g' README.md
```

然后再次提交推送。

---

## 发布到 npm

### 1. 注册 npm 账号

访问 https://www.npmjs.com/signup

### 2. 登录

```bash
npm login
```

### 3. 更新 package.json

编辑 `package.json`，确保：
- `name` 字段唯一（如 `@你的用户名/prompt-versions`）
- `repository.url` 正确
- `author` 字段正确

### 4. 发布

```bash
npm publish
```

### 5. 全局安装测试

```bash
npm install -g prompt-versions
prompt --help
```

---

## 推广清单

### 发布当天

- [ ] GitHub 仓库创建
- [ ] npm 发布
- [ ] Twitter/X 发布（线程 + 演示视频）
- [ ] Hacker News (Show HN)
- [ ] Reddit r/programming
- [ ] Reddit r/LocalLLaMA
- [ ] 微信群/朋友圈分享

### 发布后第 2 天

- [ ] Indie Hackers 分享构建故事
- [ ] Dev.to 发布技术文章
- [ ] 邀请朋友 Star

### 发布后第 3-7 天

- [ ] 根据反馈迭代（修复 bug、改进文档）
- [ ] 添加更多示例 Prompts
- [ ] 回复所有 Issue

---

## Hacker News 发布文案模板

```
Show HN: Prompt Versions – Git for Prompts

I built this because I was tired of losing track of Prompt changes in my AI 
projects. No more "what did I change yesterday?" or "I liked the old version 
better but can't remember what it was."

Features:
- Version control for Prompts (save, diff, rollback)
- A/B testing with automatic evaluation
- Local-first (your data stays on your machine)
- Open source and free

Try it: npm install -g prompt-versions
GitHub: https://github.com/YOUR_USERNAME/prompt-versions

Would love feedback from the community!
```

---

## Twitter/X 发布文案模板

```
🚀 发布了一个小工具：Prompt Versions

像管理代码一样管理你的 Prompt！

功能：
✅ 版本控制（保存、回滚）
✅ 版本对比（diff）
✅ A/B 测试（自动评估哪个版本好）
✅ 本地优先（数据在自己手里）

安装：npm install -g prompt-versions

GitHub: [链接]

#AI #LLM #PromptEngineering #OpenSource
```

---

## 成功指标

| 指标 | 目标 | 时间 |
|------|------|------|
| GitHub Stars | 500+ | 第 1 天 |
| GitHub Stars | 2,000+ | 第 7 天 |
| npm Downloads | 1,000+ | 第 7 天 |
| Twitter 转发 | 100+ | 第 1 天 |

祝好运！🚀
