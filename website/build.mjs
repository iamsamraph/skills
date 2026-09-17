import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import YAML from 'yaml';
const web=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.env.SKILLS_SOURCE_DIR || path.join(web,'..'));
const destination=path.resolve(process.env.SKILLS_OUTPUT_DIR || path.join(web,'dist'));
const out=path.join(destination,'skills');
const display=JSON.parse(fs.readFileSync(path.join(web,'skill-display.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const plain=s=>sanitizeHtml(marked.parse(String(s)),{allowedTags:[],allowedAttributes:{}}).replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
function unpack(text){
 const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
 return {meta:match ? (YAML.parse(match[1]) || {}) : {}, body:match ? text.slice(match[0].length) : text};
}
const readmes=new Map(), instructionsBySlug=new Map(), summaries=new Map();
const rootReadme=fs.existsSync(path.join(root,'README.md')) ? fs.readFileSync(path.join(root,'README.md'),'utf8') : '';
for(const line of rootReadme.split('\n')){
 const m=line.match(/^\|\s*\[[^\]]+\]\((?:\.\/)?([a-z0-9-]+)\/?\)\s*\|\s*(.*?)\s*\|$/);
 if(m)summaries.set(m[1],plain(m[2]));
}
const slugs=fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory() && !d.name.startsWith('.') && fs.existsSync(path.join(root,d.name,'SKILL.md'))).map(d=>d.name);
slugs.sort((a,b)=>(display[a]?.order ?? 100)-(display[b]?.order ?? 100)||a.localeCompare(b));
const items=slugs.map((slug,i)=>{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Skill folder must use lowercase letters, numbers and hyphens: '+slug);
 const instructions=fs.readFileSync(path.join(root,slug,'SKILL.md'),'utf8');
 const {meta,body}=unpack(instructions);
 const readmePath=path.join(root,slug,'README.md');
 const readme=unpack(fs.existsSync(readmePath) ? fs.readFileSync(readmePath,'utf8') : body).body;
 const title=plain(readme.match(/^# (.+)$/m)?.[1] || slug.replaceAll('-',' '));
 const firstParagraph=marked.lexer(readme).find(t=>t.type==='paragraph')?.text;
 const desc=summaries.get(slug) || plain(firstParagraph || meta.description || 'Reusable instructions for everyday work.');
 const info={...display[slug],...(meta.website || {})};
 readmes.set(slug,readme);instructionsBySlug.set(slug,instructions);
 return [slug,title,info.tagline || '',desc,info.category || 'Everyday work',info.needs || '',String(i+1).padStart(2,'0')];
});
function renderMarkdown(text,slug){
 return sanitizeHtml(marked.parse(text),{
  allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','title','width','height']},
  allowedSchemes:['http','https','mailto'],
  transformTags:{a:(tagName,attrs)=>{
   let href=attrs.href || '';
   if(href && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(href)){
    const resolved=new URL(href,`https://do-less.co/skills/${slug}/`);
    const parts=resolved.pathname.split('/').filter(Boolean);
    if(parts[0]==='skills' && slugs.includes(parts[1])){
     if(parts.length===2 || (parts.length===3 && parts[2]==='README.md'))resolved.pathname=`/skills/${parts[1]}/`;
     href=resolved.pathname+resolved.search+resolved.hash;
    }else href=`https://github.com/iamsamraph/skills/blob/main/${slug}/${href}`;
   }
   return {tagName,attribs:{...attrs,href}};
  }}
 });
}
// Copy only public skill support files; never follow symlinks or publish hidden files.
function copySupport(src,dst){
 for(const entry of fs.readdirSync(src,{withFileTypes:true})){
  if(entry.name.startsWith('.') || ['node_modules','__pycache__'].includes(entry.name))continue;
  const from=path.join(src,entry.name),to=path.join(dst,entry.name);
  if(entry.isDirectory()){fs.mkdirSync(to,{recursive:true});copySupport(from,to);}
  else if(entry.isFile())fs.copyFileSync(from,to);
 }
}
fs.rmSync(destination,{recursive:true,force:true});
fs.cpSync(path.join(web,'public'),destination,{recursive:true});
const head=(title,desc,prefix)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} | Do Less Co</title><meta name="description" content="${esc(desc)}"><link rel="stylesheet" href="${prefix}assets/fonts.css"><link rel="stylesheet" href="${prefix}skills/skills.css"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%23531824'/%3E%3Ctext x='32' y='45' text-anchor='middle' fill='%23F3F0E6' font-family='Arial' font-weight='900' font-size='42'%3Ed.%3C/text%3E%3C/svg%3E"></head><body class="${prefix === '../' ? 'library-page' : 'skill-page'}"><a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="${prefix}">DO LESS CO.</a><nav aria-label="Main"><a href="${prefix}skills/" aria-current="page">The skills library</a></nav></header>`;
const footer=`<footer><a class="wordmark" href="/">DO LESS CO.</a><p>AI for Everyday Work</p><small>© 2026 Sam Raphael · Free to use and adapt. Credit appreciated.</small></footer>`;
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'index.html'),head('The skills library','Skills by Sam Raphael. Written instructions that help AI do everyday work properly.','../')+`<main id="main"><section class="intro"><img class="library-photo" src="../assets/hero.jpg" alt="" fetchpriority="high"><div class="intro-title"><p class="hand">A little less busywork.</p><h1>DO LESS.<br><span>TAKE A SKILL.</span></h1></div><div class="intro-note"><p>Skills I’ve built and use.<br> Take them, pull them apart,<br> make them yours.</p><span>— Sam</span></div></section><div class="library-heading"><h2>The skills library <span>${String(items.length).padStart(2,'0')}</span></h2><p>Real jobs. Reusable instructions.</p></div><section class="cards" aria-label="Skills">`+items.map(([slug,title,tag,desc,category,needs,num])=>`<a class="card" href="${slug}/"><div class="card-top"><span>${esc(category)}</span><span class="number">${num}</span></div><h3>${esc(title)}</h3>${tag ? `<p class="card-tag">${esc(tag)}</p>` : ''}<p class="description">${esc(desc)}</p><div class="card-bottom"><span>${esc(needs)}</span><strong>Explore skill <span aria-hidden="true">↗</span></strong></div></a>`).join('')+`</section><section class="explainer"><p class="hand">Wait, what’s a skill?</p><div><h2>A job explained once.<br>Done properly, every time.</h2><p>A skill is a set of written instructions that tells an AI assistant how to do one job. It’s plain text. If you can read it, you can change it.</p><p>Choose a skill, read the guide, then copy the instructions into an assistant with access to the tools it needs.</p></div></section></main>${footer}</body></html>`);
for(const [slug,title,tag,desc,category,needs,num] of items){
const dir=path.join(out,slug);fs.mkdirSync(dir,{recursive:true});
let readme=readmes.get(slug);
readme=readme.replace(/^# .+\r?\n/,'').replace(/\n---\s*\n©[^\n]*\s*$/,'');
const instructions=instructionsBySlug.get(slug);
copySupport(path.join(root,slug),dir);
const references=fs.existsSync(path.join(root,slug,'references')) ? fs.readdirSync(path.join(root,slug,'references'),{withFileTypes:true}).filter(f=>f.isFile()&&!f.name.startsWith('.')).map(f=>f.name) : [];
fs.writeFileSync(path.join(dir,'index.html'),head(title,desc,'../../')+`<main id="main"><a class="back" href="../">← All skills</a><section class="detail-hero"><p class="overline">${esc(category)} <span> / ${num}</span></p><h1>${esc(title)}</h1>${tag ? `<p class="detail-tag">${esc(tag)}</p>` : ''}</section><div class="detail-layout"><article class="prose">${renderMarkdown(readme,slug)}</article><aside><div class="use-card"><p class="hand">Make it yours.</p><h2>Use this skill</h2>${needs ? `<p>Needs: ${esc(needs)}</p>` : ''}<button class="primary" data-copy>Copy instructions <span>↗</span></button><a class="secondary" href="SKILL.md" download>Download SKILL.md ↓</a>${references.length ? '<p class="reference-note">Also download the supporting files. Keep them in a <code>references/</code> folder beside SKILL.md.</p>'+references.map(file=>`<a class="text-link" href="references/${encodeURIComponent(file)}" download>Download ${esc(file.replace(/\.md$/,'').replaceAll('-',' '))} ↓</a>`).join('') : ''}<a class="text-link" href="https://github.com/iamsamraph/skills/tree/main/${slug}">View on GitHub ↗</a><hr><button class="share" data-share>Copy link to this skill ↗</button><p class="status" role="status" aria-live="polite"></p></div></aside></div><details class="instructions"><summary>Read the full skill instructions <span>+</span></summary><pre id="skill-text">${esc(instructions)}</pre></details></main>${footer}<script src="../skills.js"></script></body></html>`);
}
fs.writeFileSync(path.join(destination,'skills-build.json'),JSON.stringify({commit:process.env.COMMIT_REF || 'local',skills:slugs}));
console.log(`Built skills library and ${items.length} detail pages.`);
