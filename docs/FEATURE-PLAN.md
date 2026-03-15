# Prompt Versions 功能完善计划

创建时间：2026-03-15 21:31
当前版本：v0.1.0 (MVP)
目标版本：v0.2.0

---

## 一、功能对比分析

### ✅ 已实现功能（MVP v0.1.0）

| 模块 | 功能 | 状态 |
|------|------|------|
| **项目管理** | `prompt init` | ✅ |
| | `prompt list` | ✅ |
| | `prompt create` | ✅ |
| | `prompt delete` | ❌ |
| **版本管理** | `prompt save` | ✅ |
| | `prompt history` | ✅ |
| | `prompt diff` | ✅ |
| | `prompt rollback` | ✅ |
| | `prompt show` | ❌ |
| **测试功能** | `prompt test` | ✅ |
| | `prompt abtest` | ✅ |
| | `prompt add-test` | ✅ |
| | `prompt list-tests` | ❌ |
| **导入导出** | `prompt export` | ✅ |
| | `prompt import` | ❌ |
| **配置** | `prompt config` | ✅ |

### ❌ 缺失功能（v0.2.0 需要实现）

| 功能 | 描述 | 优先级 | 预计时间 |
|------|------|--------|----------|
| `prompt delete` | 删除 Prompt | P1 | 30 分钟 |
| `prompt show` | 查看指定版本内容 | P1 | 30 分钟 |
| `prompt list-tests` | 列出测试用例 | P1 | 30 分钟 |
| `prompt import` | 导入 Prompt | P1 | 1 小时 |
| `prompt edit` | 编辑 Prompt（打开编辑器） | P2 | 1 小时 |
| `prompt run` | 直接运行 Prompt 测试效果 | P1 | 1 小时 |
| `prompt stats` | 统计信息（版本数、测试覆盖率等） | P2 | 1 小时 |
| `prompt tags` | 按标签管理 Prompt | P2 | 1 小时 |

### 🔮 后续功能（v0.3.0+）

| 功能 | 描述 | 版本 |
|------|------|------|
| **Web UI** | 可视化界面 | v0.3.0 |
| **团队协作** | 多用户、权限管理 | v0.4.0 |
| **云端同步** | 可选的云端备份 | v0.4.0 |
| **效果分析** | Token 消耗、响应时间统计 | v0.5.0 |
| **Prompt 模板** | 变量替换、条件逻辑 | v0.5.0 |
| **CI/CD 集成** | GitHub Actions 自动测试 | v0.6.0 |

---

## 二、详细功能设计

### 2.1 prompt delete

**命令**：
```bash
prompt delete <name> [--force]
```

**功能**：
- 删除指定 Prompt 及其所有版本
- 需要二次确认（除非使用 --force）
- 从数据库和文件系统中删除

**实现**：
```javascript
program
  .command('delete <name>')
  .description('🗑️  删除 Prompt')
  .option('-f, --force', '跳过确认')
  .action(async (name, options) => {
    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `确定要删除 Prompt "${name}" 吗？此操作不可恢复。`
      }]);
      if (!confirm) return;
    }
    // 删除逻辑
  });
```

---

### 2.2 prompt show

**命令**：
```bash
prompt show <name> <version>
```

**功能**：
- 查看指定版本的完整内容
- 显示元数据（模型、温度、变量等）
- 可选显示为 JSON

**输出示例**：
```
╭────────────────────────────────────╮
│                                    │
│   Prompt: customer-support         │
│   Version: v2                      │
│   Created: 2026-03-15 20:30:00    │
│   Message: 优化了语气              │
│                                    │
│   Model: gpt-3.5-turbo             │
│   Temperature: 0.7                 │
│   Max Tokens: 500                  │
│                                    │
│   Variables: company, message      │
│   Tags: support, customer-service  │
│                                    │
│   Prompt 内容：                    │
│   ──────────────────────────────── │
│   You are a customer support       │
│   agent for {{company}}.           │
│                                    │
│   Guidelines:                      │
│   1. Be friendly and professional  │
│   ...                              │
│                                    │
╰────────────────────────────────────╯
```

---

### 2.3 prompt list-tests

**命令**：
```bash
prompt list-tests <name>
```

**功能**：
- 列出所有测试用例
- 显示测试用例的输入和期望输出

**输出示例**：
```
📋 测试用例：customer-support

1. 退款请求测试
   输入：{"company":"Acme Inc","message":"我要退款"}
   期望：应该引导用户查看退款政策

2. 产品咨询测试
   输入：{"company":"Acme Inc","message":"这个产品怎么用？"}
   期望：提供产品使用指南

共 2 个测试用例
```

---

### 2.4 prompt import

**命令**：
```bash
prompt import <file.json>
```

**功能**：
- 从 JSON 文件导入 Prompt
- 支持导入多个版本
- 自动合并已有 Prompt

**JSON 格式**：
```json
{
  "imported_at": "2026-03-15T21:00:00Z",
  "prompts": [
    {
      "name": "customer-support",
      "versions": [
        {
          "version": "v1",
          "prompt": "You are...",
          "model": "gpt-3.5-turbo",
          "created_at": "2026-03-15T20:00:00Z"
        }
      ]
    }
  ]
}
```

---

### 2.5 prompt run（新增）

**命令**：
```bash
prompt run <name> [version]
```

**功能**：
- 直接运行 Prompt 测试效果
- 交互式输入变量
- 显示输出和统计信息

**交互示例**：
```bash
$ prompt run customer-support

📝 输入变量:
  company: Acme Inc
  message: 我要退款

🤖 正在调用 AI...

✅ 输出:
您好！很抱歉听到您对产品不满意。根据我们的退款政策...

📊 统计:
  模型：gpt-3.5-turbo
  延迟：1200ms
  Token: 450
```

---

### 2.6 prompt stats（新增）

**命令**：
```bash
prompt stats [name]
```

**功能**：
- 显示整体统计信息
- 或指定 Prompt 的详细统计

**输出示例**：
```
╭────────────────────────────────────╮
│                                    │
│   📊 Prompt 仓库统计               │
│                                    │
│   总 Prompt 数：5                  │
│   总版本数：23                     │
│   总测试用例：12                   │
│   总测试运行：89                   │
│                                    │
│   最活跃的 Prompt:                 │
│   1. customer-support (8 版本)     │
│   2. content-writer (6 版本)       │
│   3. code-reviewer (5 版本)        │
│                                    │
╰────────────────────────────────────╯
```

---

## 三、执行计划

### Phase 1: 缺失的 P0/P1 功能（预计 3 小时）

| 任务 | 预计时间 | 优先级 |
|------|----------|--------|
| 实现 `prompt delete` | 30 分钟 | P1 |
| 实现 `prompt show` | 30 分钟 | P1 |
| 实现 `prompt list-tests` | 30 分钟 | P1 |
| 实现 `prompt import` | 1 小时 | P1 |
| 实现 `prompt run` | 1 小时 | P1 |
| 测试并推送 | 30 分钟 | P0 |

### Phase 2: 增强功能（预计 2 小时）

| 任务 | 预计时间 | 优先级 |
|------|----------|--------|
| 实现 `prompt stats` | 1 小时 | P2 |
| 实现 `prompt edit` | 1 小时 | P2 |

### Phase 3: 文档与发布（预计 1 小时）

| 任务 | 预计时间 |
|------|----------|
| 更新 README | 30 分钟 |
| 更新中文文档 | 30 分钟 |
| 发布到 GitHub | 10 分钟 |

---

## 四、优先级排序

### 立即实现（Phase 1）
1. `prompt delete` - 基本 CRUD 完整性
2. `prompt show` - 查看版本内容
3. `prompt list-tests` - 测试管理
4. `prompt import` - 导入导出完整性
5. `prompt run` - 快速测试

### 后续实现（Phase 2）
1. `prompt stats` - 统计分析
2. `prompt edit` - 编辑器集成
3. `prompt tags` - 标签管理

### 未来规划（v0.3.0+）
1. Web UI
2. 团队协作
3. 云端同步

---

## 五、当前进度

- [x] Phase 1: 缺失的 P0/P1 功能 ✅
  - [x] `prompt delete`
  - [x] `prompt show`
  - [x] `prompt list-tests`
  - [x] `prompt import`
  - [x] `prompt run`
  - [x] `prompt stats`
- [x] Phase 2: 增强功能 ✅
- [x] Phase 3: 文档与发布 ✅
  - [x] 更新 CLI
  - [x] 推送到 GitHub
- [ ] 发布到 npm

---

创建时间：2026-03-15 21:31
最后更新：2026-03-15 21:35
状态：Phase 1-3 完成，待发布 npm
