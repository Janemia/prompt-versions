#!/usr/bin/env node

/**
 * Prompt Versions CLI
 * Git for Prompts - Version control for AI prompts
 */

const { Command } = require('commander');
const chalk = require('chalk').default;
const boxen = require('boxen').default;
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const PromptStorage = require('../lib/storage');
const DiffEngine = require('../lib/diff');
const TestRunner = require('../lib/test-runner');

const program = new Command();
const VERSION = '0.1.0';

// 获取存储实例
function getStorage() {
  const storage = new PromptStorage();
  return storage;
}

// 欢迎横幅
function showBanner() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██████╗ ███████╗████████╗██████╗  ██████╗              ║
║   ██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗             ║
║   ██████╔╝█████╗     ██║   ██████╔╝██║   ██║             ║
║   ██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║             ║
║   ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝             ║
║   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝              ║
║                                                          ║
║              Git for Prompts v${VERSION}                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `));
}

program
  .name('prompt')
  .description('🚀 Prompt Versions - Git for Prompts')
  .version(VERSION);

// ==================== init 命令 ====================
program
  .command('init')
  .description('📦 初始化 Prompt 仓库')
  .action(() => {
    showBanner();
    console.log(chalk.cyan('📦 初始化 Prompt 仓库...\n'));

    const storage = getStorage();
    const baseDir = storage.init();
    storage.close();

    // 创建配置文件
    const configFile = path.join(process.cwd(), 'prompt.config.json');
    const config = {
      name: path.basename(process.cwd()),
      created_at: new Date().toISOString(),
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000
    };
    fs.writeJsonSync(configFile, config, { spaces: 2 });

    console.log(chalk.green('✅ 初始化成功!'));
    console.log(chalk.gray(`📁 仓库位置：${baseDir}`));
    console.log(chalk.gray(`📄 配置文件：${configFile}`));
    console.log('\n下一步:');
    console.log(chalk.cyan('  1. prompt create <name>  ') + '创建 Prompt');
    console.log(chalk.cyan('  2. prompt save <name>    ') + '保存版本');
    console.log(chalk.cyan('  3. prompt history <name> ') + '查看历史');
  });

// ==================== create 命令 ====================
program
  .command('create <name>')
  .description('✨ 创建新 Prompt')
  .action(async (name) => {
    showBanner();
    console.log(chalk.cyan(`✨ 创建 Prompt: ${name}\n`));

    const storage = getStorage();
    storage.init();

    // 交互式输入
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: '输入 Prompt 内容:',
        default: 'You are a helpful assistant.'
      },
      {
        type: 'input',
        name: 'model',
        message: '使用的模型:',
        default: 'gpt-3.5-turbo'
      },
      {
        type: 'input',
        name: 'variables',
        message: '变量名（逗号分隔，如 company,message）:',
        default: ''
      },
      {
        type: 'input',
        name: 'tags',
        message: '标签（逗号分隔）:',
        default: ''
      }
    ]);

    const promptData = {
      prompt: answers.prompt,
      model: answers.model,
      variables: answers.variables ? answers.variables.split(',').map(v => v.trim()) : [],
      tags: answers.tags ? answers.tags.split(',').map(t => t.trim()) : []
    };

    const version = storage.saveVersion(name, promptData, 'Initial version');

    storage.close();

    console.log('\n' + chalk.green(`✅ Prompt "${name}" 创建成功!`));
    console.log(chalk.gray(`版本：${version}`));
    console.log(chalk.gray(`模型：${promptData.model}`));
    console.log(chalk.gray(`变量：${promptData.variables.join(', ') || '无'}`));
  });

// ==================== save 命令 ====================
program
  .command('save <name>')
  .description('💾 保存 Prompt 版本')
  .option('-m, --message <message>', '版本说明')
  .action(async (name, options) => {
    showBanner();
    console.log(chalk.cyan(`💾 保存版本：${name}\n`));

    const storage = getStorage();
    storage.init();

    const current = storage.getCurrentVersion(name);
    
    if (!current) {
      console.log(chalk.red(`❌ Prompt "${name}" 不存在`));
      console.log(chalk.gray('💡 使用 prompt create 创建新 Prompt'));
      storage.close();
      return;
    }

    // 交互式更新
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: '更新 Prompt 内容:',
        default: current.prompt_text
      },
      {
        type: 'input',
        name: 'message',
        message: '版本说明:',
        default: options.message || ''
      }
    ]);

    const promptData = {
      prompt: answers.prompt,
      model: current.model,
      temperature: current.temperature,
      max_tokens: current.max_tokens,
      variables: JSON.parse(current.variables),
      tags: JSON.parse(current.tags)
    };

    const version = storage.saveVersion(name, promptData, answers.message);

    storage.close();

    console.log('\n' + chalk.green(`✅ 版本 ${version} 保存成功!`));
    if (answers.message) {
      console.log(chalk.gray(`说明：${answers.message}`));
    }
  });

// ==================== history 命令 ====================
program
  .command('history <name>')
  .description('📜 查看 Prompt 历史')
  .action((name) => {
    showBanner();
    console.log(chalk.cyan(`📜 Prompt 历史：${name}\n`));

    const storage = getStorage();
    storage.init();

    const history = storage.getHistory(name);
    storage.close();

    if (history.length === 0) {
      console.log(chalk.yellow('⚠️  没有找到历史记录'));
      return;
    }

    history.forEach((item, index) => {
      const isCurrent = index === 0;
      const icon = isCurrent ? chalk.green('●') : chalk.gray('○');
      const version = chalk.bold(item.version);
      const message = item.message ? chalk.gray(`- ${item.message}`) : '';
      const date = chalk.gray(new Date(item.created_at).toLocaleString('zh-CN'));

      console.log(`${icon} ${version} ${message}`);
      console.log(`  ${date}`);
      console.log();
    });

    console.log(chalk.gray(`共 ${history.length} 个版本`));
  });

// ==================== diff 命令 ====================
program
  .command('diff <name> <version1> <version2>')
  .description('🔍 对比版本差异')
  .action((name, version1, version2) => {
    showBanner();
    console.log(chalk.cyan(`🔍 版本对比：${name}\n`));
    console.log(chalk.gray(`对比 ${version1} → ${version2}\n`));

    const storage = getStorage();
    storage.init();

    try {
      const diffData = storage.diffVersions(name, version1, version2);
      
      const diffEngine = new DiffEngine();
      const diffs = diffEngine.compare(diffData.version1.prompt, diffData.version2.prompt);
      const stats = diffEngine.stats(diffs);

      console.log(boxen(
        chalk.green(`+ ${stats.added} 字符`) + '  ' + 
        chalk.red(`- ${stats.deleted} 字符`) + '  ' +
        chalk.blue(`Σ ${stats.total} 变化`),
        { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
      ));

      console.log('\n' + chalk.gray('─────────────────────────────────────\n'));
      
      // 显示差异
      const colored = diffEngine.formatColored(diffs);
      console.log(colored);

    } catch (error) {
      console.log(chalk.red(`❌ 错误：${error.message}`));
    } finally {
      storage.close();
    }
  });

// ==================== rollback 命令 ====================
program
  .command('rollback <name> <version>')
  .description('⏮️  回滚到指定版本')
  .action((name, version) => {
    showBanner();
    console.log(chalk.cyan(`⏮️  回滚 Prompt: ${name} → ${version}\n`));

    const storage = getStorage();
    storage.init();

    const targetVersion = storage.getVersion(name, version);
    
    if (!targetVersion) {
      console.log(chalk.red(`❌ 版本 "${version}" 不存在`));
      storage.close();
      return;
    }

    const promptData = {
      prompt: targetVersion.prompt_text,
      model: targetVersion.model,
      temperature: targetVersion.temperature,
      max_tokens: targetVersion.max_tokens,
      variables: JSON.parse(targetVersion.variables),
      tags: JSON.parse(targetVersion.tags)
    };

    const newVersion = storage.saveVersion(name, promptData, `Rollback to ${version}`);
    storage.close();

    console.log(chalk.green(`✅ 回滚成功!`));
    console.log(chalk.gray(`新版本：${newVersion}`));
    console.log(chalk.gray(`回滚到：${version}`));
  });

// ==================== list 命令 ====================
program
  .command('list')
  .description('📋 列出所有 Prompt')
  .action(() => {
    showBanner();
    console.log(chalk.cyan('📋 Prompt 列表:\n'));

    const storage = getStorage();
    storage.init();

    const prompts = storage.listPrompts();
    storage.close();

    if (prompts.length === 0) {
      console.log(chalk.yellow('⚠️  没有 Prompt'));
      console.log(chalk.gray('💡 使用 prompt create <name> 创建第一个 Prompt'));
      return;
    }

    prompts.forEach((item, index) => {
      console.log(chalk.green(`${index + 1}. ${item.prompt_name}`));
      console.log(chalk.gray(`   版本数：${item.version_count} | 最后更新：${new Date(item.last_updated).toLocaleString('zh-CN')}`));
      console.log();
    });

    console.log(chalk.gray(`共 ${prompts.length} 个 Prompt`));
  });

// ==================== add-test 命令 ====================
program
  .command('add-test <name>')
  .description('🧪 添加测试用例')
  .action(async (name) => {
    showBanner();
    console.log(chalk.cyan(`🧪 添加测试用例：${name}\n`));

    const storage = getStorage();
    storage.init();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'testName',
        message: '测试名称:',
        default: '测试用例 1'
      },
      {
        type: 'input',
        name: 'input',
        message: '输入（JSON 格式，如 {"company":"Acme","message":"你好"}）:',
        default: '{}'
      },
      {
        type: 'input',
        name: 'expected',
        message: '期望输出（可选）:',
        default: ''
      }
    ]);

    try {
      const input = JSON.parse(answers.input);
      
      const testCaseId = storage.addTestCase(name, {
        name: answers.testName,
        input: input,
        expected_output: answers.expected || null,
        expected_tags: []
      });

      storage.close();

      console.log('\n' + chalk.green(`✅ 测试用例添加成功!`));
      console.log(chalk.gray(`ID: ${testCaseId}`));
      console.log(chalk.gray(`名称：${answers.testName}`));
    } catch (error) {
      console.log(chalk.red(`❌ 错误：输入的 JSON 格式不正确`));
      console.log(chalk.gray(error.message));
      storage.close();
    }
  });

// ==================== test 命令 ====================
program
  .command('test <name>')
  .description('🧪 运行测试')
  .option('-v, --version <version>', '指定版本')
  .option('--api-key <key>', 'API Key')
  .action(async (name, options) => {
    showBanner();
    console.log(chalk.cyan(`🧪 运行测试：${name}\n`));

    const storage = getStorage();
    storage.init();

    const runner = new TestRunner(storage, options.apiKey || process.env.OPENAI_API_KEY);

    try {
      await runner.runAllTests(name, options.version);
    } catch (error) {
      console.log(chalk.red(`❌ 错误：${error.message}`));
    } finally {
      storage.close();
    }
  });

// ==================== abtest 命令 ====================
program
  .command('abtest <name> <versionA> <versionB>')
  .description('🆚 A/B 测试')
  .option('--api-key <key>', 'API Key')
  .action(async (name, versionA, versionB, options) => {
    showBanner();
    console.log(chalk.cyan(`🆚 A/B 测试\n`));

    const storage = getStorage();
    storage.init();

    const runner = new TestRunner(storage, options.apiKey || process.env.OPENAI_API_KEY);

    try {
      const result = await runner.abtest(name, versionA, versionB);

      console.log('\n' + chalk.cyan('═══════════════════════════════════════'));
      console.log(chalk.green(`获胜者：版本 ${result.winner}`));
      console.log(chalk.cyan('═══════════════════════════════════════\n'));

      console.log(boxen(
        chalk.bold('版本 A') + '\n' +
        `胜率：${result.winRate.A}\n` +
        `延迟：${result.avgLatency.A}\n` +
        `Token: ${result.avgTokens.A}\n\n` +
        chalk.bold('版本 B') + '\n' +
        `胜率：${result.winRate.B}\n` +
        `延迟：${result.avgLatency.B}\n` +
        `Token: ${result.avgTokens.B}`,
        { padding: 1, borderColor: 'green', borderStyle: 'round' }
      ));

    } catch (error) {
      console.log(chalk.red(`❌ 错误：${error.message}`));
    } finally {
      storage.close();
    }
  });

// ==================== export 命令 ====================
program
  .command('export')
  .description('📤 导出所有 Prompt')
  .action(() => {
    showBanner();
    console.log(chalk.cyan('📤 导出 Prompt...\n'));

    const storage = getStorage();
    storage.init();

    const prompts = storage.listPrompts();
    const exportData = {
      exported_at: new Date().toISOString(),
      prompts: []
    };

    prompts.forEach(item => {
      const history = storage.getHistory(item.prompt_name);
      exportData.prompts.push({
        name: item.prompt_name,
        versions: history
      });
    });

    storage.close();

    console.log(JSON.stringify(exportData, null, 2));
  });

// ==================== delete 命令 ====================
program
  .command('delete <name>')
  .description('🗑️  删除 Prompt')
  .option('-f, --force', '跳过确认')
  .action(async (name, options) => {
    showBanner();
    console.log(chalk.cyan(`🗑️  删除 Prompt: ${name}\n`));

    const storage = getStorage();
    storage.init();

    const history = storage.getHistory(name);
    if (history.length === 0) {
      console.log(chalk.yellow(`⚠️  Prompt "${name}" 不存在`));
      storage.close();
      return;
    }

    console.log(chalk.gray(`将删除 ${history.length} 个版本`));

    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `确定要删除 Prompt "${name}" 吗？此操作不可恢复。`,
        default: false
      }]);

      if (!confirm) {
        console.log(chalk.gray('已取消'));
        storage.close();
        return;
      }
    }

    // 删除数据库记录
    const db = storage.db;
    db.prepare('DELETE FROM versions WHERE prompt_name = ?').run(name);
    db.prepare('DELETE FROM test_cases WHERE prompt_name = ?').run(name);
    db.prepare('DELETE FROM test_runs WHERE prompt_name = ?').run(name);

    // 删除文件
    const promptDir = path.join(storage.promptsDir, name);
    if (fs.existsSync(promptDir)) {
      fs.removeSync(promptDir);
    }

    storage.close();

    console.log(chalk.green(`✅ Prompt "${name}" 已删除`));
  });

// ==================== show 命令 ====================
program
  .command('show <name> <version>')
  .description('📄 查看指定版本内容')
  .action((name, version) => {
    showBanner();
    console.log(chalk.cyan(`📄 查看版本：${name} ${version}\n`));

    const storage = getStorage();
    storage.init();

    const data = storage.getVersion(name, version);
    storage.close();

    if (!data) {
      console.log(chalk.red(`❌ 版本 "${version}" 不存在`));
      return;
    }

    const variables = JSON.parse(data.variables || '[]');
    const tags = JSON.parse(data.tags || '[]');

    console.log(boxen(
      chalk.bold(`Prompt: ${data.prompt_name}`) + '\n' +
      chalk.gray(`版本：${data.version}`) + '\n' +
      chalk.gray(`创建时间：${new Date(data.created_at).toLocaleString('zh-CN')}`) + '\n' +
      (data.message ? chalk.gray(`说明：${data.message}`) + '\n' : '') +
      '\n' +
      chalk.cyan(`模型：${data.model}`) + '\n' +
      chalk.cyan(`温度：${data.temperature}`) + '\n' +
      chalk.cyan(`Max Tokens: ${data.max_tokens}`) + '\n' +
      '\n' +
      (variables.length > 0 ? chalk.gray(`变量：${variables.join(', ')}`) + '\n' : '') +
      (tags.length > 0 ? chalk.gray(`标签：${tags.join(', ')}`) + '\n' : '') +
      '\n' +
      chalk.bold('Prompt 内容:') + '\n' +
      '─'.repeat(40) + '\n' +
      data.prompt_text,
      { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
    ));
  });

// ==================== list-tests 命令 ====================
program
  .command('list-tests <name>')
  .description('📋 列出测试用例')
  .action((name) => {
    showBanner();
    console.log(chalk.cyan(`📋 测试用例：${name}\n`));

    const storage = getStorage();
    storage.init();

    const testCases = storage.getTestCases(name);
    storage.close();

    if (testCases.length === 0) {
      console.log(chalk.yellow('⚠️  没有找到测试用例'));
      console.log(chalk.gray('💡 使用 prompt add-test 添加测试用例'));
      return;
    }

    testCases.forEach((test, index) => {
      console.log(chalk.green(`${index + 1}. ${test.name}`));
      console.log(chalk.gray(`   输入：${test.input}`));
      if (test.expected_output) {
        console.log(chalk.gray(`   期望：${test.expected_output}`));
      }
      console.log();
    });

    console.log(chalk.gray(`共 ${testCases.length} 个测试用例`));
  });

// ==================== import 命令 ====================
program
  .command('import <file>')
  .description('📥 导入 Prompt')
  .action(async (file) => {
    showBanner();
    console.log(chalk.cyan(`📥 导入 Prompt: ${file}\n`));

    if (!fs.existsSync(file)) {
      console.log(chalk.red(`❌ 文件不存在：${file}`));
      return;
    }

    const storage = getStorage();
    storage.init();

    try {
      const importData = fs.readJsonSync(file);

      if (!importData.prompts || !Array.isArray(importData.prompts)) {
        throw new Error('无效的导入文件格式');
      }

      let importedCount = 0;

      for (const prompt of importData.prompts) {
        console.log(chalk.gray(`导入：${prompt.name}...`));

        if (!prompt.versions || !Array.isArray(prompt.versions)) {
          console.log(chalk.yellow(`  ⚠️  跳过（没有版本数据）`));
          continue;
        }

        for (const version of prompt.versions) {
          const promptData = {
            prompt: version.prompt || version.prompt_text,
            model: version.model || 'gpt-3.5-turbo',
            temperature: version.temperature || 0.7,
            max_tokens: version.max_tokens || 1000,
            variables: version.variables || [],
            tags: version.tags || []
          };

          storage.saveVersion(prompt.name, promptData, `Imported from ${file}`);
          importedCount++;
        }
      }

      storage.close();

      console.log('\n' + chalk.green(`✅ 成功导入 ${importedCount} 个版本`));

    } catch (error) {
      storage.close();
      console.log(chalk.red(`❌ 导入失败：${error.message}`));
    }
  });

// ==================== run 命令 ====================
program
  .command('run <name> [version]')
  .description('▶️  运行 Prompt 测试')
  .option('--api-key <key>', 'API Key')
  .action(async (name, version, options) => {
    showBanner();
    console.log(chalk.cyan(`▶️  运行 Prompt: ${name}\n`));

    const storage = getStorage();
    storage.init();

    if (!version) {
      const current = storage.getCurrentVersion(name);
      if (!current) {
        console.log(chalk.red(`❌ Prompt "${name}" 不存在`));
        storage.close();
        return;
      }
      version = current.version;
    }

    const data = storage.getVersion(name, version);
    if (!data) {
      console.log(chalk.red(`❌ 版本 "${version}" 不存在`));
      storage.close();
      return;
    }

    storage.close();

    // 解析变量
    const variables = JSON.parse(data.variables || '[]');
    
    // 交互式输入变量
    const inputs = {};
    for (const variable of variables) {
      const answer = await inquirer.prompt([{
        type: 'input',
        name: variable,
        message: `${variable}:`,
        default: ''
      }]);
      inputs[variable] = answer[variable];
    }

    console.log(chalk.gray('\n🤖 正在调用 AI...\n'));

    // 替换变量
    let promptText = data.prompt_text;
    Object.keys(inputs).forEach(key => {
      promptText = promptText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), inputs[key]);
    });

    try {
      const { generateText } = require('ai');
      const startTime = Date.now();
      
      const { text, usage } = await generateText({
        model: data.model || 'gpt-3.5-turbo',
        prompt: promptText,
        temperature: data.temperature,
        maxTokens: data.max_tokens,
        apiKey: options.apiKey || process.env.OPENAI_API_KEY
      });

      const latency = Date.now() - startTime;

      console.log(chalk.green('✅ 输出:') + '\n');
      console.log(text);
      console.log('\n' + chalk.gray('─'.repeat(40)));
      console.log(chalk.gray(`模型：${data.model}`));
      console.log(chalk.gray(`延迟：${latency}ms`));
      console.log(chalk.gray(`Token: ${usage?.totalTokens || '未知'}`));

    } catch (error) {
      console.log(chalk.red(`❌ 错误：${error.message}`));
      console.log(chalk.gray('💡 确保设置了 OPENAI_API_KEY 环境变量'));
    }
  });

// ==================== stats 命令 ====================
program
  .command('stats [name]')
  .description('📊 显示统计信息')
  .action((name) => {
    showBanner();

    const storage = getStorage();
    storage.init();

    if (name) {
      // 单个 Prompt 统计
      const history = storage.getHistory(name);
      const testCases = storage.getTestCases(name);

      if (history.length === 0) {
        console.log(chalk.yellow(`⚠️  Prompt "${name}" 不存在`));
        storage.close();
        return;
      }

      const firstVersion = history[history.length - 1];
      const lastVersion = history[0];

      console.log(chalk.cyan(`📊 Prompt 统计：${name}\n`));
      console.log(boxen(
        chalk.gray(`版本数：${history.length}`) + '\n' +
        chalk.gray(`测试用例：${testCases.length}`) + '\n' +
        chalk.gray(`首个版本：${new Date(firstVersion.created_at).toLocaleString('zh-CN')}`) + '\n' +
        chalk.gray(`最新版本：${new Date(lastVersion.created_at).toLocaleString('zh-CN')}`) + '\n' +
        chalk.gray(`模型：${lastVersion.model}`) + '\n' +
        chalk.gray(`变量：${(JSON.parse(lastVersion.variables || '[]')).length}`),
        { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
      ));

    } else {
      // 整体统计
      const prompts = storage.listPrompts();
      const totalVersions = prompts.reduce((sum, p) => sum + p.version_count, 0);

      console.log(chalk.cyan('📊 仓库统计\n'));
      console.log(boxen(
        chalk.green(`总 Prompt 数：${prompts.length}`) + '\n' +
        chalk.blue(`总版本数：${totalVersions}`) + '\n' +
        chalk.gray(`平均版本：${prompts.length > 0 ? (totalVersions / prompts.length).toFixed(1) : 0}`) + '\n' +
        '\n' +
        (prompts.length > 0 ? chalk.gray('最活跃的 Prompt:\n') + 
          prompts.slice(0, 5).map((p, i) => 
            `${i + 1}. ${p.prompt_name} (${p.version_count}版本)`
          ).join('\n') : ''),
        { padding: 1, borderColor: 'green', borderStyle: 'round' }
      ));
    }

    storage.close();
  });

// ==================== config 命令 ====================
program
  .command('config <action> [key] [value]')
  .description('⚙️  配置管理')
  .action((action, key, value) => {
    showBanner();

    const configFile = path.join(process.cwd(), 'prompt.config.json');
    
    let config = {};
    if (fs.existsSync(configFile)) {
      config = fs.readJsonSync(configFile);
    }

    if (action === 'list') {
      console.log(chalk.cyan('⚙️  当前配置:\n'));
      console.log(boxen(
        Object.entries(config)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
        { padding: 1, borderColor: 'cyan', borderStyle: 'round' }
      ));
    } else if (action === 'set' && key && value) {
      config[key] = value;
      fs.writeJsonSync(configFile, config, { spaces: 2 });
      console.log(chalk.green(`✅ 配置已设置：${key} = ${value}`));
    } else {
      console.log(chalk.yellow('用法：prompt config list|set <key> <value>'));
    }
  });

// 解析命令行
program.parse(process.argv);

// 无参数时显示帮助
if (!process.argv.slice(2).length) {
  showBanner();
  console.log(chalk.cyan('👋 欢迎使用 Prompt Versions!\n'));
  console.log(chalk.gray('常用命令:\n'));
  console.log(chalk.green('  prompt init              ') + '初始化仓库');
  console.log(chalk.green('  prompt create <name>     ') + '创建 Prompt');
  console.log(chalk.green('  prompt save <name>       ') + '保存版本');
  console.log(chalk.green('  prompt history <name>    ') + '查看历史');
  console.log(chalk.green('  prompt diff <v1> <v2>    ') + '对比版本');
  console.log(chalk.green('  prompt rollback <name> <v>') + '回滚版本');
  console.log(chalk.green('  prompt run <name>        ') + '运行测试');
  console.log(chalk.green('  prompt list              ') + '列出所有 Prompt');
  console.log(chalk.green('  prompt stats             ') + '显示统计');
  console.log('\n' + chalk.gray('使用 prompt --help 查看完整帮助'));
  console.log(chalk.gray('GitHub: https://github.com/Janemia/prompt-versions'));
}
