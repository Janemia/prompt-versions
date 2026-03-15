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
  console.log(chalk.green('  prompt list              ') + '列出所有 Prompt');
  console.log(chalk.green('  prompt test <name>       ') + '运行测试');
  console.log(chalk.green('  prompt abtest <v1> <v2>  ') + 'A/B 测试');
  console.log('\n' + chalk.gray('使用 prompt --help 查看完整帮助'));
  console.log(chalk.gray('GitHub: https://github.com/YOUR_USERNAME/prompt-versions'));
}
