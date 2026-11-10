/**
 * R1 final step: move the whole client factory body (constants + PanelBoundary
 * class + apply registrations, with all module-injection markers) into
 * src/entry.mjs. The template then contains only the ModuleLoader shell.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateFile = path.join(root, 'src', 'client.template.js');
const source = fs.readFileSync(templateFile, 'utf8');

const startMarker = "    const React = require('react');";
const endMarker = '    return { inject:';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker);
if (start < 0 || end < 0 || end <= start) throw new Error('unexpected template shape');

const body = source.slice(start, end);
const template = source.slice(0, start) + '    /*__QUICK_NOTE_ENTRY__*/' + source.slice(end);

fs.writeFileSync(templateFile, template, 'utf8');
fs.writeFileSync(path.join(root, 'src', 'entry.mjs'), 'export const EntryBodySource = ' + JSON.stringify(body) + ';\n', 'utf8');
console.log('entry bytes=' + body.length + ' template bytes=' + template.length);
