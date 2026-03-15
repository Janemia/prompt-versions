import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), '../../../../src/cli.js');

// 获取测试用例
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    // 目前 CLI 没有 list-tests 的 JSON 输出，返回空数组
    // TODO: 在 CLI 中添加 --json 选项
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

// 添加测试用例
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    const { name, input, expected_output } = body;

    if (!name || !input) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      );
    }

    // TODO: 调用 CLI 添加测试用例
    // execSync(`node ${CLI_PATH} add-test "${params.name}" ...`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    );
  }
}
