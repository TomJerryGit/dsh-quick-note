import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const iconSource = path.join(root, 'icon.svg');
const siteIcon = path.join(root, 'site', 'icons', 'icon.svg');
fs.mkdirSync(path.dirname(siteIcon), { recursive: true });
fs.copyFileSync(iconSource, siteIcon);

const index = {
  format: 1,
  title: { en: 'dsh-quick-note', zh: '管理台' },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'Management console', zh: '管理台' },
      description: {
        en: 'Local-first notes, tasks, flashcards, health records, agent tools, cost insights, savings guard, cleanup, and workspace value analysis.',
        zh: '本地优先的笔记、任务、闪卡、健康记录、Agent 工具、费用洞察、省钱护栏、清理与工作区价值分析。',
      },
      icon: 'icons/icon.svg',
      author: 'TomJerryGit',
      homepage: 'https://github.com/TomJerryGit/dsh-quick-note#readme',
      repository: { url: 'https://github.com/TomJerryGit/dsh-quick-note' },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: Math.floor(Date.now() / 1000),
          source: { type: 'npm' },
          engines: pkg.engines || { dsh: '>=0.2.0-rc.2' },
        },
      ],
    },
  ],
};
fs.writeFileSync(path.join(root, 'site', 'index.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log('wrote site/index.json for ' + pkg.name + '@' + pkg.version);
