'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, GitBranch, TestTube, Settings, Trash2, Eye, GitCompare, Play } from 'lucide-react';
import toast from 'react-hot-toast';

interface Prompt {
  name: string;
  version_count: number;
  last_updated: string;
}

interface Version {
  id: number;
  version: string;
  message: string;
  created_at: string;
  model: string;
  prompt_text: string;
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  // 加载 Prompt 列表
  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      toast.error('加载失败');
    }
  };

  // 加载版本历史
  const loadVersions = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(name)}/history`);
      const data = await res.json();
      setVersions(data);
      setSelectedPrompt(name);
      setViewMode('detail');
    } catch (error) {
      toast.error('加载版本失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建 Prompt
  const createPrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPromptName,
          prompt: newPromptContent,
          model: 'gpt-3.5-turbo',
          variables: [],
          tags: []
        })
      });

      if (res.ok) {
        toast.success('创建成功');
        setShowCreateModal(false);
        setNewPromptName('');
        setNewPromptContent('');
        loadPrompts();
      } else {
        const error = await res.json();
        toast.error(error.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  // 删除 Prompt
  const deletePrompt = async (name: string) => {
    if (!confirm(`确定要删除 "${name}" 吗？此操作不可恢复。`)) return;

    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('删除成功');
        if (selectedPrompt === name) {
          setViewMode('list');
          setSelectedPrompt(null);
        }
        loadPrompts();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitBranch className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Prompt Versions
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>新建 Prompt</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'list' ? (
          /* Prompt 列表 */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                所有 Prompt
              </h2>
              <span className="text-sm text-gray-500">
                共 {prompts.length} 个
              </span>
            </div>

            {prompts.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  还没有 Prompt，创建第一个吧！
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  创建 Prompt
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.name}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => loadVersions(prompt.name)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {prompt.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePrompt(prompt.name);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4" />
                        <span>{prompt.version_count} 个版本</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>
                          更新于 {new Date(prompt.last_updated).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          loadVersions(prompt.name);
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>查看</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: 跳转到测试页面
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                      >
                        <Play className="h-4 w-4" />
                        <span>测试</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 版本详情 */
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('list')}
                className="text-primary-600 hover:text-primary-700"
              >
                ← 返回列表
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedPrompt}
              </h2>
              {loading && <span className="text-gray-500">加载中...</span>}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <div className="divide-y">
                {versions.map((version, index) => (
                  <div key={version.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {version.version}
                        </span>
                        {index === 0 && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            当前版本
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>

                    {version.message && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {version.message}
                      </p>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                        {version.prompt_text}
                      </pre>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>模型：{version.model}</span>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 text-sm">
                        <GitCompare className="h-4 w-4" />
                        <span>对比</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm">
                        <Play className="h-4 w-4" />
                        <span>测试</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 text-sm">
                        <TestTube className="h-4 w-4" />
                        <span>A/B 测试</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 创建 Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                创建新 Prompt
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    名称
                  </label>
                  <input
                    type="text"
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                    placeholder="例如：customer-support"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prompt 内容
                  </label>
                  <textarea
                    value={newPromptContent}
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 font-mono text-sm"
                    placeholder="You are a helpful assistant..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={createPrompt}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
