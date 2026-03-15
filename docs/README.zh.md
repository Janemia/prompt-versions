# Prompt Versions 🚀

> **Git for Prompts** — 像管理代码一样管理你的 Prompt

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/prompt-versions.svg)](https://badge.fury.io/js/prompt-versions)

[English](../README.md) | **简体中文**

---

## 🎯 为什么需要 Prompt Versions？

Prompt 是 AI 应用的核心代码，但你还在用以下方式管理吗？

- ❌ 复制粘贴到记事本
- ❌ 改了不知道改了什么
- ❌ 想回滚找不到旧版本
- ❌ 无法对比不同版本的效果

**Prompt Versions** 提供：
- ✅ **版本控制**：每次修改都有记录，可随时回滚
- ✅ **版本对比**：清晰展示差异
- ✅ **A/B 测试**：用数据判断哪个版本更好
- ✅ **本地优先**：数据在自己手里，安全

---

## ⚡ 快速开始

### 安装

```bash
npm install -g prompt-versions
```

### 初始化

```bash
mkdir my-prompts && cd my-prompts
prompt init
```

### 创建第一个 Prompt

```bash
prompt create customer-support
```

按提示输入：
- Prompt 内容
- 使用的模型（如 gpt-3.5-turbo）
- 变量名（如 company,message）
- 标签（如 support,customer-service）

### 保存版本

修改 Prompt 后：

```bash
prompt save customer-support -m "添加了退款处理逻辑"
```

### 查看历史

```bash
prompt history customer-support
```

输出：
```
● v3 - 添加了退款处理逻辑
  2026-03-15 21:00:00

○ v2 - 优化了语气
  2026-03-15 20:30:00

○ v1 - Initial version
  2026-03-15 20:00:00
```

### 对比版本

```bash
prompt diff customer-support v1 v3
```

### 回滚

```bash
prompt rollback customer-support v2
```

---

## 🧪 测试与 A/B 测试

### 添加测试用例

```bash
prompt add-test customer-support
```

输入：
- 测试名称：退款请求测试
- 输入：`{"company":"Acme Inc","message":"我要退款"}`
- 期望输出：应该引导用户查看退款政策

### 运行测试

```bash
prompt test customer-support
```

### A/B 测试

对比 v1 和 v3 的效果：

```bash
prompt abtest customer-support v1 v3
```

输出：
```
═══════════════════════════════════════
获胜者：版本 B
═══════════════════════════════════════

╭────────────────────────────────────╮
│                                    │
│   版本 A                           │
│   胜率：30.0%                      │
│   延迟：1200ms                     │
│   Token: 450                       │
│                                    │
│   版本 B                           │
│   胜率：70.0%                      │
│   延迟：1100ms                     │
│   Token: 420                       │
│                                    │
╰────────────────────────────────────╯
```

---

## 📋 所有命令

| 命令 | 描述 |
|------|------|
| `prompt init` | 初始化 Prompt 仓库 |
| `prompt create <name>` | 创建新 Prompt |
| `prompt save <name> -m "msg"` | 保存版本 |
| `prompt history <name>` | 查看历史 |
| `prompt diff <name> <v1> <v2>` | 对比版本 |
| `prompt rollback <name> <version>` | 回滚 |
| `prompt list` | 列出所有 Prompt |
| `prompt add-test <name>` | 添加测试用例 |
| `prompt test <name>` | 运行测试 |
| `prompt abtest <name> <v1> <v2>` | A/B 测试 |
| `prompt export` | 导出所有 Prompt |
| `prompt config list|set` | 配置管理 |

---

## 📁 项目结构

```
my-prompts/
├── .prompts/                 # Prompt 仓库（自动生成）
│   ├── prompts/
│   │   └── customer-support/
│   │       ├── current.json  # 当前版本
│   │       ├── versions/
│   │       │   ├── v1.json
│   │       │   ├── v2.json
│   │       │   └── v3.json
│   │       └── tests.json    # 测试用例
│   └── metadata.db           # SQLite 数据库
│
├── prompt.config.json        # 项目配置
└── examples/                 # 示例 Prompts（可选）
```

---

## 🔌 API Key 配置

使用测试和 A/B 测试功能需要配置 API Key：

```bash
# 方式 1：环境变量（推荐）
export OPENAI_API_KEY=sk-xxx

# 方式 2：命令行参数
prompt test customer-support --api-key sk-xxx

# 方式 3：使用本地模型（Ollama）
prompt config set model ollama:llama2
```

---

## 💡 使用场景

### 1. 团队协作

```bash
# Alice 修改了 Prompt
prompt save customer-support -m "优化了开场白"

# Bob 查看变更
prompt diff customer-support v2 v3

# 效果不好，回滚
prompt rollback customer-support v2
```

### 2. 效果优化

```bash
# 测试不同版本的效果
prompt abtest customer-support v1 v5

# 根据数据决定使用哪个版本
```

### 3. 多环境管理

```bash
# 导出生产环境 Prompts
prompt export > production-prompts.json

# 导入到测试环境
prompt import production-prompts.json
```

---

## 🛠️ 开发

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/prompt-versions.git

# 安装依赖
npm install

# 本地测试
npm start

# 运行测试
npm test
```

---

## 🤝 贡献

欢迎贡献！详见 [贡献指南](CONTRIBUTING.md)

---

## 📄 许可证

MIT License

---

**Star ⭐ 这个项目，如果它对你有帮助！**
