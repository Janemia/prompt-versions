'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Plus, Trash2, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem 0',
  },
  headerContent: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  headerActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '0.75rem',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.5rem',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: '#3b82f6',
    color: 'white',
  },
  btnSuccess: {
    background: '#10b981',
    color: 'white',
  },
  main: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  section: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  },
  sectionCount: {
    color: '#4b5563',
    fontSize: '0.875rem',
  },
  testCaseItem: {
    padding: '1rem 0',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  testCaseContent: {
    flex: 1,
  },
  testCaseName: {
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.5rem',
  },
  testCaseInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    fontSize: '0.875rem',
  },
  infoLabel: {
    color: '#4b5563',
  },
  infoValue: {
    background: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#d1d5db',
    padding: '0.25rem',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
  },
  resultsStats: {
    display: 'flex',
    gap: '1.5rem',
  },
  statPassed: {
    color: '#10b981',
    fontWeight: 600,
  },
  statFailed: {
    color: '#ef4444',
    fontWeight: 600,
  },
  resultItem: {
    padding: '1rem 0',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    gap: '1rem',
  },
  resultIcon: {
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.5rem',
  },
  resultOutput: {
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap' as const,
  },
  resultError: {
    color: '#ef4444',
    fontSize: '0.875rem',
  },
  resultMeta: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: '#4b5563',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    color: '#4b5563',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '42rem',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  formLabel: {
    display: 'block',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  formInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  formTextarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    minHeight: '6rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #f3f4f6',
  },
};

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
    <div style={styles.page}>
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} />
            返回
          </button>
          <div style={styles.logo}>
            <Play size={32} color="#10b981" />
            <span>测试中心</span>
          </div>
          <span style={{color: '#4b5563'}}>{promptName}</span>
          
          <div style={styles.headerActions}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{...styles.btn, ...styles.btnPrimary, background: '#e5e7eb', color: '#374151'}}
            >
              <Plus size={20} />
              添加测试
            </button>
            <button
              onClick={runTests}
              disabled={running || testCases.length === 0}
              style={{
                ...styles.btn,
                ...styles.btnSuccess,
                opacity: (running || testCases.length === 0) ? 0.5 : 1,
                cursor: (running || testCases.length === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              <Play size={20} />
              {running ? '运行中...' : '运行测试'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Test Cases */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>测试用例</h2>
            <span style={styles.sectionCount}>共 {testCases.length} 个</span>
          </div>

          {testCases.length === 0 ? (
            <div style={styles.emptyState}>
              <p>还没有测试用例，添加第一个吧！</p>
            </div>
          ) : (
            <div>
              {testCases.map((testCase) => (
                <div key={testCase.id} style={styles.testCaseItem}>
                  <div style={styles.testCaseContent}>
                    <div style={styles.testCaseName}>{testCase.name}</div>
                    <div style={styles.testCaseInfo}>
                      <div>
                        <span style={styles.infoLabel}>输入：</span>
                        <code style={styles.infoValue}>{testCase.input}</code>
                      </div>
                      {testCase.expected_output && (
                        <div>
                          <span style={styles.infoLabel}>期望：</span>
                          <span style={{marginLeft: '0.5rem'}}>{testCase.expected_output}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTestCase(testCase.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div style={styles.section}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.sectionTitle}>测试结果</h2>
              <div style={styles.resultsStats}>
                <span style={styles.statPassed}>
                  通过：{results.filter(r => r.success).length}
                </span>
                <span style={styles.statFailed}>
                  失败：{results.filter(r => !r.success).length}
                </span>
              </div>
            </div>

            <div>
              {results.map((result, index) => (
                <div key={index} style={styles.resultItem}>
                  <div style={styles.resultIcon}>
                    {result.success ? (
                      <CheckCircle size={24} color="#10b981" />
                    ) : (
                      <XCircle size={24} color="#ef4444" />
                    )}
                  </div>
                  <div style={styles.resultContent}>
                    <div style={styles.resultName}>{result.test_name}</div>
                    {result.success ? (
                      <pre style={styles.resultOutput}>{result.output}</pre>
                    ) : (
                      <div style={styles.resultError}>错误：{result.error}</div>
                    )}
                    <div style={styles.resultMeta}>
                      <span style={styles.metaItem}>
                        <Clock size={14} />
                        {result.latency_ms}ms
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Test Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>添加测试用例</h2>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>测试名称</label>
              <input
                type="text"
                value={newTestCase.name}
                onChange={(e) => setNewTestCase({ ...newTestCase, name: e.target.value })}
                style={styles.formInput}
                placeholder="例如：退款请求测试"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>输入（JSON）</label>
              <textarea
                value={newTestCase.input}
                onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                style={styles.formTextarea}
                placeholder='{"company": "Acme Inc", "message": "我要退款"}'
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>期望输出（可选）</label>
              <input
                type="text"
                value={newTestCase.expected}
                onChange={(e) => setNewTestCase({ ...newTestCase, expected: e.target.value })}
                style={styles.formInput}
                placeholder="应该引导用户查看退款政策"
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{...styles.btn, ...styles.btnPrimary, background: '#e5e7eb', color: '#374151'}}
              >
                取消
              </button>
              <button
                onClick={addTestCase}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
