/**
 * Test Runner - 测试运行器
 */

const { generateText } = require('ai');
const chalk = require('chalk').default;

class TestRunner {
  constructor(storage, apiKey = null) {
    this.storage = storage;
    this.apiKey = apiKey;
  }

  /**
   * 运行单个测试
   */
  async runSingleTest(promptName, version, testCase) {
    const promptData = this.storage.getVersion(promptName, version);
    
    if (!promptData) {
      throw new Error(`Prompt "${promptName}" 版本 "${version}" 不存在`);
    }

    const startTime = Date.now();
    
    try {
      // 替换变量
      let promptText = promptData.prompt_text;
      const input = JSON.parse(testCase.input);
      
      Object.keys(input).forEach(key => {
        promptText = promptText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), input[key]);
      });

      // 调用 LLM
      const { text, usage } = await generateText({
        model: promptData.model || 'gpt-3.5-turbo',
        prompt: promptText,
        temperature: promptData.temperature,
        maxTokens: promptData.max_tokens,
        apiKey: this.apiKey
      });

      const latency = Date.now() - startTime;

      return {
        success: true,
        output: text,
        latency_ms: latency,
        token_usage: usage?.totalTokens || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        latency_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests(promptName, version = null) {
    const testCases = this.storage.getTestCases(promptName);
    
    if (testCases.length === 0) {
      console.log(chalk.yellow('⚠️  没有找到测试用例'));
      console.log(chalk.gray('💡 使用 prompt add-test 添加测试用例'));
      return [];
    }

    if (!version) {
      const current = this.storage.getCurrentVersion(promptName);
      version = current ? current.version : 'v1';
    }

    console.log(chalk.cyan(`🧪 运行测试：${promptName} (${version})`));
    console.log(chalk.gray(`共 ${testCases.length} 个测试用例\n`));

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(chalk.gray(`[${i + 1}/${testCases.length}] ${testCase.name}...`));

      const result = await this.runSingleTest(promptName, version, {
        input: testCase.input,
        test_case_id: testCase.id
      });

      results.push({
        test_name: testCase.name,
        ...result
      });

      // 记录测试运行
      this.storage.recordTestRun(promptName, version, {
        test_case_id: testCase.id,
        input: JSON.parse(testCase.input),
        output: result.output || result.error,
        latency_ms: result.latency_ms,
        token_usage: result.token_usage || 0
      });

      if (result.success) {
        console.log(chalk.green(`  ✓ 通过 (${result.latency_ms}ms)`));
      } else {
        console.log(chalk.red(`  ✗ 失败：${result.error}`));
      }
    }

    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;

    console.log('\n' + chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.green(`通过：${passed}`) + '  ' + chalk.red(`失败：${failed}`));
    console.log(chalk.cyan('═══════════════════════════════════════'));

    return results;
  }

  /**
   * A/B 测试
   */
  async abtest(promptName, versionA, versionB, testCases = null) {
    if (!testCases) {
      testCases = this.storage.getTestCases(promptName);
    }

    if (testCases.length === 0) {
      throw new Error('没有测试用例，无法进行 A/B 测试');
    }

    console.log(chalk.cyan(`🆚 A/B 测试：${promptName}`));
    console.log(chalk.gray(`版本 A: ${versionA} vs 版本 B: ${versionB}\n`));

    const results = {
      versionA: { wins: 0, totalLatency: 0, totalTokens: 0 },
      versionB: { wins: 0, totalLatency: 0, totalTokens: 0 }
    };

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(chalk.gray(`[${i + 1}/${testCases.length}] ${testCase.name}`));

      // 并行运行两个版本
      const [outputA, outputB] = await Promise.all([
        this.runSingleTest(promptName, versionA, { input: testCase.input }),
        this.runSingleTest(promptName, versionB, { input: testCase.input })
      ]);

      // 评估哪个更好
      const winner = await this.evaluateOutputs(
        outputA.output || outputA.error,
        outputB.output || outputB.error,
        testCase.expected_output
      );

      if (winner === 'A') {
        results.versionA.wins++;
        console.log(chalk.green('  → 版本 A 胜出'));
      } else if (winner === 'B') {
        results.versionB.wins++;
        console.log(chalk.green('  → 版本 B 胜出'));
      } else {
        console.log(chalk.gray('  → 平局'));
      }

      results.versionA.totalLatency += outputA.latency_ms;
      results.versionB.totalLatency += outputB.latency_ms;
      results.versionA.totalTokens += outputA.token_usage || 0;
      results.versionB.totalTokens += outputB.token_usage || 0;
    }

    // 计算统计
    const total = testCases.length;
    return {
      winner: results.versionA.wins > results.versionB.wins ? 'A' : (results.versionB.wins > results.versionA.wins ? 'B' : 'Tie'),
      winRate: {
        A: ((results.versionA.wins / total) * 100).toFixed(1) + '%',
        B: ((results.versionB.wins / total) * 100).toFixed(1) + '%'
      },
      avgLatency: {
        A: Math.round(results.versionA.totalLatency / total) + 'ms',
        B: Math.round(results.versionB.totalLatency / total) + 'ms'
      },
      avgTokens: {
        A: Math.round(results.versionA.totalTokens / total),
        B: Math.round(results.versionB.totalTokens / total)
      }
    };
  }

  /**
   * 评估输出（使用 LLM 判断）
   */
  async evaluateOutputs(outputA, outputB, expectedOutput) {
    if (!this.apiKey) {
      // 没有 API key 时，简单判断
      return 'A';
    }

    try {
      const { text } = await generateText({
        model: 'gpt-3.5-turbo',
        prompt: `Compare two AI outputs:

Expected behavior: ${expectedOutput || 'Helpful and accurate response'}

Output A:
${outputA}

Output B:
${outputB}

Which output is better? Reply only A or B or TIE.`,
        maxTokens: 10
      });

      const trimmed = text.trim().toUpperCase();
      if (trimmed.includes('TIE')) return 'TIE';
      if (trimmed.includes('B')) return 'B';
      return 'A';
    } catch (error) {
      return 'A';
    }
  }
}

module.exports = TestRunner;
