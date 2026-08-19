const VOICES = [
  ['Atlas','Male · Deep natural','#C98F73','#201B20','#E9F0FF'],
  ['Sora','Female · Natural','#D4A38C','#2C2027','#F0E9FF'],
  ['Milo','Male · Young','#B77B62','#211D22','#E8F4FF'],
  ['Naya','Female · Warm','#C78D77','#33222A','#FFF0E6'],
  ['Rowan','Neutral · Mature','#B98270','#302628','#ECE8FF'],
  ['Kai','Male · Bright','#D2A58C','#1F2027','#E8F7F4'],
  ['Amara','Female · Rich','#A97062','#2A2026','#F3E8FF'],
  ['Eli','Male · Soft','#C18D78','#252126','#EAF0FF']
];

const state = {
  selected: Number(localStorage.getItem('rv:selectedVoice') || 0),
  recording: false,
  recorder: null,
  stream: null,
  chunks: [],
  blob: null,
  audioUrl: null,
  controls: { natural: 82, change: 58, pitch: 50, resonance: 64 }
};

const portrait = (i) => {
  const [name,,skin,hair,bg] = VOICES[i];
  const female = ['Sora','Naya','Amara'].includes(name);
  const hairPath = female
    ? `<path d="M52 78c-3-38 13-60 38-60 29 0 42 23 39 61l-8 40H58z" fill="${hair}"/><path d="M62 54c5-20 17-30 30-30 17 0 29 12 34 31-11-8-19-12-31-11-10 1-20 6-33 10z" fill="${hair}"/>`
    : `<path d="M51 61c2-29 17-45 39-45 25 0 38 17 39 46-12-8-22-15-38-14-15 1-25 6-40 13z" fill="${hair}"/>`;
  return `<svg viewBox="0 0 360 300" role="img" aria-label="${name} voice portrait" class="voice-portrait">
    <defs><linearGradient id="bg${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#fffaf6"/></linearGradient><linearGradient id="skin${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${skin}"/><stop offset="1" stop-color="#F0C1A8"/></linearGradient></defs>
    <rect width="360" height="300" rx="34" fill="url(#bg${i})"/>
    <circle cx="286" cy="54" r="70" fill="#fff" opacity=".42"/><circle cx="72" cy="258" r="90" fill="#fff" opacity=".22"/>
    <path d="M70 300c6-63 47-92 110-92s104 29 110 92" fill="#25242B"/>
    <rect x="82" y="73" width="196" height="148" rx="72" fill="url(#skin${i})"/>
    ${hairPath}
    <path d="M105 112c14-9 27-9 39-3M216 109c13-6 26-6 39 3" stroke="#3A2B2C" stroke-width="7" stroke-linecap="round" opacity=".65"/>
    <circle cx="129" cy="130" r="6" fill="#1C1B20"/><circle cx="231" cy="130" r="6" fill="#1C1B20"/>
    <path d="M172 138c-2 12-4 21-1 27" stroke="#A66F65" stroke-width="5" stroke-linecap="round" opacity=".65"/>
    <path d="M147 176c15 12 38 12 53 0" fill="none" stroke="#7A4547" stroke-width="6" stroke-linecap="round"/>
    <circle cx="180" cy="245" r="20" fill="#fff" opacity=".22"/>
  </svg>`;
};

const icons = {
  spark:`<svg viewBox="0 0 24 24"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>`,
  mic:`<svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>`,
  history:`<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2-5.3"/><path d="M4 5v4h4M12 8v5l3 2"/></svg>`,
  share:`<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.7 6.6-4M8.7 13.3l6.6 4"/></svg>`,
  upload:`<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>`,
  play:`<svg viewBox="0 0 24 24"><path d="m9 6 9 6-9 6z"/></svg>`,
  check:`<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back:`<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6M9 12h10"/></svg>`,
  trash:`<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>`,
  lock:`<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  sliders:`<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16M8 4v4M15 10v4M10 16v4"/></svg>`
};

const css = `
:root{--ink:#17151c;--muted:#77727f;--soft:#f7f3ee;--card:#fffdfa;--line:#e9e2da;--purple:#7251c9;--purple2:#9b75e8;--blue:#dfeaff;--green:#3f9b69;}
*{box-sizing:border-box}html,body,#app{margin:0;min-width:320px;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{background:#f8f5f0;color:var(--ink)}button,input{font:inherit}button{cursor:pointer}.rv-shell{min-height:100vh;background:radial-gradient(900px 500px at 85% -10%,#e7ddff 0,transparent 60%),radial-gradient(700px 500px at 0 45%,#e4f2ff 0,transparent 58%),linear-gradient(135deg,#fbf9f6,#f6f1ea);color:var(--ink)}.rv-wrap{width:min(1180px,100%);margin:auto;padding:26px 28px 116px}.rv-top{height:52px;display:flex;align-items:center;justify-content:space-between;margin-bottom:34px}.rv-brand{display:flex;align-items:center;gap:11px;border:0;background:none;font-weight:900;letter-spacing:-.045em;font-size:20px;color:var(--ink)}.rv-mark{width:38px;height:38px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(145deg,#8e68df,#6242b9);box-shadow:0 10px 28px #7251c933}.rv-mark svg{width:20px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.rv-top-right{display:flex;gap:9px;align-items:center}.rv-top-btn{height:40px;padding:0 14px;border:1px solid #ded6ce;background:#ffffffa8;border-radius:13px;color:#655f6b;font-size:11px;font-weight:750;backdrop-filter:blur(12px)}.rv-top-btn:hover{background:#fff}.rv-pro{height:40px;padding:0 14px;border-radius:13px;border:1px solid #d7c8f1;background:#f3edff;color:#6644af;font-size:10px;font-weight:900;letter-spacing:.12em}.rv-hero{display:grid;grid-template-columns:1.05fr .95fr;min-height:500px;border:1px solid #e7dfd8;border-radius:34px;overflow:hidden;background:#fffdf9;box-shadow:0 28px 90px #4b37620d}.rv-copy{padding:62px;display:flex;flex-direction:column;justify-content:center}.rv-kicker{font-size:10px;font-weight:900;letter-spacing:.2em;color:#7656b8;display:flex;gap:8px;align-items:center}.rv-kicker i{width:7px;height:7px;border-radius:50%;background:#55b97c;box-shadow:0 0 10px #55b97c66}.rv-copy h1{font-size:clamp(48px,6.5vw,82px);line-height:.93;letter-spacing:-.075em;margin:17px 0 22px}.rv-copy h1 em{font-style:italic;color:#7251c9}.rv-copy p{max-width:590px;color:#77727f;font-size:16px;line-height:1.7;margin:0}.rv-pills{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.rv-pill{padding:9px 11px;border:1px solid #e7e0d8;background:#faf7f2;border-radius:999px;color:#696370;font-size:10px;font-weight:750}.rv-stage{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:34px;background:radial-gradient(circle at 50% 35%,#eee7ff 0,#f6f2f8 33%,#f8f5ef 72%);border-left:1px solid #ece5de}.rv-stage-glow{position:absolute;width:310px;height:310px;border-radius:50%;background:#a88be83b;filter:blur(35px)}.rv-stage-card{position:relative;width:min(350px,90%);padding:17px;border:1px solid #fff;border-radius:28px;background:#ffffffb8;backdrop-filter:blur(16px);box-shadow:0 25px 70px #5c3e7b14}.rv-stage-portrait{border-radius:20px;overflow:hidden;background:#eee9f7}.rv-stage-portrait svg{display:block;width:100%;height:auto}.rv-stage-meta{display:flex;align-items:end;justify-content:space-between;padding:16px 3px 2px}.rv-stage-meta strong{font-size:20px;letter-spacing:-.04em}.rv-stage-meta small{display:block;color:#817b87;font-size:10px;margin-top:5px}.rv-natural{padding:7px 9px;border-radius:999px;background:#edf8f1;color:#39845b;font-size:9px;font-weight:900}.rv-wave{height:42px;display:flex;align-items:center;justify-content:center;gap:4px;margin:12px 0}.rv-wave span{width:3px;height:var(--h);border-radius:5px;background:linear-gradient(#a17be8,#6f4cc2);opacity:.55}.rv-hero-cta{width:100%;height:48px;border:0;border-radius:14px;background:linear-gradient(105deg,#704bc7,#9670e2);color:#fff;font-weight:850;font-size:12px;box-shadow:0 14px 30px #7651c92b}.rv-hero-cta:hover{transform:translateY(-1px)}.rv-section{margin-top:42px}.rv-section-head{display:flex;justify-content:space-between;align-items:end;margin:0 2px 16px}.rv-section-head h2{font-size:24px;letter-spacing:-.05em;margin:4px 0}.rv-section-head p{margin:0;color:var(--muted);font-size:11px}.rv-link{border:0;background:none;color:#6f50ba;font-size:11px;font-weight:800}.rv-voices{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.rv-voice{position:relative;text-align:left;padding:8px;border:1px solid #e5ded6;background:#fffdf9;border-radius:22px;overflow:hidden;box-shadow:0 10px 35px #4d36520a;transition:.22s;color:var(--ink)}.rv-voice:hover{transform:translateY(-4px);box-shadow:0 20px 50px #4d36521a}.rv-voice.active{border-color:#9b7bda;box-shadow:0 18px 50px #7251c921}.rv-portrait{border-radius:17px;overflow:hidden;background:#f0edf5}.rv-portrait svg{display:block;width:100%;height:auto}.rv-voice-copy{padding:12px 5px 8px}.rv-voice-name{display:flex;align-items:center;justify-content:space-between}.rv-voice-name strong{font-size:14px}.rv-check{width:21px;height:21px;border-radius:50%;display:grid;place-items:center;background:#f0eaff;color:#7251c9}.rv-check svg{width:12px;stroke:currentColor;fill:none;stroke-width:2.4}.rv-voice-copy small{display:block;color:#7e7884;font-size:10px;margin-top:5px}.rv-tag{display:inline-block;margin-top:9px;padding:5px 7px;border-radius:999px;background:#f5f0fb;color:#7655bb;font-size:8px;font-weight:900;letter-spacing:.08em}.rv-bottom{position:fixed;z-index:40;bottom:16px;left:50%;transform:translateX(-50%);width:min(470px,calc(100% - 28px));display:flex;justify-content:space-around;padding:7px;background:#fffdf9ed;border:1px solid #e2dbd4;border-radius:23px;box-shadow:0 20px 65px #3e2d511c;backdrop-filter:blur(20px)}.rv-bottom button{flex:1;border:0;background:transparent;color:#8a8490;border-radius:16px;padding:9px 12px;font-size:10px;font-weight:700}.rv-bottom button.active{background:#eee7fb;color:#6848b5;font-weight:900}.rv-bottom svg{display:block;width:18px;height:18px;margin:0 auto 4px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.rv-page-title{max-width:1050px;margin:0 auto 25px}.rv-back{border:0;background:none;color:#716b77;font-size:11px;font-weight:800;padding:0;margin-bottom:18px;display:flex;align-items:center;gap:5px}.rv-back svg{width:14px}.rv-page-title h1{font-size:clamp(44px,7vw,72px);line-height:.95;letter-spacing:-.07em;margin:8px 0 18px}.rv-page-title h1 em{font-style:italic;color:#7251c9}.rv-page-title p{color:var(--muted);max-width:650px;line-height:1.7;font-size:14px}.rv-test-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:16px;max-width:1050px;margin:auto}.rv-panel{border:1px solid #e5ded6;background:#fffdf9;border-radius:28px;padding:26px;box-shadow:0 18px 60px #4d36520b}.rv-record{min-height:520px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.rv-record-avatar{width:160px;height:160px;border-radius:50%;overflow:hidden;background:#eee8f7;border:10px solid #f7f2fc;box-shadow:0 0 0 1px #dacbed,0 25px 60px #7651c928;margin-bottom:24px}.rv-record-avatar svg{width:100%;height:100%}.rv-record h2{font-size:28px;letter-spacing:-.05em;margin:5px 0}.rv-record p{color:var(--muted);font-size:11px}.rv-record-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-top:19px}.rv-primary,.rv-secondary{height:47px;padding:0 20px;border-radius:14px;font-size:11px;font-weight:850}.rv-primary{border:0;background:linear-gradient(105deg,#704bc7,#9670e2);color:#fff;box-shadow:0 13px 30px #7651c92b}.rv-secondary{border:1px solid #ddd6ce;background:#fff;color:#655f69}.rv-primary:hover,.rv-secondary:hover{transform:translateY(-1px)}.rv-status{min-height:18px;color:#817b87;font-size:10px;margin:15px 0}.rv-audio{width:min(100%,470px);margin-top:6px}.rv-controls h2{font-size:22px;letter-spacing:-.04em;margin:2px 0 5px}.rv-controls>p{font-size:11px;color:var(--muted);line-height:1.7}.rv-control{margin-top:22px}.rv-control-top{display:flex;justify-content:space-between;align-items:end;margin-bottom:9px}.rv-control-top div{display:flex;flex-direction:column;gap:3px}.rv-control-top strong{font-size:11px}.rv-control-top small{font-size:9px;color:#8b8590}.rv-control-top output{font-size:10px;color:#7251c9;font-weight:800}.rv-range{width:100%;appearance:none;height:5px;border-radius:9px;background:linear-gradient(90deg,#8d69d5 var(--pct),#e7e1db var(--pct));outline:none}.rv-range::-webkit-slider-thumb{appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid #8060ce;box-shadow:0 2px 8px #7251c933}.rv-range::-moz-range-thumb{width:10px;height:10px;border-radius:50%;background:#fff;border:3px solid #8060ce}.rv-promise{max-width:1050px;margin:16px auto 0;padding:22px 24px;border-radius:24px;border:1px solid #dce9df;background:linear-gradient(135deg,#f7fff9,#f0f9f4);display:flex;align-items:center;gap:14px}.rv-lock{width:40px;height:40px;border-radius:12px;background:#e4f5e9;color:#3e9863;display:grid;place-items:center;flex:none}.rv-lock svg{width:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.rv-promise strong{font-size:12px}.rv-promise p{margin:4px 0 0;color:#6f7d73;font-size:10px;line-height:1.5}.rv-history{max-width:1050px;margin:auto}.rv-history-panel{border:1px solid #e5ded6;background:#fffdf9;border-radius:28px;padding:22px;box-shadow:0 18px 60px #4d36520b}.rv-history-row{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid #eee8e1}.rv-history-row:last-child{border-bottom:0}.rv-history-icon{width:42px;height:42px;border-radius:13px;background:#f0eafb;color:#7251c9;display:grid;place-items:center}.rv-history-icon svg{width:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.rv-history-copy{flex:1}.rv-history-copy strong{font-size:12px}.rv-history-copy small{display:block;color:#88818c;font-size:9px;margin-top:4px}.rv-empty{text-align:center;padding:70px 15px;color:var(--muted)}.rv-empty h2{color:var(--ink);letter-spacing:-.04em}.rv-empty p{font-size:11px;line-height:1.7}.rv-danger{border:1px solid #eadfdf;background:#fff;color:#9b6666;border-radius:12px;padding:9px 12px;font-size:10px;font-weight:800}.rv-toast{position:fixed;z-index:100;left:50%;bottom:95px;transform:translateX(-50%) translateY(15px);padding:11px 15px;border-radius:13px;background:#1e1b24;color:#fff;font-size:10px;opacity:0;pointer-events:none;transition:.2s;box-shadow:0 15px 40px #20182733}.rv-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:900px){.rv-wrap{padding:18px 14px 112px}.rv-hero{grid-template-columns:1fr}.rv-copy{padding:42px 28px}.rv-stage{border-left:0;border-top:1px solid #ece5de;padding:25px;min-height:470px}.rv-voices{grid-template-columns:repeat(2,1fr)}.rv-test-grid{grid-template-columns:1fr}.rv-record{min-height:450px}}
@media(max-width:480px){.rv-top{margin-bottom:20px}.rv-top-btn{display:none}.rv-copy h1{font-size:50px}.rv-copy{padding:34px 20px}.rv-copy p{font-size:14px}.rv-stage-card{width:100%}.rv-section{margin-top:32px}.rv-voices{gap:9px}.rv-voice{border-radius:18px}.rv-portrait{border-radius:14px}.rv-page-title h1{font-size:48px}.rv-panel{padding:18px;border-radius:22px}.rv-promise{align-items:flex-start}.rv-bottom button{padding:9px 6px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

const waves = Array.from({length:24},(_,i)=>`<span style="--h:${10+(i%7)*4}px"></span>`).join('');
const path = () => location.pathname === '/' ? '/voices' : location.pathname;
const go = (to) => { history.pushState({},'',to); render(); window.scrollTo({top:0,behavior:'smooth'}); };
const voice = () => VOICES[state.selected];

function nav(active){
  return `<nav class="rv-bottom">
    <button class="${active==='voices'?'active':''}" data-go="/voices">${icons.spark}Voices</button>
    <button class="${active==='test'?'active':''}" data-go="/test">${icons.mic}Test</button>
    <button class="${active==='history'?'active':''}" data-go="/history">${icons.history}History</button>
  </nav>`;
}
function top(){return `<header class="rv-top"><button class="rv-brand" data-go="/voices"><span class="rv-mark">${icons.spark}</span><span>Real<span style="color:#7653bd">Voice</span></span></button><div class="rv-top-right"><button class="rv-top-btn" data-go="/history">History</button><button class="rv-pro">REALVOICE LAB</button></div></header>`;}

function voicesPage(){
  return `<div class="rv-shell"><main class="rv-wrap">${top()}
    <section class="rv-hero">
      <div class="rv-copy"><div class="rv-kicker"><i></i> REAL VOICE TECHNOLOGY</div><h1>Choose a voice<br><em>that feels human.</em></h1><p>Meet the voice library built around natural conversation. Pick a target, test your own microphone and keep the character of the original performance.</p><div class="rv-pills"><span class="rv-pill">Natural target voices</span><span class="rv-pill">Private microphone test</span><span class="rv-pill">Background preserved</span></div></div>
      <div class="rv-stage"><div class="rv-stage-glow"></div><div class="rv-stage-card"><div class="rv-stage-portrait">${portrait(state.selected)}</div><div class="rv-stage-meta"><div><strong>${voice()[0]}</strong><small>${voice()[1]}</small></div><span class="rv-natural">NATURAL</span></div><div class="rv-wave">${waves}</div><button class="rv-hero-cta" data-go="/test">Test ${voice()[0]} →</button></div></div>
    </section>
    <section class="rv-section"><div class="rv-section-head"><div><div class="rv-kicker">VOICE LIBRARY</div><h2>Realistic targets</h2><p>${VOICES.length} curated directions · select one to continue</p></div><button class="rv-link" data-go="/test">Open Test ${icons.arrow}</button></div><div class="rv-voices">${VOICES.map((v,i)=>`<button class="rv-voice ${i===state.selected?'active':''}" data-voice="${i}"><div class="rv-portrait">${portrait(i)}</div><div class="rv-voice-copy"><div class="rv-voice-name"><strong>${v[0]}</strong>${i===state.selected?`<span class="rv-check">${icons.check}</span>`:''}</div><small>${v[1]}</small><span class="rv-tag">NATURAL TARGET</span></div></button>`).join('')}</div></section>
  </main>${nav('voices')}</div>`;
}

function testPage(){
  return `<div class="rv-shell"><main class="rv-wrap">${top()}<div class="rv-page-title"><button class="rv-back" data-go="/voices">${icons.back} Voice library</button><div class="rv-kicker">TEST STUDIO · PRIVATE ON DEVICE</div><h1>Test <em>${voice()[0]}</em>.</h1><p>Record a short sample, listen back and share it when you're ready. The conversion engine will plug into this exact workflow without changing the experience.</p></div>
  <div class="rv-test-grid"><section class="rv-panel rv-record"><div class="rv-record-avatar">${portrait(state.selected)}</div><div class="rv-kicker">TARGET VOICE</div><h2>${voice()[0]}</h2><p>${voice()[1]}</p><div class="rv-record-actions"><button class="rv-primary" id="record-btn">${icons.mic}<span>${state.recording?'Stop recording':'Start recording'}</span></button><button class="rv-secondary" id="import-btn">${icons.upload}<span>Import audio</span></button></div><div id="rv-status" class="rv-status">Microphone audio stays on this device until you choose to share it.</div><audio id="rv-audio" class="rv-audio" controls ${state.audioUrl?'':'style="display:none"'} src="${state.audioUrl||''}"></audio><div class="rv-record-actions" id="share-actions" ${state.blob?'':'style="display:none"'}><button class="rv-secondary" id="share-btn">${icons.share}<span>Share audio</span></button><button class="rv-secondary" id="download-btn">${icons.arrow}<span>Save audio</span></button></div><input id="rv-file" type="file" accept="audio/*" hidden></section>
  <aside class="rv-panel rv-controls"><div class="rv-kicker">VOICE DIRECTION</div><h2>Make it yours.</h2><p>These controls are the foundation for the natural conversion engine. They are saved locally so your test setup stays consistent.</p>${control('natural','Naturalness','How lifelike the target should feel.')}${control('change','Voice change','How far the target identity moves.')}${control('pitch','Pitch','Subtle tonal direction, not a cartoon effect.')}${control('resonance','Resonance','Shape the body and depth of the voice.')}<button class="rv-secondary" id="reset-controls" style="width:100%;margin-top:12px">${icons.sliders}<span>Reset controls</span></button></aside></div>
  <div class="rv-promise"> <span class="rv-lock">${icons.lock}</span><div><strong>Background preserved by design.</strong><p>Our planned processing isolates the speaker for conversion and recombines the transformed voice with the original room, traffic, music and environmental sound.</p></div></div>
  </main>${nav('test')}<div class="rv-toast" id="toast"></div></div>`;
}
function control(key,label,desc){const value=state.controls[key];return `<label class="rv-control"><div class="rv-control-top"><div><strong>${label}</strong><small>${desc}</small></div><output id="out-${key}">${value}%</output></div><input class="rv-range" id="range-${key}" data-control="${key}" type="range" min="0" max="100" value="${value}" style="--pct:${value}%"></label>`}

function historyPage(){
  const h = JSON.parse(localStorage.getItem('rv:history')||'[]');
  return `<div class="rv-shell"><main class="rv-wrap">${top()}<div class="rv-page-title"><div class="rv-kicker">YOUR LIBRARY</div><h1>History<em>.</em></h1><p>Everything you test stays local until you decide to share it. Your recent sessions appear here.</p></div><section class="rv-history"><div class="rv-history-panel"><div class="rv-section-head" style="margin:0"><div><h2>Recent tests</h2><p>${h.length} saved session${h.length===1?'':'s'}</p></div>${h.length?`<button class="rv-danger" id="clear-history">Clear history</button>`:''}</div>${h.length?h.map((x,i)=>`<div class="rv-history-row"><div class="rv-history-icon">${icons.mic}</div><div class="rv-history-copy"><strong>${x.name}</strong><small>${x.date} · ${x.type||'Microphone test'}</small></div>${x.hasAudio?`<button class="rv-secondary" data-history-play="${i}" style="height:34px;padding:0 12px">${icons.play} Play</button>`:''}</div>`).join(''):`<div class="rv-empty"><h2>Your library is empty.</h2><p>Choose a voice, run a private test and your session will appear here.</p><button class="rv-primary" data-go="/test">Start a test</button></div>`}</div></section></main>${nav('history')}<div class="rv-toast" id="toast"></div></div>`;
}

function toast(msg){const el=document.querySelector('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function addHistory(item){const h=JSON.parse(localStorage.getItem('rv:history')||'[]');h.unshift(item);localStorage.setItem('rv:history',JSON.stringify(h.slice(0,30)));}
function setControl(key,value){state.controls[key]=Number(value);localStorage.setItem('rv:controls',JSON.stringify(state.controls));}

async function stopRecording(){
  if(!state.recorder)return;
  state.recorder.stop();
}
async function startRecording(){
  const status=document.querySelector('#rv-status');
  try{
    state.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:false}});
    const preferred=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
    state.recorder=new MediaRecorder(state.stream,{mimeType:preferred});state.chunks=[];state.recording=true;renderTestBindings();
    state.recorder.ondataavailable=e=>{if(e.data.size)state.chunks.push(e.data)};
    state.recorder.onstop=()=>{state.recording=false;state.stream?.getTracks().forEach(t=>t.stop());const blob=new Blob(state.chunks,{type:state.recorder.mimeType||'audio/webm'});state.blob=blob;state.audioUrl=URL.createObjectURL(blob);addHistory({name:voice()[0],date:new Date().toLocaleString(),type:'Microphone test',hasAudio:true});render();};
    state.recorder.start();status.textContent='Listening… tap Stop when you are done.';setTimeout(()=>{if(state.recording)stopRecording()},15000);
  }catch(e){state.recording=false;renderTestBindings();if(status)status.textContent=e?.name==='NotAllowedError'?'Microphone permission was denied. Allow microphone access and try again.':'This browser could not open the microphone.';}
}
function renderTestBindings(){const btn=document.querySelector('#record-btn');if(btn)btn.querySelector('span').textContent=state.recording?'Stop recording':'Start recording'}
function bindTest(){
  document.querySelectorAll('[data-control]').forEach(input=>input.addEventListener('input',e=>{const key=e.target.dataset.control;setControl(key,e.target.value);e.target.style.setProperty('--pct',`${e.target.value}%`);document.querySelector(`#out-${key}`).textContent=`${e.target.value}%`}));
  document.querySelector('#reset-controls')?.addEventListener('click',()=>{state.controls={natural:82,change:58,pitch:50,resonance:64};localStorage.setItem('rv:controls',JSON.stringify(state.controls));render();});
  document.querySelector('#record-btn')?.addEventListener('click',()=>state.recording?stopRecording():startRecording());
  document.querySelector('#import-btn')?.addEventListener('click',()=>document.querySelector('#rv-file').click());
  document.querySelector('#rv-file')?.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;state.blob=file;state.audioUrl=URL.createObjectURL(file);addHistory({name:voice()[0],date:new Date().toLocaleString(),type:'Imported audio',hasAudio:true});render();toast('Audio imported successfully');});
  document.querySelector('#share-btn')?.addEventListener('click',async()=>{if(!state.blob)return;const file=new File([state.blob],`realvoice-${voice()[0].toLowerCase()}.webm`,{type:state.blob.type});try{if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({title:'RealVoice audio',files:[file]});}else{const a=document.createElement('a');a.href=state.audioUrl;a.download=file.name;a.click();toast('Audio saved to your device');}}catch(e){if(e.name!=='AbortError')toast('Sharing is not available on this device')}});
  document.querySelector('#download-btn')?.addEventListener('click',()=>{if(!state.audioUrl)return;const a=document.createElement('a');a.href=state.audioUrl;a.download=`realvoice-${voice()[0].toLowerCase()}.webm`;a.click();toast('Audio saved');});
}
function bindHistory(){document.querySelector('#clear-history')?.addEventListener('click',()=>{localStorage.removeItem('rv:history');render();});}
function bindCommon(){document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));document.querySelectorAll('[data-voice]').forEach(b=>b.addEventListener('click',()=>{state.selected=Number(b.dataset.voice);localStorage.setItem('rv:selectedVoice',String(state.selected));render();}));}
function render(){
  if(!location.pathname.startsWith('/')) history.replaceState({},'', '/voices');
  const p=path();
  document.querySelector('#app').innerHTML=p==='/test'?testPage():p==='/history'?historyPage():voicesPage();
  bindCommon();
  if(p==='/test')bindTest();
  if(p==='/history')bindHistory();
}
try{Object.assign(state.controls,JSON.parse(localStorage.getItem('rv:controls')||'{}'))}catch{}
window.addEventListener('popstate',render);render();
