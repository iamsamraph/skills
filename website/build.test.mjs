import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const web=path.dirname(fileURLToPath(import.meta.url));
test('repository changes add, update and remove skills; render safely and preserve downloads',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'skills-build-'));
 const source=path.join(temp,'source'),output=path.join(temp,'output');fs.mkdirSync(source);
 const build=()=>execFileSync(process.execPath,[path.join(web,'build.mjs')],{env:{...process.env,SKILLS_SOURCE_DIR:source,SKILLS_OUTPUT_DIR:output,COMMIT_REF:'test-commit'}});
 const write=(name,text)=>{const p=path.join(source,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);};
 try{
  write('alpha/SKILL.md','---\nname: alpha\ndescription: First skill\n---\n# Alpha\n\nOriginal instructions.\n');
  write('alpha/README.md','# Alpha\n\nOriginal introduction.\n\n[Beta](../beta/README.md)\n\n<script>alert(1)</script>\n\n[Bad](javascript:alert(1))\n');
  write('alpha/references/example.md','Reference text.\n');
  write('alpha/.private','DO NOT PUBLISH');
  write('beta/SKILL.md','# Beta\n\nWorks without a README or metadata.\n');
  build();
  let html=fs.readFileSync(path.join(output,'skills/alpha/index.html'),'utf8');
  assert.match(html,/Original introduction/);assert.match(html,/href="\/skills\/beta\/"/);
  assert.doesNotMatch(html,/<script>alert/);assert.doesNotMatch(html,/href="javascript:/);
  assert.match(html,/Download example/);
  assert.equal(fs.readFileSync(path.join(output,'skills/alpha/SKILL.md'),'utf8'),fs.readFileSync(path.join(source,'alpha/SKILL.md'),'utf8'));
  assert.ok(!fs.existsSync(path.join(output,'skills/alpha/.private')));
  assert.match(fs.readFileSync(path.join(output,'skills/index.html'),'utf8'),/<span>02<\/span>/);
  write('alpha/README.md','# Alpha renamed\n\nUpdated introduction.\n');
  write('alpha/SKILL.md','# Alpha\n\nUpdated instructions.\n');
  write('gamma/SKILL.md','# Gamma\n\nBrand new skill.\n');
  fs.rmSync(path.join(source,'beta'),{recursive:true});
  build();
  html=fs.readFileSync(path.join(output,'skills/alpha/index.html'),'utf8');
  assert.match(html,/<h1>Alpha renamed<\/h1>/);assert.match(html,/Updated introduction/);assert.match(html,/Updated instructions/);
  assert.ok(fs.existsSync(path.join(output,'skills/gamma/index.html')));
  assert.ok(!fs.existsSync(path.join(output,'skills/beta')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(output,'skills-build.json'))).commit,'test-commit');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
