import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), '../../../../src/cli.js');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    execSync(`node ${CLI_PATH} delete "${params.name}" --force`, {
      encoding: 'utf-8',
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}
