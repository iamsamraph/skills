// The chosen scroll runs 20% faster than the initial preview.
const words = ['SPREADSHEETS', 'PAPERWORK', 'ADMIN', 'EMAILS', 'REPORTS', 'DATA ENTRY', 'MEETING NOTES', 'COPY-PASTING', 'BUSYWORK'];
const HOLD_MS = 2167;
const SCROLL_MS = 467;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const rotator = document.querySelector('.rotator');
const windowEl = document.querySelector('.word-window');
let index = 0;
let timer;
let generation = 0;
let animations = [];
function clearMotion() {
  clearTimeout(timer);
  generation++;
  animations.forEach(animation => animation.cancel());
  animations = [];
}
function measure(text) {
  const span = document.createElement('span');
  span.className = 'word';
  span.textContent = text;
  span.style.cssText = 'position:fixed;visibility:hidden;width:max-content;';
  rotator.append(span);
  const width = span.getBoundingClientRect().width;
  span.remove();
  return width;
}
function fit() {
  rotator.style.fontSize = '';
  const available = document.querySelector('.hero-copy').clientWidth - (innerWidth <= 720 ? 20 : 55);
  const fontSize = parseFloat(getComputedStyle(rotator).fontSize);
  const widest = Math.max(...words.map(measure)) + fontSize * 0.42;
  if (widest > available) rotator.style.fontSize = (fontSize * available / widest) + 'px';
  windowEl.style.width = Math.ceil(measure(words[index])) + 2 + 'px';
}
function renderWord() {
  const span = document.createElement('span');
  span.className = 'word current';
  span.textContent = words[index];
  windowEl.replaceChildren(span);
  fit();
}
function schedule() {
  clearTimeout(timer);
  if (!reduced.matches && !document.hidden) timer = setTimeout(advance, HOLD_MS);
}
async function advance() {
  clearMotion();
  const currentGeneration = generation;
  const old = windowEl.querySelector('.current');
  index = (index + 1) % words.length;
  const next = document.createElement('span');
  next.className = 'word incoming';
  next.textContent = words[index];
  windowEl.append(next);
  windowEl.style.width = Math.ceil(measure(next.textContent)) + 2 + 'px';
  animations = [
    old.animate([{transform: 'translateY(0)'}, {transform: 'translateY(-115%)'}], {duration: SCROLL_MS, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards'}),
    next.animate([{transform: 'translateY(115%)'}, {transform: 'translateY(0)'}], {duration: SCROLL_MS, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards'})
  ];
  await Promise.allSettled(animations.map(animation => animation.finished));
  if (currentGeneration !== generation) return;
  old.remove();
  next.className = 'word current';
  animations.forEach(animation => animation.cancel());
  animations = [];
  schedule();
}
function reset() {
  clearMotion();
  renderWord();
  schedule();
}
reduced.addEventListener('change', reset);
document.addEventListener('visibilitychange', reset);
window.addEventListener('resize', reset);
document.fonts.ready.then(reset);
