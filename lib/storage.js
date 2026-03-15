/**
 * Storage Layer - 管理 Prompt 存储和版本
 */

const fs = require('fs-extra');
const path = require('path');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

class PromptStorage {
  constructor(baseDir = null) {
    this.baseDir = baseDir || path.join(process.cwd(), '.prompts');
    this.promptsDir = path.join(this.baseDir, 'prompts');
    this.dbPath = path.join(this.baseDir, 'metadata.db');
    this.db = null;
  }

  /**
   * 初始化存储
   */
  init() {
    fs.ensureDirSync(this.promptsDir);
    this.db = new Database(this.dbPath);
    this._createTables();
    return this.baseDir;
  }

  /**
   * 创建数据库表
   */
  _createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_name TEXT NOT NULL,
        version TEXT NOT NULL,
        message TEXT,
        prompt_text TEXT NOT NULL,
        model TEXT,
        temperature REAL,
        max_tokens INTEGER,
        variables TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(prompt_name, version)
      );

      CREATE TABLE IF NOT EXISTS test_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_name TEXT NOT NULL,
        name TEXT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT,
        expected_tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS test_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_name TEXT NOT NULL,
        version TEXT,
        test_case_id INTEGER,
        input TEXT,
        output TEXT,
        latency_ms INTEGER,
        token_usage INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_versions_name ON versions(prompt_name);
      CREATE INDEX IF NOT EXISTS idx_test_cases_name ON test_cases(prompt_name);
    `);
  }

  /**
   * 保存 Prompt 版本
   */
  saveVersion(promptName, promptData, message = '') {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO versions 
      (prompt_name, version, message, prompt_text, model, temperature, max_tokens, variables, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    // 获取下一个版本号
    const lastVersion = this.db.prepare('SELECT version FROM versions WHERE prompt_name = ? ORDER BY created_at DESC LIMIT 1').get(promptName);
    const nextVersion = lastVersion ? `v${parseInt(lastVersion.version.slice(1)) + 1}` : 'v1';

    stmt.run(
      promptName,
      nextVersion,
      message,
      promptData.prompt,
      promptData.model || 'gpt-3.5-turbo',
      promptData.temperature || 0.7,
      promptData.max_tokens || 1000,
      JSON.stringify(promptData.variables || []),
      JSON.stringify(promptData.tags || [])
    );

    // 同时保存为 JSON 文件（便于人类阅读）
    const promptDir = path.join(this.promptsDir, promptName);
    const versionsDir = path.join(promptDir, 'versions');
    fs.ensureDirSync(versionsDir);

    const versionFile = path.join(versionsDir, `${nextVersion}.json`);
    fs.writeJsonSync(versionFile, {
      name: promptName,
      version: nextVersion,
      created_at: new Date().toISOString(),
      message,
      ...promptData
    }, { spaces: 2 });

    // 更新 current.json
    const currentFile = path.join(promptDir, 'current.json');
    fs.writeJsonSync(currentFile, {
      name: promptName,
      current_version: nextVersion,
      updated_at: new Date().toISOString(),
      ...promptData
    }, { spaces: 2 });

    return nextVersion;
  }

  /**
   * 获取 Prompt 历史
   */
  getHistory(promptName) {
    const stmt = this.db.prepare('SELECT * FROM versions WHERE prompt_name = ? ORDER BY created_at DESC');
    return stmt.all(promptName);
  }

  /**
   * 获取指定版本
   */
  getVersion(promptName, version) {
    const stmt = this.db.prepare('SELECT * FROM versions WHERE prompt_name = ? AND version = ?');
    return stmt.get(promptName, version);
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(promptName) {
    const history = this.getHistory(promptName);
    return history.length > 0 ? history[0] : null;
  }

  /**
   * 版本对比
   */
  diffVersions(promptName, version1, version2) {
    const v1 = this.getVersion(promptName, version1);
    const v2 = this.getVersion(promptName, version2);

    if (!v1 || !v2) {
      throw new Error('版本不存在');
    }

    return {
      version1: {
        version: v1.version,
        prompt: v1.prompt_text,
        created_at: v1.created_at
      },
      version2: {
        version: v2.version,
        prompt: v2.prompt_text,
        created_at: v2.created_at
      }
    };
  }

  /**
   * 添加测试用例
   */
  addTestCase(promptName, testCase) {
    const stmt = this.db.prepare(`
      INSERT INTO test_cases (prompt_name, name, input, expected_output, expected_tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    const id = stmt.run(
      promptName,
      testCase.name,
      JSON.stringify(testCase.input),
      testCase.expected_output || null,
      JSON.stringify(testCase.expected_tags || [])
    );

    return id.lastInsertRowid;
  }

  /**
   * 获取测试用例
   */
  getTestCases(promptName) {
    const stmt = this.db.prepare('SELECT * FROM test_cases WHERE prompt_name = ?');
    return stmt.all(promptName);
  }

  /**
   * 记录测试运行
   */
  recordTestRun(promptName, version, testCase) {
    const stmt = this.db.prepare(`
      INSERT INTO test_runs (prompt_name, version, test_case_id, input, output, latency_ms, token_usage)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      promptName,
      version,
      testCase.test_case_id,
      JSON.stringify(testCase.input),
      testCase.output,
      testCase.latency_ms,
      testCase.token_usage
    );
  }

  /**
   * 列出所有 Prompt
   */
  listPrompts() {
    const stmt = this.db.prepare(`
      SELECT prompt_name, MAX(created_at) as last_updated, COUNT(*) as version_count
      FROM versions
      GROUP BY prompt_name
      ORDER BY last_updated DESC
    `);
    return stmt.all();
  }

  /**
   * 关闭数据库
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = PromptStorage;
