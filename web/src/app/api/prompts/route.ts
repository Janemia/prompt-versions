import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

const CLI_PATH = path.join(process.cwd(), '../../src/cli.js');
const BASE_DIR = path.join(process.cwd(), '../../.prompts');

// 获取所有 Prompt
export async function GET() {
  try {
    // 确保目录存在
    if (!fs.existsSync(BASE_DIR)) {
      return NextResponse.json([]);
    }

    const promptsDir = path.join(BASE_DIR, 'prompts');
    if (!fs.existsSync(promptsDir)) {
      return NextResponse.json([]);
    }

    const promptNames = fs.readdirSync(promptsDir);
    const prompts = promptNames.map(name => {
      const currentFile = path.join(promptsDir, name, 'current.json');
      const versionsDir = path.join(promptsDir, name, 'versions');
      
      let versionCount = 0;
      let lastUpdated = new Date().toISOString();

      if (fs.existsSync(currentFile)) {
        const current = fs.readJsonSync(currentFile);
        lastUpdated = current.updated_at || lastUpdated;
      }

      if (fs.existsSync(versionsDir)) {
        versionCount = fs.readdirSync(versionsDir).filter(f => f.endsWith('.json')).length;
      }

      return {
        name,
        version_count: versionCount,
        last_updated: lastUpdated
      };
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error loading prompts:', error);
    return NextResponse.json([]);
  }
}

// 创建 Prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, prompt: promptText, model = 'gpt-3.5-turbo', variables = [], tags = [] } = body;

    if (!name || !promptText) {
      return NextResponse.json(
        { error: '缺少必要字段：name 和 prompt' },
        { status: 400 }
      );
    }

    // 确保基础目录存在
    fs.ensureDirSync(BASE_DIR);
    const promptsDir = path.join(BASE_DIR, 'prompts');
    fs.ensureDirSync(promptsDir);

    // 创建 Prompt 目录
    const promptDir = path.join(promptsDir, name);
    const versionsDir = path.join(promptDir, 'versions');
    fs.ensureDirSync(versionsDir);

    // 创建 v1 版本
    const versionData = {
      name: name,
      version: 'v1',
      created_at: new Date().toISOString(),
      message: 'Initial version',
      prompt: promptText,
      model: model,
      temperature: 0.7,
      max_tokens: 1000,
      variables: variables,
      tags: tags
    };

    // 保存版本文件
    const versionFile = path.join(versionsDir, 'v1.json');
    fs.writeJsonSync(versionFile, versionData, { spaces: 2 });

    // 保存当前版本
    const currentFile = path.join(promptDir, 'current.json');
    const currentData = {
      name: name,
      current_version: 'v1',
      updated_at: new Date().toISOString(),
      prompt: promptText,
      model: model,
      temperature: 0.7,
      max_tokens: 1000,
      variables: variables,
      tags: tags
    };
    fs.writeJsonSync(currentFile, currentData, { spaces: 2 });

    // 更新 SQLite 数据库（如果有）
    try {
      const dbPath = path.join(BASE_DIR, 'metadata.db');
      // 简单处理：如果数据库不存在，跳过
      if (fs.existsSync(dbPath)) {
        const Database = require('better-sqlite3');
        const db = new Database(dbPath);
        
        db.prepare(`
          INSERT OR REPLACE INTO versions 
          (prompt_name, version, message, prompt_text, model, temperature, max_tokens, variables, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          name,
          'v1',
          'Initial version',
          promptText,
          model,
          0.7,
          1000,
          JSON.stringify(variables),
          JSON.stringify(tags),
          new Date().toISOString()
        );
        
        db.close();
      }
    } catch (dbError) {
      console.log('Database update skipped:', dbError);
    }

    return NextResponse.json({ 
      success: true,
      message: '创建成功',
      version: 'v1'
    });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      { error: '创建失败：' + (error as Error).message },
      { status: 500 }
    );
  }
}
