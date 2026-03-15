'use client';

import { useState, useEffect } from 'react';
import { BarChart3, GitBranch, TestTube, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
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
  main: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s',
  },
  statIcon: {
    width: '2.5rem',
    height: '2.5rem',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#111827',
  },
  statLabel: {
    color: '#4b5563',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
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
  },
  promptItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid #f3f4f6',
  },
  promptName: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  rankBadge: {
    width: '2rem',
    height: '2rem',
    background: '#dbeafe',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: '#3b82f6',
  },
  promptInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  promptTitle: {
    fontWeight: 500,
    color: '#111827',
  },
  promptDate: {
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  versionCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#111827',
  },
  progressBar: {
    width: '100%',
    background: '#f3f4f6',
    borderRadius: '9999px',
    height: '0.5rem',
    overflow: 'hidden',
  },
  progressFill: {
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    height: '100%',
    transition: 'width 0.5s',
  },
  distributionItem: {
    marginBottom: '1rem',
  },
  distributionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
  },
  distributionName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  },
  distributionCount: {
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  spinner: {
    width: '2rem',
    height: '2rem',
    border: '3px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

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
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const totalVersions = prompts.reduce((sum, p) => sum + p.version_count, 0);
  const avgVersions = prompts.length > 0 ? (totalVersions / prompts.length).toFixed(1) : '0';
  const mostActive = [...prompts].sort((a, b) => b.version_count - a.version_count).slice(0, 5);

  if (loading) {
    return (
      <div style={styles.page}>
        <Toaster position="bottom-right" />
        <div style={styles.loading}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Toaster position="bottom-right" />
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => window.history.back()} style={styles.backBtn}>
            <ArrowLeft size={20} />
            返回
          </button>
          <div style={styles.logo}>
            <BarChart3 size={32} color="#3b82f6" />
            <span>统计概览</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <GitBranch size={40} color="#3b82f6" style={styles.statIcon} />
            <div style={styles.statValue}>{prompts.length}</div>
            <div style={styles.statLabel}>总 Prompt 数</div>
          </div>

          <div style={styles.statCard}>
            <GitBranch size={40} color="#10b981" style={styles.statIcon} />
            <div style={styles.statValue}>{totalVersions}</div>
            <div style={styles.statLabel}>总版本数</div>
          </div>

          <div style={styles.statCard}>
            <TestTube size={40} color="#8b5cf6" style={styles.statIcon} />
            <div style={styles.statValue}>{avgVersions}</div>
            <div style={styles.statLabel}>平均版本</div>
          </div>

          <div style={styles.statCard}>
            <Clock size={40} color="#f59e0b" style={styles.statIcon} />
            <div style={styles.statValue}>
              {prompts.length > 0
                ? new Date(Math.max(...prompts.map(p => new Date(p.last_updated).getTime()))).toLocaleDateString('zh-CN')
                : '-'}
            </div>
            <div style={styles.statLabel}>最近更新</div>
          </div>
        </div>

        {/* Most Active Prompts */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>最活跃的 Prompt</h2>
          <div>
            {mostActive.map((prompt, index) => (
              <div key={prompt.name} style={styles.promptItem}>
                <div style={styles.promptName}>
                  <div style={styles.rankBadge}>{index + 1}</div>
                  <div style={styles.promptInfo}>
                    <div style={styles.promptTitle}>{prompt.name}</div>
                    <div style={styles.promptDate}>
                      更新于 {new Date(prompt.last_updated).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
                <div style={styles.versionCount}>
                  <GitBranch size={20} color="#4b5563" />
                  {prompt.version_count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version Distribution */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>版本分布</h2>
          <div>
            {prompts.map((prompt) => {
              const percentage = totalVersions > 0 ? (prompt.version_count / totalVersions * 100) : 0;
              return (
                <div key={prompt.name} style={styles.distributionItem}>
                  <div style={styles.distributionHeader}>
                    <span style={styles.distributionName}>{prompt.name}</span>
                    <span style={styles.distributionCount}>{prompt.version_count} 版本</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{...styles.progressFill, width: `${percentage}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
