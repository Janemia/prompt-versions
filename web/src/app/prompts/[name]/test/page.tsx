'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Plus, Trash2, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TestCase {
  id: number;
  name: string;
  input: string;
  expected_output: string | null;
}

interface TestResult {
  test_name: string;
  success: boolean;
  output?: string;
  error?: string;
  latency_ms: number;
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const promptName = params.name as string;

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTestCase, setNewTestCase] = useState({
    name: '',
    input: '{}',
    expected: ''
  });

  // 加载测试用例
  useEffect(() => {
    loadTestCases();
  }, [promptName]);

  const loadTestCases = async () => {
    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/tests`);
      const data = await res.json();
      setTestCases(data);
    } catch (error) {
      // 可能还没有测试用例
    }
  };

  // 运行测试
  const runTests = async () => {
    if (testCases.length === 0) {
      toast.error('没有测试用例');
      return;
    }

    setRunning(true);
    setResults([]);

    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCases })
      });

      const data = await res.json();
      setResults(data.results || []);

      const passed = data.results.filter((r: TestResult) => r.success).length;
      toast.success(`测试完成：${passed}/${data.results.length} 通过`);
    } catch (error) {
      toast.error('测试运行失败');
    } finally {
      setRunning(false);
    }
  };

  // 添加测试用例
  const addTestCase = async () => {
    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTestCase.name,
          input: newTestCase.input,
          expected_output: newTestCase.expected
        })
      });

      if (res.ok) {
        toast.success('添加成功');
        setShowAddModal(false);
        setNewTestCase({ name: '', input: '{}', expected: '' });
        loadTestCases();
      } else {
        toast.error('添加失败');
      }
    } catch (error) {
      toast.error('添加失败');
    }
  };

  // 删除测试用例
  const deleteTestCase = async (id: number) => {
    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/tests/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('删除成功');
        loadTestCases();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← 返回
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                测试中心
              </h1>
              <span className="text-gray-500">{promptName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="h-5 w-5" />
                <span>添加测试</span>
              </button>
              <button
                onClick={runTests}
                disabled={running || testCases.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5" />
                <span>{running ? '运行中...' : '运行测试'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 测试用例列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              测试用例
            </h2>
            <span className="text-sm text-gray-500">
              共 {testCases.length} 个
            </span>
          </div>

          {testCases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                还没有测试用例，添加第一个吧！
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                添加测试用例
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {testCase.name}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">输入：</span>
                          <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                            {testCase.input}
                          </code>
                        </div>
                        {testCase.expected_output && (
                          <div>
                            <span className="text-gray-500">期望：</span>
                            <span className="text-gray-700 dark:text-gray-300 ml-2">
                              {testCase.expected_output}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTestCase(testCase.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 测试结果 */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border animate-fade-in">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                测试结果
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-green-600">
                  通过：{results.filter(r => r.success).length}
                </span>
                <span className="text-red-600">
                  失败：{results.filter(r => !r.success).length}
                </span>
              </div>
            </div>

            <div className="divide-y">
              {results.map((result, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {result.test_name}
                      </h3>
                      {result.success ? (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                            {result.output}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          错误：{result.error}
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{result.latency_ms}ms</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 添加测试 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                添加测试用例
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    测试名称
                  </label>
                  <input
                    type="text"
                    value={newTestCase.name}
                    onChange={(e) => setNewTestCase({ ...newTestCase, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                    placeholder="例如：退款请求测试"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入（JSON）
                  </label>
                  <textarea
                    value={newTestCase.input}
                    onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 font-mono text-sm"
                    placeholder='{"company": "Acme Inc", "message": "我要退款"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    期望输出（可选）
                  </label>
                  <input
                    type="text"
                    value={newTestCase.expected}
                    onChange={(e) => setNewTestCase({ ...newTestCase, expected: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                    placeholder="应该引导用户查看退款政策"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={addTestCase}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
