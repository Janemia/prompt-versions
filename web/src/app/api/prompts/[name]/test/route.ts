import { NextRequest, NextResponse } from 'next/server';

// 运行测试
export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const body = await request.json();
    const { testCases } = body;

    // 模拟测试结果（实际应该调用 CLI）
    const results = testCases.map((tc: any) => ({
      test_name: tc.name,
      success: true,
      output: `模拟输出：${tc.input}`,
      latency_ms: Math.floor(Math.random() * 500) + 500
    }));

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: '测试失败' },
      { status: 500 }
    );
  }
}
