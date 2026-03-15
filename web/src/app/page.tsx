'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Plus, Eye, Play, Trash2, BarChart3 } from 'lucide-react';
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#111827',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#4b5563',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
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
  main: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'white',
  },
  sectionCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.875rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '1rem',
    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    width: '4rem',
    height: '4rem',
    color: '#d1d5db',
    margin: '0 auto 1rem',
  },
  emptyText: {
    color: '#4b5563',
    fontSize: '1.125rem',
    marginBottom: '1.5rem',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardFooter: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  cardBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
  },
  cardBtnPrimary: {
    background: '#3b82f6',
    color: 'white',
  },
  cardBtnSecondary: {
    background: '#10b981',
    color: 'white',
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
    minHeight: '10rem',
    resize: 'vertical' as const,
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

interface Prompt {
  name: string;
  version_count: number;
  last_updated: string;
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data);
    } catch (error) {
      toast.error('加载失败');
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

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
        }),
      });

      if (res.ok) {
        toast.success('创建成功');
        setShowCreateModal(false);
        setNewPromptName('');
        setNewPromptContent('');
        loadPrompts();
      } else {
        toast.error('创建失败');
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  return (
    <div style={styles.page}>
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <GitBranch size={32} color="#3b82f6" />
            <span>Prompt Versions</span>
          </div>
          <div style={styles.navLinks}>
            <a href="/stats" style={styles.navLink}>
              <BarChart3 size={20} style={{display: 'inline', marginRight: 4}} />
              统计
            </a>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{...styles.btn, ...styles.btnPrimary}}
            >
              <Plus size={20} />
              新建 Prompt
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>所有 Prompt</h2>
          <span style={styles.sectionCount}>共 {prompts.length} 个</span>
        </div>

        {prompts.length === 0 ? (
          <div style={styles.emptyState}>
            <FolderOpen size={64} color="#d1d5db" style={styles.emptyIcon} />
            <p style={styles.emptyText}>还没有 Prompt，创建第一个吧！</p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{...styles.btn, ...styles.btnPrimary}}
            >
              创建 Prompt
            </button>
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {prompts.map((prompt) => (
              <div
                key={prompt.name}
                style={styles.card}
                onClick={() => window.location.href = `/prompts/${prompt.name}`}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{prompt.name}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除 "${prompt.name}"?`)) {
                        fetch(`/api/prompts/${encodeURIComponent(prompt.name)}`, {
                          method: 'DELETE',
                        }).then(() => loadPrompts());
                      }
                    }}
                    style={{...styles.cardBtn, background: 'none', padding: '0.25rem', color: '#d1d5db'}}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.infoItem}>
                    <GitBranch size={16} />
                    <span>{prompt.version_count} 个版本</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span>更新于 {new Date(prompt.last_updated).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/prompts/${prompt.name}`;
                    }}
                    style={{...styles.cardBtn, ...styles.cardBtnPrimary}}
                  >
                    <Eye size={16} />
                    查看
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/prompts/${prompt.name}/test`;
                    }}
                    style={{...styles.cardBtn, ...styles.cardBtnSecondary}}
                  >
                    <Play size={16} />
                    测试
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>创建新 Prompt</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>名称</label>
              <input
                type="text"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                style={styles.formInput}
                placeholder="例如：customer-support"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Prompt 内容</label>
              <textarea
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                style={styles.formTextarea}
                placeholder="You are a helpful assistant..."
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{...styles.btn, ...styles.btnPrimary, background: '#e5e7eb', color: '#374151'}}
              >
                取消
              </button>
              <button
                onClick={createPrompt}
                style={{...styles.btn, ...styles.btnPrimary}}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple folder icon component
function FolderOpen({size, color, style}: {size: number, color: string, style?: any}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
    </svg>
  );
}
