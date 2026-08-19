import './styles.css';

const voices = [
  ['Natural Male','Male • Natural','', ''],
  ['Natural Female','Female • Natural','f',''],
  ['Deep Natural','Male • Deep','deep',''],
  ['Soft Natural','Female • Soft','f',''],
  ['Young Adult','Neutral • Young','',''],
  ['Mature Adult','Neutral • Mature','mature',''],
  ['Warm Resonance','Male • Warm','deep',''],
  ['Bright Resonance','Female • Bright','f','']
];
let selected = 0;

const voiceCard = (v,i) => `<button class="voice ${i===selected?'active':''}" data-voice="${i}"><div class="avatar ${v[2]}"></div><div class="voice-name">${v[0]}</div><div class="voice-meta"><span>${v[1]}</span><span class="voice-play">▶</span></div></button>`;

document.querySelector('#app').innerHTML = `
<div class="shell"><main class="app">
<header class="topbar"><div class="brand"><div class="brand-mark"><span></span></div><span>REAL<span class="brand-accent">VOICE</span></span></div><div class="top-actions"><button class="icon-btn" aria-label="Menu">☰</button><button class="crown" aria-label="Premium">♛</button></div></header>
<section class="hero">
  <div class="panel hero-copy"><span class="eyebrow">Voice Lab</span><h1>Change your voice.<br><span>Keep everything else.</span></h1><p>Natural voice transformation designed to preserve your delivery and the world around you. No cartoon effects. No fake-sounding filters.</p><div class="status"><span class="pill"><span class="dot"></span> Realistic voice engine</span><span class="pill">Background preserved</span></div></div>
  <div class="panel test-card"><div><div class="voice-orb"></div><div class="test-title"><strong id="selected-name">Natural Male</strong><small>● Ready to test</small></div></div><div class="wave" aria-hidden="true">${Array.from({length:30},(_,i)=>`<i style="--h:${10+(i%7)*5}px;animation-delay:${i*35}ms"></i>`).join('')}</div><button class="primary" id="test-btn">🎙 Test this voice</button></div>
</section>
<section class="panel section"><div class="section-head"><div><h2>Real Voices</h2><span class="muted">Built for natural conversation</span></div><button class="muted">See all →</button></div><div class="voices">${voices.map(voiceCard).join('')}</div></section>
<section class="lab-grid">
  <div class="panel controls"><div class="section-head"><div><h2>Adjust Voice</h2><span class="muted">Fine control without the robotic sound</span></div></div>
    ${[['Naturalness','85'],['Voice Change','72'],['Pitch','42'],['Resonance','64']].map(([n,v])=>`<label class="control"><div class="control-row"><span>${n}</span><span id="${n.replace(' ','-').toLowerCase()}-value">${v}%</span></div><input type="range" min="0" max="100" value="${v}" data-control="${n}"></label>`).join('')}
  </div>
  <div class="panel preserve"><div class="preserve-icon">✓</div><h3>Background preserved</h3><p>Our architecture keeps the original environment separate from the voice transformation, so room tone, traffic, music and ambient sound can remain natural.</p><span class="pill"><span class="dot"></span> Voice only</span><div class="share-row"><button class="share">WhatsApp</button><button class="share">Telegram</button><button class="share">More</button></div></div>
</section>
<nav class="nav"><button class="active"><span class="nav-icon">◉</span>Voices</button><button><span class="nav-icon">◉</span>Test</button><button><span class="nav-icon">◷</span>History</button></nav>
</main></div>`;

document.querySelectorAll('[data-voice]').forEach(btn=>btn.addEventListener('click',()=>{selected=Number(btn.dataset.voice);document.querySelectorAll('.voice').forEach(v=>v.classList.remove('active'));btn.classList.add('active');document.querySelector('#selected-name').textContent=voices[selected][0]}));
document.querySelectorAll('[data-control]').forEach(input=>input.addEventListener('input',()=>{const id=input.dataset.control.replace(' ','-').toLowerCase()+'-value';document.getElementById(id).textContent=`${input.value}%`}));
document.querySelector('#test-btn').addEventListener('click',()=>alert(`Test session ready for ${voices[selected][0]}. Audio engine will plug into this foundation.`));
