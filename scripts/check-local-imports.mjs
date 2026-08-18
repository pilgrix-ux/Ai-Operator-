import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.name.endsWith('.js'))files.push(p)}}
walk(root);
const errors=[];
for(const file of files){const text=fs.readFileSync(file,'utf8');const re=/from\s+['"](\.[^'"]+)['"]/g;let m;while((m=re.exec(text))){let target=path.resolve(path.dirname(file),m[1]);if(!path.extname(target))target+='.js';if(!fs.existsSync(target))errors.push(`${path.relative(process.cwd(),file)} -> missing ${m[1]}`)}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Checked ${files.length} JS files: local imports resolved.`);
