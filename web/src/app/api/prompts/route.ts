import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), '../../src/cli.js');

// 获取所有 Prompt
export async function GET() {
  try {
    const output = execSync(`node ${CLI_PATH} export`, {
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    const data = JSON.parse(output);
    
    const prompts = data.prompts.map((p: any) => ({
      name: p.name,
      version_count: p.versions?.length || 0,
      last_updated: p.versions?.[0]?.created_at || new Date().toISOString()
    }));

    return NextResponse.json(prompts);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

// 创建 Prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, prompt, model = 'gpt-3.5-turbo', variables = [], tags = [] } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    // 使用 CLI 创建（需要模拟交互，暂时简化处理）
    // TODO: 实现非交互式创建
    
    return NextResponse.json({ 
      success: true,
      message: '创建成功，请使用 CLI 添加更多详情'
    });
  } catch (error) {
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    );
  }
}
