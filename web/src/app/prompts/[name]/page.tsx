'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GitBranch, Clock, MessageSquare, Tag, Copy, Trash2, GitCompare, Play } from 'lucide-react';
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
  btnDanger: {
    background: '#ef4444',
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
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  versionTimeline: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  versionItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  versionBadge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '0.875rem',
    height: 'fit-content',
  },
  versionContent: {
    flex: 1,
  },
  versionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  versionMessage: {
    fontWeight: 600,
    color: '#111827',
  },
  versionDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  versionPrompt: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap' as const,
    marginBottom: '0.75rem',
  },
  versionMeta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  versionActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  currentBadge: {
    background: '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#4b5563',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#4b5563',
  },
};

interface Version {
  id: number;
  version: string;
  message: string;
  created_at: string;
  model: string;
  prompt_text: string;
  temperature: number;
  max_tokens: number;
  variables: string;
  tags: string;
}

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const promptName = params.name as string;
  
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [promptName]);

  const loadVersions = async () => {
    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}/history`);
      const data = await res.json();
      setVersions(data);
    } catch (error) {
      toast.error('加载版本失败');
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async () => {
    if (!confirm(`确定要删除 "${promptName}" 吗？此操作不可恢复。`)) return;

    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(promptName)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('删除成功');
        router.push('/');
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Toaster position="bottom-right" />
        <div style={styles.loading}>加载中...</div>
      </div>
    );
  }

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
            <GitBranch size={32} color="#3b82f6" />
            <span>{promptName}</span>
          </div>
          
          <div style={styles.headerActions}>
            <button
              onClick={() => router.push(`/prompts/${promptName}/compare`)}
              style={{...styles.btn, ...styles.btnPrimary, background: '#e5e7eb', color: '#374151'}}
            >
              <GitCompare size={18} />
              对比
            </button>
            <button
              onClick={() => router.push(`/prompts/${promptName}/test`)}
              style={{...styles.btn, ...styles.btnPrimary}}
            >
              <Play size={18} />
              测试
            </button>
            <button
              onClick={deletePrompt}
              style={{...styles.btn, ...styles.btnDanger}}
            >
              <Trash2 size={18} />
              删除
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <GitBranch size={20} />
            版本历史
          </h2>

          {versions.length === 0 ? (
            <div style={styles.empty}>
              <p>还没有版本</p>
            </div>
          ) : (
            <div style={styles.versionTimeline}>
              {versions.map((version, index) => (
                <div key={version.id} style={styles.versionItem}>
                  <div style={styles.versionBadge}>{version.version}</div>
                  <div style={styles.versionContent}>
                    <div style={styles.versionHeader}>
                      <span style={styles.versionMessage}>
                        {version.message || '无说明'}
                      </span>
                      {index === 0 && (
                        <span style={styles.currentBadge}>当前版本</span>
                      )}
                    </div>
                    
                    <div style={styles.versionDate}>
                      <Clock size={14} />
                      {new Date(version.created_at).toLocaleString('zh-CN')}
                    </div>

                    <div style={styles.versionPrompt}>
                      {version.prompt_text}
                    </div>

                    <div style={styles.versionMeta}>
                      <span style={styles.metaItem}>
                        <MessageSquare size={14} />
                        模型：{version.model}
                      </span>
                      <span style={styles.metaItem}>
                        <Tag size={14} />
                        温度：{version.temperature}
                      </span>
                      <span style={styles.metaItem}>
                        <Copy size={14} />
                        Max Tokens: {version.max_tokens}
                      </span>
                    </div>

                    <div style={styles.versionActions}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(version.prompt_text);
                          toast.success('已复制到剪贴板');
                        }}
                        style={{...styles.actionBtn, background: '#f3f4f6', color: '#374151'}}
                      >
                        <Copy size={14} />
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
