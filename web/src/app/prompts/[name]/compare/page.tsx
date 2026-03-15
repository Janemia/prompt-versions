'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, GitCompare, Check, X } from 'lucide-react';
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
  versionSelect: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  compareBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statAdded: {
    background: '#d1fae5',
    color: '#065f46',
  },
  statRemoved: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  statTotal: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  diffContainer: {
    background: '#f9fafb',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    maxHeight: '24rem',
    overflowY: 'auto',
  },
  diffLine: {
    padding: '0.25rem 1rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
  diffAdded: {
    background: '#d1fae5',
    color: '#065f46',
  },
  diffRemoved: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  diffUnchanged: {
    color: '#6b7280',
  },
  diffPrefix: {
    display: 'inline-block',
    width: '1.5rem',
    fontWeight: 700,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#4b5563',
  },
};

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

  useEffect(() => {
    loadVersions();
  }, [promptName]);

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

  const calculateDiff = () => {
    const v1 = versions.find(v => v.version === version1);
    const v2 = versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      toast.error('请选择两个版本');
      return;
    }

    setLoading(true);

    const lines1 = v1.prompt_text.split('\n');
    const lines2 = v2.prompt_text.split('\n');
    const changes: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> = [];
    let added = 0;
    let removed = 0;

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
            <GitCompare size={32} color="#3b82f6" />
            <span>版本对比</span>
          </div>
          <span style={{color: '#4b5563'}}>{promptName}</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Version Selector */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <GitCompare size={20} />
            选择版本
          </h2>
          
          <div style={styles.versionSelect}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>版本 A</label>
              <select
                value={version1}
                onChange={(e) => setVersion1(e.target.value)}
                style={styles.select}
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    {v.version} - {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>版本 B</label>
              <select
                value={version2}
                onChange={(e) => setVersion2(e.target.value)}
                style={styles.select}
              >
                {versions.map(v => (
                  <option key={v.version} value={v.version}>
                    {v.version} - {new Date(v.created_at).toLocaleDateString('zh-CN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={calculateDiff} style={styles.compareBtn}>
            开始对比
          </button>
        </div>

        {/* Diff Result */}
        {diffResult && (
          <>
            {/* Stats */}
            <div style={styles.statsGrid}>
              <div style={{...styles.statCard, ...styles.statAdded}}>
                <Check size={24} />
                <span style={{fontWeight: 600}}>新增 {diffResult.added} 行</span>
              </div>
              <div style={{...styles.statCard, ...styles.statRemoved}}>
                <X size={24} />
                <span style={{fontWeight: 600}}>删除 {diffResult.removed} 行</span>
              </div>
              <div style={{...styles.statCard, ...styles.statTotal}}>
                <GitCompare size={24} />
                <span style={{fontWeight: 600}}>总变化 {diffResult.added + diffResult.removed} 行</span>
              </div>
            </div>

            {/* Diff Content */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>差异详情</h2>
              <div style={styles.diffContainer}>
                {diffResult.changes.map((change, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.diffLine,
                      ...(change.type === 'added' ? styles.diffAdded : 
                          change.type === 'removed' ? styles.diffRemoved : 
                          styles.diffUnchanged),
                    }}
                  >
                    <span style={styles.diffPrefix}>
                      {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : ' '}
                    </span>
                    {change.text || ' '}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {loading && (
          <div style={styles.loading}>
            对比中...
          </div>
        )}
      </main>
    </div>
  );
}
