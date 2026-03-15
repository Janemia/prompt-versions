'use client';

import { useState, useEffect } from 'react';
import { BarChart3, GitBranch, TestTube, Clock, TrendingUp } from 'lucide-react';

interface PromptStats {
  name: string;
  version_count: number;
  last_updated: string;
}

export default function StatsPage() {
  const [prompts, setPrompts] = useState<PromptStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      // 处理错误
    } finally {
      setLoading(false);
    }
  };

  const totalVersions = prompts.reduce((sum, p) => sum + p.version_count, 0);
  const avgVersions = prompts.length > 0 ? (totalVersions / prompts.length).toFixed(1) : '0';
  const mostActive = [...prompts].sort((a, b) => b.version_count - a.version_count).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              统计概览
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 总览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <GitBranch className="h-8 w-8 text-primary-600" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  总 Prompt 数
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {prompts.length}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <GitBranch className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  总版本数
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalVersions}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <TestTube className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  平均版本
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {avgVersions}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  最近更新
                </h3>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {prompts.length > 0
                    ? new Date(Math.max(...prompts.map(p => new Date(p.last_updated).getTime()))).toLocaleDateString('zh-CN')
                    : '-'}
                </p>
              </div>
            </div>

            {/* 最活跃的 Prompt */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  最活跃的 Prompt
                </h2>
              </div>
              <div className="divide-y">
                {mostActive.map((prompt, index) => (
                  <div key={prompt.name} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {prompt.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          更新于 {new Date(prompt.last_updated).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-5 w-5 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prompt.version_count}
                      </span>
                      <span className="text-sm text-gray-500">版本</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 版本分布图表 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                版本分布
              </h2>
              <div className="space-y-4">
                {prompts.map((prompt) => {
                  const percentage = totalVersions > 0 ? (prompt.version_count / totalVersions * 100) : 0;
                  return (
                    <div key={prompt.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {prompt.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {prompt.version_count} 版本
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
