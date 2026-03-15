# npm 发布指南

## 当前状态

✅ **准备完成**
- package.json 已更新到 v0.4.0
- .npmignore 已创建
- npm pack 测试通过
- 包大小：19.6 kB (压缩后)

❌ **需要授权**
- 需要登录到 npm

---

## 发布步骤

### 1. 登录 npm

**如果你已有 npm 账号：**

```bash
cd /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions
npm login
```

输入用户名、密码和邮箱。

**如果没有账号：**

访问 https://www.npmjs.com/signup 注册账号

然后：
```bash
npm adduser
```

### 2. 发布

```bash
npm publish
```

如果成功，会看到：
```
+ prompt-versions@0.4.0
```

### 3. 验证

访问：https://www.npmjs.com/package/prompt-versions

### 4. 全局安装测试

```bash
npm install -g prompt-versions
prompt --help
```

---

## 后续更新

### 更新版本号

编辑 `package.json`：
```json
{
  "version": "0.4.1"  // 小更新
  // 或
  "version": "0.5.0"  // 功能更新
  // 或
  "version": "1.0.0"  // 重大更新
}
```

### 发布新版本

```bash
npm publish
git tag v0.4.1
git push --tags
```

---

## 常见问题

### 1. 包名已被占用

修改 `package.json` 中的 name：
```json
{
  "name": "@janemia/prompt-versions"
}
```

然后发布：
```bash
npm publish --access public
```

### 2. 发布失败

**错误：E403 Forbidden**
- 确保已登录：`npm whoami`
- 确保是包的所有者或协作者

**错误：EPUBLISHCONFLICT**
- 版本号已存在，需要增加版本号

**错误：E404 Not Found**
- 检查网络连接
- 尝试切换 npm 源

### 3. 撤销发布

```bash
npm unpublish prompt-versions@0.4.0
```

注意：只能撤销 24 小时内发布的版本。

---

## 发布后推广

### 1. 更新 README

添加 npm 徽章：
```markdown
[![npm version](https://badge.fury.io/js/prompt-versions.svg)](https://badge.fury.io/js/prompt-versions)
```

### 2. 安装量统计

访问：https://www.npmjs.com/package/prompt-versions?activeTab=versions

### 3. 推广渠道

- Hacker News (Show HN)
- Reddit r/programming
- Twitter/X
- 微信群/朋友圈

---

## 成功指标

| 指标 | 目标（7 天） |
|------|-------------|
| 下载量 | 1,000+ |
| Star 数 | 2,000+ |
| npm 评分 | 5/5 |

---

## 手动发布命令

```bash
cd /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions

# 1. 登录
npm login

# 2. 发布
npm publish

# 3. 验证
npm view prompt-versions

# 4. 全局安装测试
npm install -g prompt-versions
prompt --version
```

---

创建时间：2026-03-15 21:51
状态：待登录 npm
