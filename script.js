/* ══════════════════════════════════════════════════
   THEME SYSTEM
══════════════════════════════════════════════════ */
const html = document.documentElement;
const toggleBtns = document.querySelectorAll('.theme-toggle');

function getTheme(){ return localStorage.getItem('theme')||'dark'; }
function applyTheme(t){
  html.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  // update canvas opacity live
  const cv = document.getElementById('dsCanvas');
  const mob = window.innerWidth < 768;
  cv.style.opacity = t === 'light' ? (mob ? '0.10' : '0.18') : (mob ? '0.28' : '0.52');
}
function toggleTheme(){
  applyTheme(getTheme()==='dark' ? 'light' : 'dark');
}

applyTheme(getTheme());
toggleBtns.forEach(b => b.addEventListener('click', toggleTheme));


/* ══════════════════════════════════════════════════
   DATA SCIENCE CANVAS BACKGROUND
   5 parallax layers:
   1. Grid  2. Matrix rain  3. Scatter clusters
   4. Floating DS terms  5. Neural network
══════════════════════════════════════════════════ */
(function(){
  const cv  = document.getElementById('dsCanvas');
  const ctx = cv.getContext('2d');
  let W, H, scrollY=0;
  const mob = ()=>window.innerWidth<768;

  // theme-aware colors
  function TC(a){ return html.getAttribute('data-theme')==='light' ? `rgba(0,100,90,${a})` : `rgba(0,229,200,${a})`; }
  function GC(a){ return html.getAttribute('data-theme')==='light' ? `rgba(140,80,0,${a})` : `rgba(240,180,41,${a})`; }

  function resize(){ W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; }
  window.addEventListener('resize',()=>{resize();init();},{passive:true});
  resize();
  window.addEventListener('scroll',()=>{scrollY=window.scrollY;},{passive:true});

  /* ─ 1. NEURAL NETWORK ─ */
  let nnNodes=[], nnEdges=[];

  function buildNN(){
    nnNodes=[]; nnEdges=[];
    const layers=mob()?[2,4,4,2]:[3,5,5,3];
    const lx=W*.07,lw=W*.86,ly=H*.1,lh=H*.8;
    const off=[0];
    layers.forEach((c,i)=>{
      const x=lx+(i/(layers.length-1))*lw;
      for(let n=0;n<c;n++){
        nnNodes.push({x,y:ly+((n+1)/(c+1))*lh,r:3.5+Math.random()*2.5,ph:Math.random()*Math.PI*2});
      }
      off.push(off[off.length-1]+c);
    });
    for(let li=0;li<layers.length-1;li++){
      for(let a=off[li];a<off[li+1];a++){
        for(let b=off[li+1];b<off[li+2];b++){
          nnEdges.push({a,b,t:-Math.random(),spd:.003+Math.random()*.004,on:Math.random()>.35});
        }
      }
    }
  }
  function drawNN(so){
    const dy=so*.12;
    nnEdges.forEach(e=>{
      if(!e.on)return;
      const na=nnNodes[e.a],nb=nnNodes[e.b];
      ctx.beginPath();ctx.moveTo(na.x,na.y-dy);ctx.lineTo(nb.x,nb.y-dy);
      ctx.strokeStyle=TC(.06);ctx.lineWidth=.8;ctx.stroke();
      e.t+=e.spd; if(e.t>1.3)e.t=-.3;
      if(e.t>=0&&e.t<=1){
        const px=na.x+(nb.x-na.x)*e.t, py=(na.y+(nb.y-na.y)*e.t)-dy;
        ctx.beginPath();ctx.arc(px,py,2.8,0,Math.PI*2);
        ctx.fillStyle=TC(.85);ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;
      }
    });
    nnNodes.forEach(n=>{
      n.ph+=.022;
      const a=.35+.32*Math.sin(n.ph);
      ctx.beginPath();ctx.arc(n.x,n.y-so*.12,n.r,0,Math.PI*2);
      ctx.fillStyle=TC(a);ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;
      ctx.beginPath();ctx.arc(n.x,n.y-so*.12,n.r+3+2.5*Math.sin(n.ph),0,Math.PI*2);
      ctx.strokeStyle=TC(a*.28);ctx.lineWidth=1;ctx.stroke();
    });
  }

  /* ─ 2. FLOATING TERMS ─ */
  const TERMS=['Python','pandas','NumPy','sklearn','TensorFlow','ML','CNN','RNN',
    'LSTM','SVM','k-NN','XGBoost','SQL','EDA','Kali','Nmap','Wireshark',
    'df.head()','accuracy','loss','epoch','feature','target','model.fit',
    'predict()','DataFrame','cluster','ROC','AUC','F1 Score','precision',
    'recall','gradient','backprop','cross-val','overfitting'];
  let floaters=[];

  function buildFloaters(){
    floaters=[];
    const n=mob()?14:28;
    for(let i=0;i<n;i++){
      floaters.push({
        txt:TERMS[Math.floor(Math.random()*TERMS.length)],
        x:Math.random()*W, y:Math.random()*H*2.5,
        vy:.1+Math.random()*.18, a:.05+Math.random()*.1,
        sz:mob()?8:9+Math.random()*6, gold:Math.random()>.8,
        wb:Math.random()*Math.PI*2, ws:.005+Math.random()*.008
      });
    }
  }
  function drawFloaters(so){
    floaters.forEach(f=>{
      f.y-=f.vy; f.wb+=f.ws;
      if(f.y<-30)f.y=H*1.8+Math.random()*H;
      const sy=f.y-so*.35;
      if(sy<-40||sy>H+40)return;
      ctx.font=`400 ${f.sz}px "Space Mono",monospace`;
      ctx.fillStyle=f.gold?GC(f.a):TC(f.a);
      ctx.fillText(f.txt,f.x+Math.sin(f.wb)*12,sy);
    });
  }

  /* ─ 3. SCATTER CLUSTERS ─ */
  let clusters=[];
  function buildClusters(){
    clusters=[];
    const n=mob()?3:4;
    for(let c=0;c<n;c++){
      const cx=.12*W+Math.random()*.76*W,cy=.12*H+Math.random()*.76*H;
      const pts=[]; const cnt=mob()?12:20;
      for(let i=0;i<cnt;i++) pts.push({x:cx+(Math.random()-.5)*120,y:cy+(Math.random()-.5)*100,r:1.5+Math.random()*2,ph:Math.random()*Math.PI*2});
      clusters.push({pts,gold:c%2===1});
    }
  }
  function drawClusters(so){
    clusters.forEach(cl=>{
      cl.pts.forEach(p=>{
        p.ph+=.016;
        const sy=p.y-so*.2;
        if(sy<-10||sy>H+10)return;
        const a=.18+.15*Math.sin(p.ph);
        ctx.beginPath();ctx.arc(p.x,sy,p.r,0,Math.PI*2);
        ctx.fillStyle=cl.gold?GC(a):TC(a);ctx.fill();
      });
    });
  }

  /* ─ 4. MATRIX RAIN ─ */
  const MC='01∑∫πβλΔαεσXY#@';
  let rain=[];
  function buildRain(){
    rain=[];
    const cols=Math.floor(W/(mob()?44:36));
    for(let i=0;i<cols;i++){
      if(Math.random()>.52) rain.push({
        x:i*(mob()?44:36)+17, y:Math.random()*-H,
        spd:.55+Math.random()*1.1,
        chars:Array.from({length:16},()=>MC[Math.floor(Math.random()*MC.length)]),
        timer:0,intv:4+Math.floor(Math.random()*8),
        al:.04+Math.random()*.07
      });
    }
  }
  function drawRain(so){
    rain.forEach(c=>{
      c.y+=c.spd; if(c.y>H+260)c.y=-180;
      c.timer++; if(c.timer>=c.intv){c.timer=0;c.chars[Math.floor(Math.random()*c.chars.length)]=MC[Math.floor(Math.random()*MC.length)];}
      const oy=c.y-so*.08;
      c.chars.forEach((ch,i)=>{
        const cy=oy-i*15;
        if(cy<-5||cy>H+5)return;
        const fade=1-i/c.chars.length;
        ctx.font=`700 10px "Space Mono",monospace`;
        ctx.fillStyle=TC(i===0?c.al*7*fade:c.al*2.5*fade);
        ctx.fillText(ch,c.x,cy);
      });
    });
  }

  /* ─ 5. GRID ─ */
  function drawGrid(so){
    const gs=52, off=(so*.05)%gs;
    ctx.strokeStyle=TC(.022);ctx.lineWidth=1;
    for(let x=0;x<W+gs;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=-gs;y<H+gs;y+=gs){ctx.beginPath();ctx.moveTo(0,y+off);ctx.lineTo(W,y+off);ctx.stroke();}
  }

  function init(){ buildNN();buildFloaters();buildClusters();buildRain(); }
  init();

  (function loop(){
    ctx.clearRect(0,0,W,H);
    const so=scrollY;
    drawGrid(so);drawRain(so);drawClusters(so);drawFloaters(so);drawNN(so);
    requestAnimationFrame(loop);
  })();
});


/* ══════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════ */
const cur=document.getElementById('cursor'),ring=document.getElementById('cursor-ring');
if(cur&&ring&&window.matchMedia('(hover:hover)').matches){
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function ar(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(ar);})();
  document.querySelectorAll('a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.style.width='14px';cur.style.height='14px';ring.style.width='48px';ring.style.height='48px';ring.style.opacity='.25';});
    el.addEventListener('mouseleave',()=>{cur.style.width='8px';cur.style.height='8px';ring.style.width='34px';ring.style.height='34px';ring.style.opacity='.45';});
  });
}


/* ══════════════════════════════════════════════════
   HAMBURGER
══════════════════════════════════════════════════ */
const tog=document.getElementById('navToggle'),mm=document.getElementById('mobileMenu');
tog.addEventListener('click',()=>{tog.classList.toggle('open');mm.classList.toggle('open');});
document.querySelectorAll('.mmlink').forEach(a=>a.addEventListener('click',()=>{tog.classList.remove('open');mm.classList.remove('open');}));


/* ══════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════ */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const idx=Array.from(e.target.parentElement.children).indexOf(e.target);
      e.target.style.transitionDelay=(idx*.07)+'s';
      e.target.classList.add('visible');
    }
  });
},{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
