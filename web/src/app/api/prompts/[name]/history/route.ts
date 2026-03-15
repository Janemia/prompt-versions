import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs-extra';

const BASE_DIR = path.join(process.cwd(), '../../.prompts');

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const promptName = params.name;
    const versionsDir = path.join(BASE_DIR, 'prompts', promptName, 'versions');

    if (!fs.existsSync(versionsDir)) {
      return NextResponse.json([]);
    }

    // 读取所有版本文件
    const versionFiles = fs.readdirSync(versionsDir)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        // 按版本号排序（v1, v2, v3...）
        const aNum = parseInt(a.replace('v', '').replace('.json', ''));
        const bNum = parseInt(b.replace('v', '').replace('.json', ''));
        return bNum - aNum; // 倒序，最新的在前
      });

    const versions = versionFiles.map((file, index) => {
      const filePath = path.join(versionsDir, file);
      const data = fs.readJsonSync(filePath);
      
      return {
        id: index + 1,
        version: data.version || file.replace('.json', ''),
        message: data.message || '',
        created_at: data.created_at,
        model: data.model || 'gpt-3.5-turbo',
        prompt_text: data.prompt,
        temperature: data.temperature || 0.7,
        max_tokens: data.max_tokens || 1000,
        variables: JSON.stringify(data.variables || []),
        tags: JSON.stringify(data.tags || [])
      };
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error loading versions:', error);
    return NextResponse.json([]);
  }
}
