/* ═══════════════════════════════════════════════
   NEXUSAPP — script.js
   Loading → Onboarding → Dashboard logic
═══════════════════════════════════════════════ */

/* ════════════════════════════════════════════
   1. LOADING SCREEN
════════════════════════════════════════════ */
(function initLoader() {
  const percentEl = document.getElementById('percent-num');
  const ringFill  = document.getElementById('ring-fill');
  const CIRCUMFERENCE = 2 * Math.PI * 85; // ~534

  let current = 0;

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  const startTime = performance.now();
  const duration  = 3200;

  function tick(now) {
    const elapsed = Math.min(now - startTime, duration);
    const raw     = elapsed / duration;
    const eased   = easeInOutQuad(raw);
    const value   = Math.floor(eased * 100);

    if (value !== current) {
      current = value;
      percentEl.textContent = current;
      const offset = CIRCUMFERENCE - (current / 100) * CIRCUMFERENCE;
      ringFill.style.strokeDashoffset = offset;
    }

    if (elapsed < duration) {
      requestAnimationFrame(tick);
    } else {
      percentEl.textContent = 100;
      ringFill.style.strokeDashoffset = 0;
      setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        loader.classList.add('fade-out');
        loader.addEventListener('transitionend', () => {
          loader.classList.add('hidden');
          showOnboarding();
        }, { once: true });
      }, 600);
    }
  }

  requestAnimationFrame(tick);
})();


/* ════════════════════════════════════════════
   2. ONBOARDING
════════════════════════════════════════════ */
const state = { name: '', interests: [], goal: '' };

function showOnboarding() {
  document.getElementById('onboarding-screen').classList.remove('hidden');
}

// Step 1
document.getElementById('btn-step1').addEventListener('click', () => {
  const val = document.getElementById('name-input').value.trim();
  if (!val) { shakeInput(document.getElementById('name-input')); return; }
  state.name = val;
  goToStep(2);
});
document.getElementById('name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-step1').click();
});

// Step 2
document.querySelectorAll('.interest-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('selected'));
});
document.getElementById('btn-step2').addEventListener('click', () => {
  const selected = [...document.querySelectorAll('.interest-card.selected')].map(c => c.dataset.value);
  if (!selected.length) { pulseCards(); return; }
  state.interests = selected;
  goToStep(3);
});

// Step 3
document.querySelectorAll('.goal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.goal = btn.dataset.value;
  });
});
document.getElementById('btn-step3').addEventListener('click', () => {
  if (!state.goal) { pulseGoals(); return; }
  launchDashboard();
});

function goToStep(n) {
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
}
function shakeInput(el) {
  el.style.borderColor = '#ff6b9d';
  el.style.boxShadow = '0 0 0 3px rgba(255,107,157,0.2)';
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1200);
}
function pulseCards() {
  document.querySelectorAll('.interest-card').forEach(c => {
    c.style.borderColor = 'rgba(255,107,157,0.5)';
    setTimeout(() => { c.style.borderColor = ''; }, 800);
  });
}
function pulseGoals() {
  document.querySelectorAll('.goal-btn').forEach(b => {
    b.style.borderColor = 'rgba(255,107,157,0.5)';
    setTimeout(() => { b.style.borderColor = ''; }, 800);
  });
}


/* ════════════════════════════════════════════
   3. DASHBOARD
════════════════════════════════════════════ */
function launchDashboard() {
  document.getElementById('onboarding-screen').classList.add('hidden');
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  document.getElementById('dash-name').textContent = state.name;
  buildContent();
}

document.getElementById('btn-reset').addEventListener('click', () => location.reload());

function buildContent() {
  const main = document.getElementById('dash-main');
  const i = state.interests, g = state.goal;

  if (i.includes('game')) {
    main.innerHTML = buildGameSection();
    initSnakeGame();
  } else if (i.includes('tech')) {
    main.innerHTML = buildLessonSection();
    initLessonTabs();
  } else if (i.includes('art')) {
    main.innerHTML = buildArtSection();
    initArtCanvas();
  } else if (i.includes('biz') || g === 'inspire') {
    main.innerHTML = buildInspireSection();
  } else {
    main.innerHTML = buildGenericSection();
  }
}

/* ════════════════════════════════════════════
   CONTENT BUILDERS
════════════════════════════════════════════ */
function buildGenericSection() {
  const goalLabel = { learn: "O'rganish", fun: "O'yin-Kulgu", inspire: "Ilhomlanish" }[state.goal] || '';
  const icons = state.interests.map(i => ({ tech:'⚡', art:'🎨', biz:'💼', game:'🎮' }[i] || '✦')).join(' ');
  return '<div class="content-hero">' +
    '<div class="hero-emoji">' + icons + '</div>' +
    '<h1>Xush kelibsiz, <span class="highlight">' + state.name + '</span>!</h1>' +
    '<p>Maqsadingiz: <strong>' + goalLabel + '</strong>. Sizga maxsus kontent tayyorlanmoqda!</p>' +
    '</div><div class="cards-grid">' +
    card('🌟','Profil','NexusApp oilasiga xush kelibsiz. Kelajak sizniki!') +
    card('🔔','Bildirishnomalar','Yangi kontent va tadbirlar haqida birinchi bo\'lib xabardor bo\'ling.') +
    card('🎯','Maqsadlar','Kunlik maqsadlar belgilang va ularga erishing.') +
    '</div>';
}

function buildGameSection() {
  return '<div class="game-section">' +
    '<div class="game-title">🎮 Salom, <span class="highlight">' + state.name + '</span>!<br>Mini O\'yin: <span class="highlight">Snake</span></div>' +
    '<div class="game-wrap glass">' +
    '<canvas id="snake-canvas" width="360" height="360"></canvas>' +
    '<div class="game-stats">Ochko: <span id="score-val">0</span> &nbsp;|&nbsp; Rekord: <span id="high-val">0</span></div>' +
    '<div class="game-controls">⬆⬇⬅➡ — harakat &nbsp;|&nbsp; Mobil: pastdagi tugmalar</div>' +
    '<button class="btn-game" id="btn-start-game">▶ Boshlash</button>' +
    '<div class="mobile-dpad">' +
    '<button class="dpad-btn up" data-dir="UP">▲</button>' +
    '<button class="dpad-btn left" data-dir="LEFT">◀</button>' +
    '<button class="dpad-btn down" data-dir="DOWN">▼</button>' +
    '<button class="dpad-btn right" data-dir="RIGHT">▶</button>' +
    '</div></div></div>';
}

function buildLessonSection() {
  return '<div class="lesson-section">' +
    '<div class="lesson-header">' +
    '<h1>⚡ <span class="highlight">' + state.name + '</span>, IT Darsiga Xush Kelibsiz!</h1>' +
    '<p>Asosiy dasturlash tushunchalari bilan tanishing.</p></div>' +
    '<div class="lesson-tabs">' +
    '<button class="tab-btn active" data-tab="html">HTML</button>' +
    '<button class="tab-btn" data-tab="css">CSS</button>' +
    '<button class="tab-btn" data-tab="js">JavaScript</button>' +
    '<button class="tab-btn" data-tab="python">Python</button>' +
    '</div>' +
    '<div class="lesson-panel active" id="tab-html">' +
    '<div class="dash-card"><div class="dc-title">HTML nima?</div>' +
    '<div class="dc-desc">HTML (HyperText Markup Language) — veb-sahifalar tuzilmasini yaratish uchun ishlatiladigan belgilash tili. Brauzer HTML kodini o\'qib, vizual sahifa ko\'rsatadi.</div></div>' +
    '<pre class="code-block" data-lang="html">&lt;!DOCTYPE html&gt;\n&lt;html lang="uz"&gt;\n  &lt;head&gt;\n    &lt;title&gt;Mening sahifam&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Salom, Dunyo! 👋&lt;/h1&gt;\n    &lt;p&gt;Bu mening birinchi veb-sahifam.&lt;/p&gt;\n    &lt;button&gt;Bosing!&lt;/button&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</pre></div>' +
    '<div class="lesson-panel" id="tab-css">' +
    '<div class="dash-card"><div class="dc-title">CSS nima?</div>' +
    '<div class="dc-desc">CSS (Cascading Style Sheets) — HTML elementlarini bezash uchun ishlatiladi: ranglar, shriftlar, joylashuv va animatsiyalar.</div></div>' +
    '<pre class="code-block" data-lang="css">body {\n  background: #0d1120;\n  color: #e8eaf6;\n  font-family: \'DM Sans\', sans-serif;\n}\n\nh1 {\n  font-size: 2rem;\n  background: linear-gradient(135deg, #00f5ff, #bf5fff);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\nbutton {\n  padding: 12px 28px;\n  border-radius: 10px;\n  background: #00f5ff;\n  cursor: pointer;\n  transition: transform 0.2s;\n}\nbutton:hover { transform: translateY(-2px); }</pre></div>' +
    '<div class="lesson-panel" id="tab-js">' +
    '<div class="dash-card"><div class="dc-title">JavaScript nima?</div>' +
    '<div class="dc-desc">JavaScript — veb-sahifalarga interaktivlik qo\'shadigan dasturlash tili. Tugma bosilishi, animatsiyalar, ma\'lumot yuborish va boshqalar.</div></div>' +
    '<pre class="code-block" data-lang="js">const ism = "Azizbek";\nlet yosh = 20;\n\nfunction salomlash(nom) {\n  return `Salom, ${nom}! 👋`;\n}\n\nconst texnologiyalar = ["HTML", "CSS", "JS", "React"];\ntexnologiyalar.forEach(t =&gt; console.log(t));\n\ndocument.querySelector(\'button\')\n  .addEventListener(\'click\', () =&gt; {\n    alert(salomlash(ism));\n  });</pre></div>' +
    '<div class="lesson-panel" id="tab-python">' +
    '<div class="dash-card"><div class="dc-title">Python nima?</div>' +
    '<div class="dc-desc">Python — oddiy o\'qilishi bilan mashhur bo\'lgan universal dasturlash tili. Suniy intellekt, data science va veb-dasturlashda keng qo\'llaniladi.</div></div>' +
    '<pre class="code-block" data-lang="python">ism = "Azizbek"\nyosh = 20\n\ndef salomlash(nom):\n    return f"Salom, {nom}! 👋"\n\ntexnologiyalar = ["Python", "ML", "Django", "FastAPI"]\nfor t in texnologiyalar:\n    print(f"🔹 {t}")\n\nif yosh &gt;= 18:\n    print("Kattalar kursi!")\nelse:\n    print("O\'smirlar kursi!")</pre></div>' +
    '</div>';
}

function buildArtSection() {
  const colors = ['#00f5ff','#bf5fff','#ff6b9d','#ffd166','#06d6a0','#ffffff','#ff4444'];
  const swatches = colors.map(function(c) {
    return '<div class="color-swatch' + (c === '#00f5ff' ? ' active' : '') + '" style="background:' + c + '" data-color="' + c + '"></div>';
  }).join('');
  return '<div class="art-section">' +
    '<div class="art-title">🎨 <span class="highlight">' + state.name + '</span>, Ijod Qiling!</div>' +
    '<canvas id="art-canvas" width="500" height="400"></canvas>' +
    '<div class="art-tools">' + swatches + '</div>' +
    '<div class="art-actions">' +
    '<button class="btn-art" id="btn-clear-art">🗑 Tozalash</button>' +
    '<button class="btn-art" id="btn-brush-size">🖌 Qalamni o\'zgartirish</button>' +
    '</div>' +
    '<p style="color:var(--muted);font-size:0.8rem">Ekranda suring va chizing!</p>' +
    '</div>';
}

function buildInspireSection() {
  const tagColor = state.interests.includes('biz') ? '#ffd166' : 'var(--cyan)';
  const tag = state.interests.includes('biz') ? 'Biznes' : 'Ilhom';
  const quotes = [
    { q: '"Muvaffaqiyat - bu tushib ketmaslik emas, balki har safar turib olishdir."', a: '— Nelson Mandela' },
    { q: '"Eng yaxshi investitsiya - bu o\'z aqlga qilingan investitsiyadir."', a: '— Benjamin Franklin' },
    { q: '"Katta narsalarni amalga oshirish uchun, katta orzular bilan boshlang."', a: '— Steve Jobs' },
    { q: '"Qiyin yo\'llar ko\'pincha eng chiroyli manziллarga olib boradi."', a: '— Ezgu Maqol' },
  ];
  const cards = quotes.map(function(q, i) {
    return '<div class="quote-card" style="animation-delay:' + (i * 0.07) + 's">' +
      '<div class="qc-quote">' + q.q + '</div>' +
      '<div class="qc-author">' + q.a + '</div>' +
      '<span class="qc-tag" style="background:' + tagColor + '22;color:' + tagColor + '">' + tag + '</span>' +
      '</div>';
  }).join('');
  return '<div class="content-hero">' +
    '<div class="hero-emoji">✨</div>' +
    '<h1>Xush kelibsiz, <span class="highlight">' + state.name + '</span>!</h1>' +
    '<p>Bugungi kun uchun ilhom oling va yangi balandliklarga erishing.</p>' +
    '</div><div class="inspire-grid">' + cards + '</div>';
}

function card(icon, title, desc) {
  return '<div class="dash-card"><div class="dc-icon">' + icon + '</div><div class="dc-title">' + title + '</div><div class="dc-desc">' + desc + '</div></div>';
}


/* ════════════════════════════════════════════
   SNAKE GAME
════════════════════════════════════════════ */
function initSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const GRID = 18;
  const TILE = canvas.width / GRID;
  let snake, dir, nextDir, food, score, highScore, running, interval;

  highScore = parseInt(localStorage.getItem('nx_hs') || '0');
  document.getElementById('high-val').textContent = highScore;

  function reset() {
    snake = [{x:9,y:9},{x:8,y:9},{x:7,y:9}];
    dir = {x:1,y:0}; nextDir = {x:1,y:0};
    score = 0;
    document.getElementById('score-val').textContent = 0;
    placeFood();
  }

  function placeFood() {
    let pos;
    do { pos = {x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}; }
    while (snake.some(function(s){return s.x===pos.x&&s.y===pos.y;}));
    food = pos;
  }

  function step() {
    dir = {x:nextDir.x,y:nextDir.y};
    var head = {x:(snake[0].x+dir.x+GRID)%GRID, y:(snake[0].y+dir.y+GRID)%GRID};
    if (snake.some(function(s){return s.x===head.x&&s.y===head.y;})) { endGame(); return; }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      document.getElementById('score-val').textContent = score;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('nx_hs', highScore);
        document.getElementById('high-val').textContent = highScore;
      }
      placeFood();
    } else { snake.pop(); }
    draw();
  }

  function draw() {
    ctx.fillStyle='rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(255,255,255,0.03)';
    for (var x=0;x<GRID;x++) for (var y=0;y<GRID;y++)
      ctx.fillRect(x*TILE+TILE/2-1,y*TILE+TILE/2-1,2,2);

    var gf=ctx.createRadialGradient(food.x*TILE+TILE/2,food.y*TILE+TILE/2,1,food.x*TILE+TILE/2,food.y*TILE+TILE/2,TILE/2);
    gf.addColorStop(0,'#ff6b9d'); gf.addColorStop(1,'transparent');
    ctx.fillStyle=gf;
    ctx.beginPath();
    ctx.arc(food.x*TILE+TILE/2,food.y*TILE+TILE/2,TILE/2-1,0,Math.PI*2);
    ctx.fill();

    snake.forEach(function(seg,i) {
      var ratio=i/snake.length;
      ctx.fillStyle='rgba('+Math.round(ratio*50)+','+Math.round(245-ratio*100)+','+Math.round(255-ratio*80)+','+(1-ratio*0.5)+')';
      var pad=i===0?1:2;
      rrect(ctx,seg.x*TILE+pad,seg.y*TILE+pad,TILE-pad*2,TILE-pad*2,5);
      ctx.fill();
    });
  }

  function rrect(c,x,y,w,h,r) {
    c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arcTo(x+w,y,x+w,y+r,r);
    c.lineTo(x+w,y+h-r);c.arcTo(x+w,y+h,x+w-r,y+h,r);
    c.lineTo(x+r,y+h);c.arcTo(x,y+h,x,y+h-r,r);
    c.lineTo(x,y+r);c.arcTo(x,y,x+r,y,r);c.closePath();
  }

  function endGame() {
    clearInterval(interval); running=false;
    ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#ff6b9d';
    ctx.font='bold '+(TILE*1.5)+'px Syne,sans-serif';
    ctx.textAlign='center';
    ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-TILE);
    ctx.fillStyle='#e8eaf6';
    ctx.font=TILE+'px DM Sans,sans-serif';
    ctx.fillText('Ochko: '+score,canvas.width/2,canvas.height/2+TILE);
    document.getElementById('btn-start-game').textContent = '↺ Qayta o\'ynash';
  }

  function startGame() {
    if (running) return;
    reset(); running=true; clearInterval(interval);
    interval=setInterval(step,130);
    document.getElementById('btn-start-game').textContent='⏸ O\'yin davom etmoqda…';
  }

  document.getElementById('btn-start-game').addEventListener('click',startGame);

  document.addEventListener('keydown',function(e){
    var map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
             w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
    var d=map[e.key]; if(!d) return;
    e.preventDefault();
    if(d.x!==-dir.x||d.y!==-dir.y) nextDir=d;
  });

  document.querySelectorAll('.dpad-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var map={UP:{x:0,y:-1},DOWN:{x:0,y:1},LEFT:{x:-1,y:0},RIGHT:{x:1,y:0}};
      var d=map[btn.dataset.dir];
      if(d&&(d.x!==-dir.x||d.y!==-dir.y)) nextDir=d;
    });
  });

  reset(); draw();
}


/* ════════════════════════════════════════════
   LESSON TABS
════════════════════════════════════════════ */
function initLessonTabs() {
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
      document.querySelectorAll('.lesson-panel').forEach(function(p){p.classList.remove('active');});
      btn.classList.add('active');
      document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    });
  });
}


/* ════════════════════════════════════════════
   ART CANVAS
════════════════════════════════════════════ */
function initArtCanvas() {
  var canvas=document.getElementById('art-canvas');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');

  var maxW=Math.min(500,window.innerWidth-48);
  canvas.width=maxW; canvas.height=Math.round(maxW*0.75);
  ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);

  var painting=false, currentColor='#00f5ff', brushSize=6;
  var sizes=[3,6,12,20], sizeIdx=1;

  ctx.strokeStyle=currentColor; ctx.lineWidth=brushSize;
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.shadowColor=currentColor; ctx.shadowBlur=8;

  function getPos(e) {
    var rect=canvas.getBoundingClientRect();
    var sx=canvas.width/rect.width, sy=canvas.height/rect.height;
    var src=e.touches?e.touches[0]:e;
    return {x:(src.clientX-rect.left)*sx, y:(src.clientY-rect.top)*sy};
  }

  canvas.addEventListener('mousedown',function(e){painting=true;ctx.beginPath();var p=getPos(e);ctx.moveTo(p.x,p.y);});
  canvas.addEventListener('mousemove',function(e){if(!painting)return;var p=getPos(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  canvas.addEventListener('mouseup',function(){painting=false;});
  canvas.addEventListener('mouseleave',function(){painting=false;});
  canvas.addEventListener('touchstart',function(e){e.preventDefault();painting=true;ctx.beginPath();var p=getPos(e);ctx.moveTo(p.x,p.y);},{passive:false});
  canvas.addEventListener('touchmove',function(e){e.preventDefault();if(!painting)return;var p=getPos(e);ctx.lineTo(p.x,p.y);ctx.stroke();},{passive:false});
  canvas.addEventListener('touchend',function(){painting=false;});

  document.querySelectorAll('.color-swatch').forEach(function(sw){
    sw.addEventListener('click',function(){
      document.querySelectorAll('.color-swatch').forEach(function(s){s.classList.remove('active');});
      sw.classList.add('active');
      currentColor=sw.dataset.color;
      ctx.strokeStyle=currentColor;
      ctx.shadowColor=currentColor; ctx.shadowBlur=8;
    });
  });

  document.getElementById('btn-clear-art').addEventListener('click',function(){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
  });

  document.getElementById('btn-brush-size').addEventListener('click',function(){
    sizeIdx=(sizeIdx+1)%sizes.length;
    brushSize=sizes[sizeIdx];
    ctx.lineWidth=brushSize;
    this.textContent='🖌 Qalamni o\'zgartirish ('+brushSize+'px)';
  });
}
