/**
 * Diff Engine - 版本对比
 */

const DiffMatchPatch = require('diff-match-patch');

class DiffEngine {
  constructor() {
    this.dmp = new DiffMatchPatch();
  }

  /**
   * 对比两个 Prompt 文本
   * @param {string} text1 - 旧版本
   * @param {string} text2 - 新版本
   * @returns {Array} - 差异数组
   */
  compare(text1, text2) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);

    return diffs.map(diff => ({
      type: diff[0] === -1 ? 'deleted' : diff[0] === 1 ? 'added' : 'unchanged',
      text: diff[1]
    }));
  }

  /**
   * 格式化差异输出（彩色）
   * @param {Array} diffs - 差异数组
   * @returns {string} - 格式化后的字符串
   */
  formatColored(diffs) {
    const chalk = require('chalk').default;
    
    return diffs.map(diff => {
      if (diff.type === 'added') {
        return chalk.green(`+ ${diff.text}`);
      } else if (diff.type === 'deleted') {
        return chalk.red(`- ${diff.text}`);
      } else {
        return chalk.gray(`  ${diff.text}`);
      }
    }).join('');
  }

  /**
   * 生成差异统计
   * @param {Array} diffs - 差异数组
   * @returns {Object} - 统计信息
   */
  stats(diffs) {
    let added = 0;
    let deleted = 0;

    diffs.forEach(diff => {
      if (diff.type === 'added') {
        added += diff.text.length;
      } else if (diff.type === 'deleted') {
        deleted += diff.text.length;
      }
    });

    return {
      added,
      deleted,
      total: added + deleted
    };
  }
}

module.exports = DiffEngine;
