import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

const CLI_PATH = path.join(process.cwd(), '../../../../src/cli.js');

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const output = execSync(`node ${CLI_PATH} export`, {
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    const data = JSON.parse(output);
    const prompt = data.prompts.find((p: any) => p.name === params.name);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt.versions || []);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
