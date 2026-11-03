// Shared previews for choosing a ticker treatment. No spring or overshoot.
export function mountTicker({root, style='roll', words=['busywork.','admin.','paperwork.','emails.','copy-pasting.'], toggle=null, hold=1500}) {
  const rotator=root.querySelector('.rotator');
  const viewport=root.querySelector('.word-window');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0, timer, generation=0, animations=[], paused=false, completed=0;
  root.dataset.motion=style;

  function cancel() {
    clearTimeout(timer);
    generation++;
    animations.forEach(animation=>animation.cancel());
    animations=[];
  }
  function makeWord(text) {
    const span=document.createElement('span');
    span.className='word';
    span.textContent=text;
    return span;
  }
  function measure(text) {
    const span=makeWord(text);
    span.style.cssText='position:fixed;visibility:hidden;width:max-content';
    rotator.append(span);
    const width=span.getBoundingClientRect().width;
    span.remove();
    return width;
  }
  function fit() {
    root.style.fontSize='';
    rotator.style.fontSize='';
    const fontSize=parseFloat(getComputedStyle(root).fontSize);
    const gap=parseFloat(getComputedStyle(root).columnGap)||0;
    const available=root.clientWidth-gap;
    const widest=Math.max(...words.map(measure))+4;
    const needed=root.querySelector('.ticker-line').getBoundingClientRect().width+widest;
    if(needed>available) root.style.fontSize=(fontSize*available/needed)+'px';
    viewport.style.width=Math.ceil(Math.max(...words.map(measure)))+4+'px';
  }
  function render() {
    const current=makeWord(words[index]);
    current.classList.add('current');
    viewport.replaceChildren(current);
    root.dataset.state='holding';
    root.dataset.currentWord=words[index];
    fit();
  }
  function schedule() {
    clearTimeout(timer);
    if(!paused&&!reduced.matches&&!document.hidden) timer=setTimeout(advance,hold);
  }
  function animate(node,frames,options) {
    const animation=node.animate(frames,{fill:'forwards',...options});
    animations.push(animation);
  }
  async function advance() {
    cancel();
    const token=generation;
    const old=viewport.querySelector('.current');
    const nextIndex=(index+1)%words.length;
    root.dataset.state='animating';
    if(style==='slot') {
      const rowHeight=parseFloat(getComputedStyle(old).lineHeight);
      const reel=document.createElement('span');
      reel.className='slot-reel';
      const stops=[words[index]];
      for(let row=1;row<=6;row++) stops.push(words[(index+row)%words.length]);
      stops.push(words[nextIndex]);
      stops.forEach(text=>{
        const row=document.createElement('span');
        row.className='reel-word';
        row.textContent=text;
        row.style.height=rowHeight+'px';
        row.style.lineHeight=rowHeight+'px';
        reel.append(row);
      });
      viewport.replaceChildren(reel);
      animate(reel,[
        {transform:'translateY(0)'},
        {transform:`translateY(-${(stops.length-1)*rowHeight}px)`}
      ],{duration:940,easing:'cubic-bezier(.12,.72,.18,1)'});
    } else {
      const next=makeWord(words[nextIndex]);
      viewport.append(next);
      if(style==='fade') {
        animate(old,[{opacity:1},{opacity:0}],{duration:300,easing:'ease-in-out'});
        animate(next,[{opacity:0},{opacity:1}],{duration:300,easing:'ease-in-out'});
      } else if(style==='flip') {
        animate(old,[
          {transform:'perspective(220px) rotateX(0deg)',opacity:1,offset:0},
          {transform:'perspective(220px) rotateX(-90deg)',opacity:0,offset:.48},
          {transform:'perspective(220px) rotateX(-90deg)',opacity:0,offset:1}
        ],{duration:420,easing:'cubic-bezier(.3,.65,.3,1)'});
        animate(next,[
          {transform:'perspective(220px) rotateX(90deg)',opacity:0,offset:0},
          {transform:'perspective(220px) rotateX(90deg)',opacity:0,offset:.48},
          {transform:'perspective(220px) rotateX(0deg)',opacity:1,offset:1}
        ],{duration:420,easing:'cubic-bezier(.3,.65,.3,1)'});
      } else {
        animate(old,[{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:300,easing:'cubic-bezier(.4,0,.2,1)'});
        animate(next,[{transform:'translateY(100%)'},{transform:'translateY(0)'}],{duration:300,easing:'cubic-bezier(.4,0,.2,1)'});
      }
    }
    await Promise.allSettled(animations.map(animation=>animation.finished));
    if(token!==generation) return;
    index=nextIndex;
    completed++;
    root.dataset.completed=String(completed);
    animations.forEach(animation=>animation.cancel());
    animations=[];
    render();
    schedule();
  }
  function reset() {cancel();render();schedule();}
  function setPaused(value) {
    paused=value;
    if(toggle) {
      toggle.setAttribute('aria-pressed',String(paused));
      toggle.setAttribute('aria-label',paused?'Play rotating words':'Pause rotating words');
      toggle.textContent=paused?'Play ▷':'Pause Ⅱ';
    }
    reset();
  }
  toggle?.addEventListener('click',()=>setPaused(!paused));
  reduced.addEventListener('change',reset);
  document.addEventListener('visibilitychange',reset);
  window.addEventListener('resize',reset);
  document.fonts.ready.then(reset);
  return {
    pause:()=>setPaused(true),
    play:()=>setPaused(false),
    replay:()=>{cancel();index=0;render();if(!reduced.matches)advance();},
    refresh:reset
  };
}
