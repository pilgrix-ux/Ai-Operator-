import './styles.css';

const voices = [
  { name: 'Atlas', meta: 'Male · Deep natural', tone: 'atlas', description: 'Low, warm and grounded' },
  { name: 'Sora', meta: 'Female · Natural', tone: 'sora', description: 'Clear, calm and conversational' },
  { name: 'Milo', meta: 'Male · Young', tone: 'milo', description: 'Bright, relaxed and youthful' },
  { name: 'Naya', meta: 'Female · Warm', tone: 'naya', description: 'Warm, intimate and smooth' },
  { name: 'Rowan', meta: 'Neutral · Mature', tone: 'rowan', description: 'Confident and composed' },
  { name: 'Kai', meta: 'Male · Bright', tone: 'kai', description: 'Crisp with a lighter resonance' },
  { name: 'Amara', meta: 'Female · Rich', tone: 'amara', description: 'Rich, natural and expressive' },
  { name: 'Eli', meta: 'Male · Soft', tone: 'eli', description: 'Soft-spoken and close' }
];

let selected = 0;
let recorder = null;
let chunks = [];
let recordingUrl = null;
let lastBlob = null;
let timer = null;
let seconds = 0;

const icon = (name) => ({
  mic: '<svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="m9 5 10 7-10 7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5"/></svg>',
  chevron: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2-5.3"/><path d="M4 5v4h4M12 8v5l3 2"/></svg>',
  sliders: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
}[name]);

const voiceCard = (v, i) => `
<button class="voice ${i === selected ? 'active' : ''}" data-voice="${i}" aria-pressed="${i === selected}">
  <div class="avatar ${v.tone}"><span></span><i></i></div>
  <div class="voice-copy"><strong>${v.name}</strong><small>${v.meta}</small></div>
  <span class="voice-arrow">${icon('chevron')}</span>
</button>`;

document.querySelector('#app').innerHTML = `
<div class="shell">
  <main class="app">
    <header class="topbar">
      <button class="brand" id="brand-home" aria-label="RealVoice home">
        <span class="brand-mark">${icon('spark')}</span><span>REAL<span class="brand-accent">VOICE</span></span>
      </button>
      <div class="top-actions">
        <button class="ghost-btn" id="history-btn">${icon('history')}<span>History</span></button>
        <button class="pro-btn" id="pro-btn"><span>PRO</span><span class="pro-dot"></span></button>
        <button class="menu-btn" id="menu-btn" aria-label="Open menu">${icon('menu')}</button>
      </div>
    </header>

    <section class="hero">
      <div class="hero-copy">
        <div class="kicker"><span class="live-dot"></span> REALVOICE LAB</div>
        <h1>Sound like <em>you.</em><br>Just different.</h1>
        <p>Natural voice conversion built to change the speaker while keeping your timing, emotion and environment intact.</p>
        <div class="hero-badges"><span>${icon('check')} Voice only</span><span>${icon('check')} Original background</span><span>${icon('check')} Natural delivery</span></div>
      </div>
      <div class="test-stage">
        <div class="stage-glow"></div>
        <div class="orb-ring"><div class="orb"><span>${icon('mic')}</span></div></div>
        <div class="stage-label">SELECTED VOICE</div>
        <div class="selected-name" id="selected-name">${voices[selected].name}</div>
        <div class="selected-meta" id="selected-meta">${voices[selected].meta}</div>
        <div class="wave" id="wave" aria-hidden="true">${Array.from({length:32},(_,i)=>`<i style="--h:${8 + (i%8)*4}px"></i>`).join('')}</div>
        <button class="primary" id="test-btn"><span class="btn-icon">${icon('mic')}</span><span id="test-label">Test my voice</span><kbd>⌘ R</kbd></button>
        <div class="recording-status" id="recording-status">Mic test is private to this device.</div>
      </div>
    </section>

    <section class="section-head voices-head">
      <div><div class="eyebrow">VOICE LIBRARY</div><h2>Realistic voices</h2><p>Curated for natural conversation, not cartoon effects.</p></div>
      <button class="text-btn" id="all-voices">View all ${icon('chevron')}</button>
    </section>
    <section class="voices" id="voices">${voices.map(voiceCard).join('')}</section>

    <section class="lower-grid">
      <div class="control-panel">
        <div class="panel-head"><div><div class="eyebrow">VOICE LAB</div><h2>Shape the result</h2></div><button class="reset-btn" id="reset-btn">Reset</button></div>
        ${[['Naturalness',85,'Keep human texture'],['Voice change',72,'How different you sound'],['Pitch',48,'Subtle tonal shift'],['Resonance',64,'Chest / head resonance']].map(([n,v,h])=>`<label class="control"><div class="control-row"><div><strong>${n}</strong><small>${h}</small></div><output>${v}%</output></div><input type="range" min="0" max="100" value="${v}" data-control="${n}"><span class="range-fill" style="--value:${v}%"></span></label>`).join('')}
      </div>
      <aside class="preserve-card">
        <div class="preserve-top"><span class="secure-icon">${icon('check')}</span><span class="preserve-label">VOICE ONLY</span></div>
        <h2>Keep the world around you.</h2>
        <p>The target voice is transformed while the original room tone, traffic, music and ambience stay part of the recording.</p>
        <div class="signal"><span></span><div><b>Background</b><small>Preserved in the final mix</small></div><strong>ON</strong></div>
        <button class="outline-btn" id="import-btn">Import a recording <span>↗</span></button>
        <input id="file-input" type="file" accept="audio/*" hidden>
      </aside>
    </section>

    <section class="result-bar" id="result-bar" hidden>
      <div class="result-copy"><span class="result-icon">${icon('check')}</span><div><strong>Your recording is ready</strong><small id="result-name">Original audio</small></div></div>
      <div class="result-actions"><button class="small-btn" id="play-result">${icon('play')} Play</button><button class="small-btn primary-small" id="share-result">${icon('share')} Share</button></div>
      <audio id="audio" controls hidden></audio>
    </section>

    <nav class="bottom-nav">
      <button class="nav-item active" data-tab="voices">${icon('spark')}<span>Voices</span></button>
      <button class="nav-item" data-tab="test">${icon('mic')}<span>Test</span></button>
      <button class="nav-item" data-tab="history">${icon('history')}<span>History</span></button>
    </nav>
  </main>
</div>`;

const $ = (s) => document.querySelector(s);
const scrollToEl = (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function selectVoice(i) {
  selected = i;
  document.querySelectorAll('[data-voice]').forEach((b, index) => {
    b.classList.toggle('active', index === i);
    b.setAttribute('aria-pressed', String(index === i));
  });
  $('#selected-name').textContent = voices[i].name;
  $('#selected-meta').textContent = voices[i].meta;
  $('#recording-status').textContent = `${voices[i].description}. Ready to test.`;
}

document.querySelectorAll('[data-voice]').forEach((b) => b.addEventListener('click', () => selectVoice(Number(b.dataset.voice))));

document.querySelectorAll('[data-control]').forEach((input) => input.addEventListener('input', () => {
  input.parentElement.querySelector('output').textContent = `${input.value}%`;
  input.style.setProperty('--value', `${input.value}%`);
}));

$('#reset-btn').addEventListener('click', () => {
  const values = [85,72,48,64];
  document.querySelectorAll('[data-control]').forEach((input,i) => { input.value = values[i]; input.parentElement.querySelector('output').textContent = `${values[i]}%`; input.style.setProperty('--value', `${values[i]}%`); });
});

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    $('#recording-status').textContent = 'Microphone recording is not supported in this browser.';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
    recorder = new MediaRecorder(stream);
    chunks = [];
    seconds = 0;
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      lastBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
      recordingUrl = URL.createObjectURL(lastBlob);
      $('#audio').src = recordingUrl;
      $('#result-bar').hidden = false;
      $('#result-name').textContent = `${voices[selected].name} · original capture ready`;
      $('#recording-status').textContent = 'Capture complete. Preview or share the original test recording.';
      $('#test-label').textContent = 'Test my voice';
      $('.test-stage').classList.remove('recording');
      clearInterval(timer);
    };
    recorder.start();
    $('.test-stage').classList.add('recording');
    $('#test-label').textContent = 'Stop recording';
    $('#recording-status').textContent = 'Listening… 0:00';
    timer = setInterval(() => { seconds++; $('#recording-status').textContent = `Listening… 0:${String(seconds).padStart(2,'0')} · tap to finish`; if (seconds >= 10) stopRecording(); }, 1000);
  } catch (error) {
    $('#recording-status').textContent = error?.name === 'NotAllowedError' ? 'Microphone permission was denied. Allow mic access and try again.' : 'Could not open the microphone on this device.';
  }
}
function stopRecording() { if (recorder && recorder.state !== 'inactive') recorder.stop(); }
$('#test-btn').addEventListener('click', () => recorder?.state === 'recording' ? stopRecording() : startRecording());
$('#play-result').addEventListener('click', () => { const audio = $('#audio'); audio.paused ? audio.play() : audio.pause(); });
$('#share-result').addEventListener('click', async () => {
  if (!lastBlob) return;
  const file = new File([lastBlob], 'realvoice-test.webm', { type: lastBlob.type });
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) await navigator.share({ title: 'RealVoice recording', files: [file] });
    else { const a = document.createElement('a'); a.href = recordingUrl; a.download = 'realvoice-test.webm'; a.click(); }
  } catch (e) { if (e?.name !== 'AbortError') $('#recording-status').textContent = 'Sharing was not available. The recording is still saved in this session.'; }
});
$('#import-btn').addEventListener('click', () => $('#file-input').click());
$('#file-input').addEventListener('change', (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  lastBlob = file; if (recordingUrl) URL.revokeObjectURL(recordingUrl); recordingUrl = URL.createObjectURL(file); $('#audio').src = recordingUrl; $('#result-bar').hidden = false; $('#result-name').textContent = `${file.name} · imported`; $('#recording-status').textContent = 'Recording imported. Preview it before the conversion engine is connected.';
});
$('#all-voices').addEventListener('click', () => scrollToEl($('#voices')));
$('#brand-home').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
$('#history-btn').addEventListener('click', () => { $('#recording-status').textContent = 'History is ready for the conversion backend. Your current session appears in the result bar.'; scrollToEl($('#result-bar')); });
$('#pro-btn').addEventListener('click', () => alert('RealVoice Pro will unlock premium voice models and higher-quality conversion when the provider engine is connected.'));
$('#menu-btn').addEventListener('click', () => document.body.classList.toggle('menu-open'));
document.querySelectorAll('.nav-item').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active')); b.classList.add('active');
  if (b.dataset.tab === 'test') scrollToEl($('.test-stage'));
  if (b.dataset.tab === 'voices') scrollToEl($('#voices'));
  if (b.dataset.tab === 'history') scrollToEl($('#result-bar'));
}));
