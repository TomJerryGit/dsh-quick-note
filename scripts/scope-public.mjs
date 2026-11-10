/** Switch public package identity to the scoped name required by npm. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, text) => fs.writeFileSync(path.join(root, file), text, 'utf8');
const scope = '@tomjerrygit/dsh-quick-note';

const pkg = JSON.parse(read('package.json'));
pkg.name = scope;
write('package.json', JSON.stringify(pkg, null, 2) + '\n');

write('src/client.template.js', read('src/client.template.js').replace("id: 'dsh-quick-note'", "id: '" + scope + "'"));
write('cordis.patch.yml', read('cordis.patch.yml').replaceAll("'dsh-quick-note'", "'" + scope + "'"));
const readme = read('README.md')
  .replaceAll('dsh plugin --profile web add dsh-quick-note', 'dsh plugin --profile web add ' + scope)
  .replaceAll('dsh plugin --profile desktop add dsh-quick-note', 'dsh plugin --profile desktop add ' + scope)
  .replaceAll('移除 `dsh-quick-note`', '移除 `' + scope + '`');
write('README.md', readme);
write('test/host.test.mjs', read('test/host.test.mjs').replace("pkg.name === 'dsh-quick-note'", "pkg.name === '" + scope + "'"));
console.log('switched to ' + scope);
