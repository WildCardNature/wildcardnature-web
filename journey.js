(() => {
  'use strict';
  const canvas = document.querySelector('#circuit');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return; // The document remains a readable, ordinary portfolio.
  const body = document.body;
  const chapters = [...document.querySelectorAll('.chapter')];
  const panels = chapters.map(el => el.querySelector('.chapter-content'));
  const route = [...document.querySelectorAll('.route a')];
  const lair = document.querySelector('.lair');
  const glow = document.querySelector('.screen-glow');
  const roomLabel = document.querySelector('.room-label');
  const motionButton = document.querySelector('#motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const path = z => Math.sin(z * .016) * 10;
  let reduced = preference.matches;
  try { const saved = localStorage.getItem('satzquatch-motion'); if (saved) reduced = saved === 'reduced'; } catch {}
  let width, height, focal, anchors = [], current = 0, target = 0, active = -1, lastTime = 0, frame = 0, dirty = true;
  let camera = { x: 0, y: 9, z: 0, roll: 0 };
  const stops = [
    { id: 'discvault', name: 'DiscVault', sub: 'THE ARCHIVE', z: 90, color: '#ffb65c', kind: 0 },
    { id: 'leafprint', name: 'Leafprint', sub: 'THE GREENHOUSE', z: 180, color: '#b3ed8b', kind: 1 },
    { id: 'vigil', name: 'Vigil', sub: 'THE WATCHTOWER', z: 270, color: '#c4a0ff', kind: 2 },
    { id: 'wildcard', name: 'WildCard Nature', sub: 'THE WILDS', z: 360, color: '#70ead7', kind: 3 }
  ];
  stops.forEach(stop => {
    stop.x = path(stop.z) + 10;
    stop.link = document.createElement('a');
    stop.link.href = '#' + stop.id;
    stop.link.className = 'world-stop';
    stop.link.style.setProperty('--accent', stop.color);
    stop.link.innerHTML = `${stop.name} ↗<small>${stop.sub} / EXPLORE</small>`;
    document.querySelector('#world-stops').append(stop.link);
  });
  // Seeded geometry keeps the world stable while scrolling backward and forward.
  let seed = 9271;
  function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  const chips = Array.from({ length: 340 }, () => {
    const z = random() * 560 - 20;
    const side = random() > .5 ? 1 : -1;
    return { x: path(z) + side * (18 + random() * 95), z, w: 1 + random() * 5, d: 1 + random() * 5, h: .4 + random() ** 3 * 12, color: random() > .7 ? '#b769ad' : '#3e929d' };
  }).sort((a, b) => b.z - a.z);
  const stars = Array.from({ length: 100 }, () => [random(), random() * .65, random()]);
  function project(x, y, z) {
    const dz = z - camera.z;
    if (dz < 1) return null;
    const sx = (x - camera.x) * focal / dz;
    const sy = -(y - camera.y) * focal / dz;
    const c = Math.cos(camera.roll), s = Math.sin(camera.roll);
    return { x: width * .5 + sx * c - sy * s, y: height * .37 + sx * s + sy * c, scale: focal / dz, depth: dz };
  }
  function line(points, color, alpha = 1, lineWidth = 1, bloom = false) {
    const p = points.map(v => project(...v));
    if (p.some(v => !v)) return;
    const fog = clamp(1 - p[0].depth / 260);
    if (!fog) return;
    ctx.globalAlpha = alpha * fog;
    ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
    ctx.shadowBlur = bloom ? 8 : 0; ctx.shadowColor = color;
    ctx.beginPath(); p.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.stroke(); ctx.shadowBlur = 0;
  }
  function face(points, color, alpha = 1) {
    const p = points.map(v => project(...v)); if (p.some(v => !v)) return;
    ctx.globalAlpha = alpha * clamp(1 - p[0].depth / 280); ctx.fillStyle = color;
    ctx.beginPath(); p.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath(); ctx.fill();
  }
  function box(x, y, z, w, h, d, color, alpha = .6) {
    const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],e=[x-w/2,y,z+d/2];
    const top = v => [v[0],v[1]+h,v[2]];
    face([a,b,top(b),top(a)], '#101f29'); face([b,c,top(c),top(b)], '#0a141e'); face([top(a),top(b),top(c),top(e)], '#19303a');
    line([a,b,c,e,a],color,alpha); line([top(a),top(b),top(c),top(e),top(a)],color,alpha,1.2);
    [a,b,c,e].forEach(v=>line([v,top(v)],color,alpha));
  }
  function ring(x,y,z,r,color,alpha=.8,vertical=false) {
    const pts = Array.from({length:49},(_,i)=>{const a=i/48*Math.PI*2;return vertical?[x+Math.cos(a)*r,y+Math.sin(a)*r,z]:[x+Math.cos(a)*r,y,z+Math.sin(a)*r];});
    line(pts,color,alpha,1.3,true);
  }
  function landmark(stop, time) {
    const {x,z,color,kind}=stop;
    box(x,0,z,13,.6,13,color,.65);
    ring(x,.65,z,8,color,.35);
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4;
      line([[x+Math.cos(a)*8,.1,z+Math.sin(a)*8],[x+Math.cos(a)*10,.1,z+Math.sin(a)*10]],color,.8,1.5,true);
    }
    if(kind===0) {
      box(x,.6,z,8,10,6,color,.9);
      for(let i=0;i<7;i++) {
        const y=1.4+i*1.25;
        box(x,y,z-.1,7.6,.45,6.4,color,.5);
        line([[x-2.9,y+.65,z-3.3],[x-1.8,y+.65,z-3.3]],color,1,2,true);
      }
      ring(x,5.7,z-3.4,2.4,color,.9,true);ring(x,5.7,z-3.45,.55,color,1,true);
    } else if(kind===1) {
      for(let i=0;i<9;i++) {
        const a=i/9*Math.PI;
        const pts=Array.from({length:25},(_,j)=>{const t=j/24*Math.PI;return[x+Math.cos(t)*6*Math.cos(a),.7+Math.sin(t)*10,z+Math.cos(t)*6*Math.sin(a)];});
        line(pts,color,.7,1,true);
      }
      for(let i=1;i<5;i++) ring(x,.7+i*1.8,z,6*Math.sqrt(1-(i*1.8/10)**2),color,.45);
      line([[x,.7,z],[x,8,z]],color,1,2,true);
      for(let i=0;i<6;i++) {
        const y=2+i*.8,side=i%2?1:-1;
        line([[x,y,z],[x+side*2.8,y+1.1,z-.8],[x+side*1.7,y+2,z],[x,y+.6,z]],color,.9,1.5,true);
      }
    } else if(kind===2) {
      box(x,.6,z,5,13,5,color,.85);box(x,12,z,9,1.3,8,color,.9);
      for(let i=0;i<6;i++) ring(x,2+i*1.7,z,3.65,color,.6);
      line([[x,13,z],[x,18,z]],color,1,2,true);
      ring(x,16,z,4.2,color,.85);
      const angle=time*.0004;
      line([[x,16,z],[x+Math.cos(angle)*7,16,z+Math.sin(angle)*7]],color,.8,1.5,true);
      ring(x,17.8,z,.35,color,1);
    } else {
      for(let i=2;i>=0;i--) {
        const shift=(i-1)*2.3;
        box(x+shift,1+i*.6,z+i*1.8,6,10,.45,color,.8);
        line([[x+shift-2.3,2.2+i*.6,z+i*1.8-.3],[x+shift+2.3,2.2+i*.6,z+i*1.8-.3]],color,.8);
      }
      const zz=z-.4;
      line([[x-2,5,zz],[x-1,8,zz],[x,6.4,zz],[x+1.5,9,zz],[x+2.5,5,zz],[x-2,5,zz]],color,1,1.6,true);
      ring(x,8.5,zz,.55,color,.8,true);
    }
    // Each landmark connects physically to the information highway.
    line([[path(z),.08,z-15],[path(z),.08,z-7],[x-9,.08,z-7],[x-6.5,.08,z]],color,.9,2,true);
  }
  function draw(time, stage) {
    ctx.globalAlpha=1;ctx.shadowBlur=0;
    const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#070b15');sky.addColorStop(.42,'#152632');sky.addColorStop(.65,'#0b1720');sky.addColorStop(1,'#060b10');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    const haze=ctx.createRadialGradient(width*.73,height*.38,0,width*.73,height*.38,width*.55);haze.addColorStop(0,'#34516a44');haze.addColorStop(.5,'#60294b12');haze.addColorStop(1,'#050a1000');ctx.fillStyle=haze;ctx.fillRect(0,0,width,height);
    stars.forEach(([x,y,r])=>{ctx.globalAlpha=.15+r*.35;ctx.fillStyle='#bdced8';ctx.fillRect(x*width,y*height,r> .8?1.5:1,1);});
    const start=Math.floor((camera.z+2)/5)*5;
    for(let z=start+240;z>start;z-=5) {
      line([[-130,.01,z],[130,.01,z]],'#47717a',.15);
      for(let lane=-6;lane<=6;lane++) {
        const offset=lane*2.2;
        const color=lane===-1||lane===1?'#88eff4':lane%3===0?'#d66bac':'#34899c';
        line([[path(z)+offset,.04,z],[path(z+5)+offset,.04,z+5]],color,lane===-1||lane===1?.8:.35,lane===-1||lane===1?1.6:1,true);
      }
    }
    for(let x=-120;x<=120;x+=8) line([[x,0,camera.z+2],[x,0,camera.z+230]],'#527887',.15);
    chips.forEach(c=>{
      if(c.z-camera.z<5||c.z-camera.z>235)return;
      box(c.x,0,c.z,c.w,c.h,c.d,c.color,.36);
      for(let side=-1;side<=1;side+=2) line([[c.x+side*c.w/2,.03,c.z],[c.x+side*(c.w/2+2),.03,c.z],[c.x+side*(c.w/2+2),.03,c.z+6]],c.color,.35);
    });
    for(let i=0;i<28;i++) {
      const z=camera.z+5+(i*11.3+time*.012)%210, lane=(i%9-4)*2.2;
      line([[path(z)+lane,.12,z],[path(z+1.5)+lane,.12,z+1.5]],i%3?'#9ef9fa':'#ffc17e',.9,2,true);
    }
    [...stops].reverse().forEach(s=>{if(s.z-camera.z>8&&s.z-camera.z<240)landmark(s,time);});
    ctx.globalAlpha=1;
    stops.forEach((s,i)=>{
      const p=project(s.x,i===2?18:12,s.z);
      // Distant labels remain small landmarks; nearby labels can be clicked to open the overview.
      const show=stage>1.15&&p&&p.depth>12&&p.depth<150&&p.x>width*.48&&p.x<width-80&&p.y>135&&p.y<height*.77;
      s.link.style.display=show?'block':'none';
      if(show){s.link.style.left=p.x+'px';s.link.style.top=(p.y-20)+'px';s.link.style.opacity=clamp(1-p.depth/210);}
    });
  }
  function stageForScroll(y) {
    for(let i=anchors.length-2;i>=0;i--)if(y>=anchors[i])return i+clamp((y-anchors[i])/(anchors[i+1]-anchors[i]));
    return 0;
  }
  function updateMotion() {
    body.classList.toggle('reduced',reduced);
    motionButton.setAttribute('aria-pressed',String(reduced));
    motionButton.setAttribute('aria-label',reduced?'Enable cinematic motion':'Enable reduced motion');
    motionButton.querySelector('span').textContent=reduced?'off':'on';dirty=true;wake();
  }
  function resize() {
    width=innerWidth;height=innerHeight;focal=Math.min(width,1500)*.78;
    const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    anchors=chapters.map(el=>el.offsetTop);anchors[anchors.length-1]=Math.min(anchors.at(-1),document.documentElement.scrollHeight-height);
    target=stageForScroll(scrollY);dirty=true;wake();
  }
  function tick(time) {
    frame=0;
    if(document.hidden)return;
    const dt=Math.min(time-lastTime||16,64);lastTime=time;
    current=reduced?target:lerp(current,target,1-Math.exp(-dt/95));
    if(Math.abs(current-target)<.0002)current=target;
    const nextActive=Math.round(current);
    const stage=reduced?nextActive:current;
    const i=Math.min(Math.floor(stage),5),u=stage-i;
    const zs=[-20,12,60,150,228,330,408];
    const xs=[path(-20)-3,path(12)-3,...stops.map((s,j)=>s.x-width*.25*(s.z-zs[j+2])/focal),path(408)-3];
    camera.z=lerp(zs[i],zs[i+1],smooth(u));
    camera.x=lerp(xs[i],xs[i+1],smooth(u));
    camera.y=10.5+Math.sin(stage*Math.PI)*1.2;
    camera.roll=reduced?0:Math.sin(stage*Math.PI)*.018;
    const zoom=smooth((current-.12)/1.45);
    lair.style.transform=`scale(${1+zoom*7})`;
    lair.style.opacity=1-smooth((current-.62)/.82);
    lair.style.visibility=current>1.5?'hidden':'visible';
    glow.style.opacity=reduced?0:Math.sin(smooth((current-.6)/.85)*Math.PI)*.4;
    roomLabel.style.opacity=1-smooth(current*2);
    panels.forEach((p,j)=>{
      const distance=Math.abs(current-j);
      const opacity=reduced?(nextActive===j?1:0):1-smooth((distance-.2)/.46);
      p.classList.toggle('visible',opacity>.02);p.style.opacity=opacity;p.style.transform=`translateY(${(j-current)*25}px)`;
      p.inert=opacity<.25;p.setAttribute('aria-hidden',String(opacity<.25));
    });
    if(active!==nextActive){
      active=nextActive;
      const routeIndex=active<2?0:Math.min(active-1,4);
      route.forEach((a,j)=>j===routeIndex?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
      document.querySelector('#location').textContent=['THE WORKSPACE','ENTERING THE CIRCUIT','THE ARCHIVE / DISCVAULT','THE GREENHOUSE / LEAFPRINT','THE WATCHTOWER / VIGIL','THE WILDS / WILDCARD NATURE','THE MAKER'][active];
    }
    document.querySelector('#progress').textContent=String(Math.round(target/6*100)).padStart(2,'0')+' / 100';
    if(pendingFocus&&Math.abs(current-target)<.03&&!pendingFocus.inert){pendingFocus.tabIndex=-1;pendingFocus.focus({preventScroll:true});pendingFocus=null;}
    if(current>.55||dirty)draw(reduced?0:time,stage);
    dirty=false;
    if(!reduced&&(current>.55||current!==target))wake();
  }
  function wake(){if(!frame)frame=requestAnimationFrame(tick);}
  body.classList.add('enhanced');
  motionButton.addEventListener('click',()=>{reduced=!reduced;try{localStorage.setItem('satzquatch-motion',reduced?'reduced':'full');}catch{}updateMotion();});
  preference.addEventListener('change',e=>{reduced=e.matches;updateMotion();});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    const id=link.getAttribute('href').slice(1),section=document.getElementById(id);if(!section)return;
    event.preventDefault();history.pushState(null,'','#'+id);
    window.scrollTo({top:section.offsetTop,behavior:reduced?'instant':'smooth'});
    const panel=section.querySelector('.chapter-content');
    // Focus follows navigation after the camera arrives, preserving keyboard access.
    pendingFocus=panel;
  });
  let pendingFocus=null;
  window.addEventListener('scroll',()=>{target=stageForScroll(scrollY);dirty=true;wake();},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastTime=0;dirty=true;wake();}});
  resize();current=target;updateMotion();
})();
