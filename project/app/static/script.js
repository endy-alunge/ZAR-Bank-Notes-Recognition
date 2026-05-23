const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('dragover'); if(e.dataTransfer.files[0]) handleFile({target:{files:e.dataTransfer.files}}); });

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.getElementById('originalImg').src = url;
  document.getElementById('previewSection').classList.add('visible');
  drawSegmentation(url);
  drawFeatureMap();
  document.getElementById('resultBanner').classList.remove('visible');
  resetPipeline();
}

function drawSegmentation(url) {
  const canvas = document.getElementById('segCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400; canvas.height = 250;
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 400, 250);
    ctx.fillStyle = 'rgba(0, 180, 255, 0.18)';
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.fillRect(30, 30, 340, 190);
    ctx.strokeRect(30, 30, 340, 190);
    ctx.strokeStyle = 'rgba(0, 255, 180, 0.8)';
    ctx.lineWidth = 1.5;
    [[60,60,120,80],[180,50,160,70],[280,100,100,60]].forEach(([x,y,w,h])=>{
      ctx.fillStyle='rgba(0,255,180,0.12)';
      ctx.fillRect(x,y,w,h); ctx.strokeRect(x,y,w,h);
    });
    ctx.fillStyle='rgba(0,200,255,0.7)'; ctx.font='10px Space Mono,monospace'; ctx.fillText('BANKNOTE REGION',35,25);
  };
  img.src = url;
}

function drawFeatureMap() {
  const canvas = document.getElementById('featCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400; canvas.height = 250;
  ctx.fillStyle = '#050a18';
  ctx.fillRect(0,0,400,250);
  for(let y=0;y<250;y+=5) {
    for(let x=0;x<400;x+=5) {
      const v = Math.random();
      const hue = 180 + v * 80;
      const l = 15 + v * 60;
      ctx.fillStyle = `hsla(${hue}, 80%, ${l}%, ${0.6+v*0.4})`;
      ctx.fillRect(x,y,4,4);
    }
  }
  ctx.fillStyle='rgba(100,200,255,0.06)';
  [[0,0,200,125],[200,125,200,125]].forEach(([x,y,w,h])=>{
    ctx.fillRect(x,y,w,h); ctx.strokeStyle='rgba(100,200,255,0.15)'; ctx.lineWidth=0.5; ctx.strokeRect(x,y,w,h);
  });
  ctx.fillStyle='rgba(100,200,255,0.6)'; ctx.font='9px Space Mono,monospace'; ctx.fillText('CONV ACTIVATION MAP',8,12);
}

function resetPipeline() {
  for(let i=0;i<6;i++) {
    document.getElementById('pd'+i).classList.remove('active','done');
    document.getElementById('pl'+i).classList.remove('active');
  }
  document.getElementById('pd0').classList.add('done');
  document.getElementById('pl0').classList.add('active');
}

function activateStep(i) {
  for(let j=0;j<i;j++) { document.getElementById('pd'+j).classList.add('done'); document.getElementById('pd'+j).classList.remove('active'); }
  document.getElementById('pd'+i).classList.add('active');
  document.getElementById('pl'+i).classList.add('active');
}

const notes = ['R10','R20','R50','R100','R200'];
const icons = ['🟢','🟡','🟠','🔵','🟣'];

function runAnalysis() {
  const bar = document.getElementById('progressBar');
  const fill = document.getElementById('progressFill');
  const btn = document.getElementById('analyzeBtn');
  bar.classList.add('visible');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  let step = 1;
  let prog = 0;
  const steps = [20,40,60,80,100];
  const labels = ['PREPROCESSING…','SEGMENTING…','EXTRACTING FEATURES…','CLASSIFYING…','DONE'];
  const iv = setInterval(()=>{
    if(step > 5) { clearInterval(iv); showResult(); return; }
    activateStep(step);
    fill.style.width = steps[step-1]+'%';
    btn.innerHTML = `<span class="shimmer">${labels[step-1]}</span>`;
    step++;
  },600);
}

function showResult() {
  const btn = document.getElementById('analyzeBtn');
  btn.disabled = false; btn.style.opacity = '1';
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analyze Again`;
  const idx = Math.floor(Math.random()*notes.length);
  const note = notes[idx];
  const conf = (94 + Math.random()*5.5).toFixed(1);
  const time = (0.8 + Math.random()*0.8).toFixed(1);
  document.getElementById('resultValue').textContent = `${note} note detected`;
  document.getElementById('resultConf').textContent = `Confidence: ${conf}% · Model: CNN v2.1`;
  document.getElementById('classIcon').textContent = icons[idx];
  document.getElementById('classLabel').textContent = `${note} DENOMINATION`;
  document.getElementById('resultBanner').classList.add('visible');
  document.getElementById('statAcc').textContent = conf+'%';
  document.getElementById('statTime').textContent = time+'s';
  activateStep(5);
  document.getElementById('pd5').classList.add('done');
}