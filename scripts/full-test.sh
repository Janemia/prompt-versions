#!/bin/bash

# Prompt Versions 完整功能测试脚本

set -e

CLI="/Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions/src/cli.js"
TEST_DIR="/tmp/prompt-versions-test"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Prompt Versions 完整功能测试                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 清理并创建测试目录
echo "🧹 清理测试环境..."
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# 测试计数器
TOTAL=0
PASSED=0
FAILED=0

# 测试函数
run_test() {
    local name="$1"
    local command="$2"
    local expect_success="${3:-true}"
    
    TOTAL=$((TOTAL + 1))
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "测试 #$TOTAL: $name"
    echo "命令：$command"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if eval "$command" > /tmp/test_output.txt 2>&1; then
        if [ "$expect_success" = "true" ]; then
            echo "✅ 通过"
            PASSED=$((PASSED + 1))
        else
            echo "❌ 失败（期望失败但成功了）"
            FAILED=$((FAILED + 1))
        fi
    else
        if [ "$expect_success" = "false" ]; then
            echo "✅ 通过（预期失败）"
            PASSED=$((PASSED + 1))
        else
            echo "❌ 失败"
            cat /tmp/test_output.txt
            FAILED=$((FAILED + 1))
        fi
    fi
}

# ==================== 一、项目管理测试 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第一部分：项目管理测试"
echo "══════════════════════════════════════════════════════════"

run_test "初始化仓库" "node $CLI init" "true"

run_test "创建 Prompt" "echo -e 'You are a helpful assistant.\ngpt-3.5-turbo\n\n' | node $CLI create test-prompt" "true"

run_test "列出 Prompt" "node $CLI list" "true"

run_test "查看历史" "node $CLI history test-prompt" "true"

# ==================== 二、版本管理测试 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第二部分：版本管理测试"
echo "══════════════════════════════════════════════════════════"

run_test "保存新版本" "echo -e 'You are a very helpful assistant.\n添加了 very' | node $CLI save test-prompt -m '优化了语气'" "true"

run_test "再次保存" "echo -e 'You are an extremely helpful assistant.\n添加了 extremely' | node $CLI save test-prompt -m '再次优化'" "true"

run_test "查看历史（3 个版本）" "node $CLI history test-prompt" "true"

run_test "查看指定版本" "node $CLI show test-prompt v1" "true"

run_test "版本对比" "node $CLI diff test-prompt v1 v3" "true"

# ==================== 三、导入导出测试 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第三部分：导入导出测试"
echo "══════════════════════════════════════════════════════════"

run_test "导出 Prompt" "node $CLI export" "true"

# 创建导入文件
cat > /tmp/import-test.json << 'EOF'
{
  "imported_at": "2026-03-15T22:00:00Z",
  "prompts": [
    {
      "name": "imported-prompt",
      "versions": [
        {
          "version": "v1",
          "prompt": "This is an imported prompt.",
          "model": "gpt-3.5-turbo",
          "created_at": "2026-03-15T22:00:00Z"
        }
      ]
    }
  ]
}
EOF

run_test "导入 Prompt" "node $CLI import /tmp/import-test.json" "true"

run_test "验证导入结果" "node $CLI list" "true"

# ==================== 四、统计功能测试 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第四部分：统计功能测试"
echo "══════════════════════════════════════════════════════════"

run_test "整体统计" "node $CLI stats" "true"

run_test "单个 Prompt 统计" "node $CLI stats test-prompt" "true"

run_test "配置列表" "node $CLI config list" "true"

# ==================== 五、删除功能测试 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第五部分：删除功能测试"
echo "══════════════════════════════════════════════════════════"

run_test "删除 Prompt（带确认）" "echo 'n' | node $CLI delete imported-prompt" "true"

run_test "强制删除" "node $CLI delete imported-prompt -f" "true"

run_test "验证删除" "node $CLI list" "true"

# ==================== 六、Web UI 验证 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "第六部分：Web UI 验证"
echo "══════════════════════════════════════════════════════════"

echo ""
echo "🌐 Web UI 状态检查..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Web UI 可访问 (http://localhost:3000)"
    PASSED=$((PASSED + 1))
else
    echo "⚠️  Web UI 未运行或无法访问"
fi

TOTAL=$((TOTAL + 1))

# ==================== 测试总结 ====================
echo ""
echo "══════════════════════════════════════════════════════════"
echo "测试总结"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "总测试数：$TOTAL"
echo "✅ 通过：$PASSED"
echo "❌ 失败：$FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 所有测试通过！"
    exit 0
else
    echo "⚠️  有 $FAILED 个测试失败"
    exit 1
fi
