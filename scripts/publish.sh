#!/bin/bash

# Prompt Versions 发布脚本
# 使用方法：./scripts/publish.sh YOUR_GITHUB_USERNAME

set -e

if [ -z "$1" ]; then
    echo "❌ 用法：./scripts/publish.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

USERNAME=$1
REPO_NAME="prompt-versions"
REPO_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"

echo "🚀 开始发布 Prompt Versions..."
echo "📦 GitHub 用户名：${USERNAME}"
echo "🔗 仓库地址：${REPO_URL}"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 prompt-versions 目录运行此脚本"
    exit 1
fi

# 更新 README 中的用户名
echo "📝 更新 README.md 中的用户名..."
sed -i '' "s/YOUR_USERNAME/${USERNAME}/g" README.md 2>/dev/null || sed -i "s/YOUR_USERNAME/${USERNAME}/g" README.md
sed -i '' "s/YOUR_USERNAME/${USERNAME}/g" package.json 2>/dev/null || sed -i "s/YOUR_USERNAME/${USERNAME}/g" package.json

# Git 初始化
echo "📦 初始化 Git 仓库..."
git init
git add -A
git commit -m "feat: initial commit - Prompt Versions v0.1.0"

# 创建 main 分支
git branch -M main

# 添加远程仓库
echo "🔗 关联远程仓库..."
git remote add origin ${REPO_URL} || echo "⚠️  remote 已存在"

# 推送
echo "🚀 推送到 GitHub..."
git push -u origin main

echo ""
echo "✅ 发布成功！"
echo ""
echo "下一步:"
echo "1. 访问 https://github.com/${USERNAME}/${REPO_NAME} 查看仓库"
echo "2. 发布到 npm: npm publish"
echo "3. 推广：参考 docs/PUBLISH.md"
echo ""
echo "🎉 祝好运！"
