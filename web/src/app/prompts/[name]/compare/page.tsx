'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GitCompare, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Version {
  id: number;
  version: string;
  prompt_text: string;
  created_at: string;
  message: string;
}

export default function ComparePage() {
  const params = useParams();
  const router = useRouter();
  const promptName = params.name as string;
  
  const [versions, setVersions] = useState<Version[]>([]);
  const [version1, setVersion1] = useState('');
  const [version2, setVersion2] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<{
    added: number;
    removed: number;
    changes: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }>;
  } | null>(null);

  // 加载版本列表
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/history`);
        const data = await res.json();
        setVersions(data);
        if (data.length >= 2) {
          setVersion1(data[0].version);
          setVersion2(data[1].version);
        }
      } catch (error) {
        toast.error('加载版本失败');
      }
    };
    loadVersions();
  }, [promptName]);

  // 计算 diff
  const calculateDiff = () => {
    const v1 = versions.find(v => v.version === version1);
    const v2 = versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      toast.error('请选择两个版本');
      return;
    }

    setLoading(true);

    // 简单的文本对比
    const lines1 = v1.prompt_text.split('\n');
    const lines2 = v2.prompt_text.split('\n');

    const changes: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> = [];
    let added = 0;
    let removed = 0;

    // 使用简单的 LCS 算法
    const lcs = computeLCS(lines1, lines2);
    let i = 0, j = 0;

    while (i < lines1.length || j < lines2.length) {
      if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
        changes.push({ type: 'unchanged', text: lines1[i] });
        i++;
        j++;
      } else if (j < lines2.length && !lines1.slice(i, i + lcs.length).includes(lines2[j])) {
        changes.push({ type: 'added', text: lines2[j] });
        added++;
        j++;
      } else if (i < lines1.length) {
        changes.push({ type: 'removed', text: lines1[i] });
        removed++;
        i++;
      }
    }

    setDiffResult({ added, removed, changes });
    setLoading(false);
  };

  // 简单的 LCS 实现
  function computeLCS(a: string[], b: string[]): string[] {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // 回溯
    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              版本对比
            </h1>
            <span className="text-gray-500">{promptName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 版本选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <GitCompare className="h-5 w-5 mr-2" />
            选择版本
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                版本 A
              </label>
              <select
                value={version1}
                onChange={(e) => setVersion1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    {v.version} - {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                版本 B
              </label>
              <select
                value={version2}
                onChange={(e) => setVersion2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    {v.version} - {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={calculateDiff}
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '对比中...' : '开始对比'}
            </button>
          </div>
        </div>

        {/* 对比结果 */}
        {diffResult && (
          <div className="space-y-4 animate-fade-in">
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">新增 {diffResult.added} 行</span>
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">删除 {diffResult.removed} 行</span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2">
                  <GitCompare className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    总变化 {diffResult.added + diffResult.removed} 行
                  </span>
                </div>
              </div>
            </div>

            {/* Diff 内容 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b font-mono text-sm">
                差异详情
              </div>
              <div className="max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  {diffResult.changes.map((change, index) => (
                    <div
                      key={index}
                      className={`px-4 py-1 ${
                        change.type === 'added'
                          ? 'diff-added'
                          : change.type === 'removed'
                          ? 'diff-removed'
                          : ''
                      }`}
                    >
                      <span className="inline-block w-6 select-none">
                        {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' '}
                      </span>
                      {change.text || ' '}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
