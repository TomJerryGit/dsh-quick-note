/** Prepare the public dsh-quick-note package. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, text) => fs.writeFileSync(path.join(root, file), text, 'utf8');

const pkg = JSON.parse(read('package.json'));
pkg.name = 'dsh-quick-note';
pkg.version = '1.0.0';
pkg.private = false;
pkg.description = 'Local-first management console for DeepSeek Harness: notes, tasks, flashcards, health records, agent tools, usage/cost insights, savings guard, cleanup, and workspace value analysis.';
pkg.author = { name: 'TomJerryGit' };
pkg.license = 'MIT';
pkg.repository = { type: 'git', url: 'git+https://github.com/TomJerryGit/dsh-quick-note.git' };
pkg.homepage = 'https://github.com/TomJerryGit/dsh-quick-note#readme';
pkg.bugs = { url: 'https://github.com/TomJerryGit/dsh-quick-note/issues' };
pkg.keywords = ['dsh-plugin', 'deepseek-harness', 'notes', 'tasks', 'flashcards', 'health', 'cost', 'productivity', 'local-first'];
pkg.files = ['index.js', 'client.js', 'cordis.patch.yml', 'locale/*.json', 'icon.svg', 'README.md', 'LICENSE'];
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

const template = read('src/client.template.js').replaceAll('@local/dsh-quick-note', 'dsh-quick-note');
write('src/client.template.js', template);
const patch = read('cordis.patch.yml').replaceAll('@local/dsh-quick-note', 'dsh-quick-note');
write('cordis.patch.yml', patch);
const host = read('index.js').replaceAll("pluginVersion: '1.44.0'", "pluginVersion: '1.0.0'");
write('index.js', host);
const readme = read('README.md').replaceAll('@local/dsh-quick-note', 'dsh-quick-note');
write('README.md', readme);

const license = `MIT License

Copyright (c) 2026 TomJerryGit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
write('LICENSE', license);
console.log('prepared dsh-quick-note@' + pkg.version);
