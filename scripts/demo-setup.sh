#!/bin/bash

# Prompt Versions 演示数据设置脚本

echo "🎨 设置演示数据..."

cd /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions

# 创建测试目录
mkdir -p /tmp/prompt-versions-demo
cd /tmp/prompt-versions-demo

# 初始化仓库
echo "📦 初始化仓库..."
node /Users/zhanliming/.jvs/.openclaw/workspace/prompt-versions/src/cli.js init

# 等待用户手动在 Web UI 中查看
echo ""
echo "✅ 演示数据准备完成！"
echo ""
echo "🌐 Web UI 地址：http://localhost:3000"
echo ""
echo "📝 接下来你可以："
echo "  1. 访问 http://localhost:3000 查看 Web UI"
echo "  2. 在页面上创建新的 Prompt"
echo "  3. 查看版本历史、对比版本、运行测试"
echo ""
echo "💡 提示：CLI 工作目录在 /tmp/prompt-versions-demo"
