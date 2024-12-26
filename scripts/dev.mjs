import { spawn } from 'child_process';
import { join, normalize } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import which from 'which';

// 定义 Obsidian Vault 的根目录
const devVaultRoot = normalize('F:\\obsidian仓库\\theme dev');

// 创建测试目录
const baseDir = join(devVaultRoot, 'test');
if (!existsSync(baseDir)) {
  mkdirSync(baseDir, { recursive: true });
}

// 创建测试用的 Markdown 文件（如果不存在）
const testFile = join(baseDir, 'index.md');
if (!existsSync(testFile)) {
  writeFileSync(testFile, `---
tags:
  - test
---

**Please install "Style Settings" plugin for further develop**

## Heading 2

> Quote
>> text

- list
- list
  - sublist
  - sublist

### Heading 3

1. asd
2. asdasd
3. asdasdasd

---

[URL](https://github.com/subframe7536/obsidian-theme-maple)

| table1 | table2 |
| ------ | ------ |
| cell1  | cell2  |

`);
}

// 处理输入参数
const input = normalize(process.argv?.[2] ?? 'src/index.scss');
const output = 'MapleTheme-Dev.css';

// 获取 pnpm 命令的完整路径
const command = which.sync('pnpm');

// 配置 sass 编译参数
const args = [
  'sass',
  `"${normalize(input)}"`, // 输入文件路径
  `"${join(devVaultRoot, '.obsidian', 'snippets', output)}"`, // 输出文件路径
  '--watch',
  '--no-source-map',
  '--update'
];

// 修改 spawn 配置
const childProcess = spawn(command, args, {
  env: process.env,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
  windowsHide: true
});

// 处理标准输出
childProcess.stdout?.on('data', (data) => {
  console.log(data.toString().trim());
});

// 处理标准错误
childProcess.stderr?.on('data', (data) => {
  console.error(data.toString().trim());
});

// 处理进程错误
childProcess.on('error', (error) => {
  console.error('进程错误:', error);
  process.exit(1);
});

// 处理进程退出
childProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`进程退出，退出码: ${code}`);
    process.exit(code);
  }
});

// 处理主进程信号
process.on('SIGTERM', () => {
  childProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  childProcess.kill();
  process.exit(0);
});