let isPlaying = false;
let bpm = 120;
let beatInterval;
let audioCtx = null;
let currentBeat = 0;
let beatsPerMeasure = 4;
let accentPattern = [true, false, false, false];
let accentButtons = [];

const tempoInput = document.getElementById('tempo');
const tempoDisplay = document.getElementById('tempo-display');
const toggleBtn = document.getElementById('toggle-btn');
const timeSignatureSelect = document.getElementById('time-signature');
const beatIndicator = document.getElementById('beat-indicator');
const accentControls = document.getElementById('accent-controls');

// --- Tempo Control ---
tempoInput.addEventListener('input', () => {
  bpm = parseInt(tempoInput.value, 10);
  tempoDisplay.textContent = bpm;

  if (isPlaying) {
    clearInterval(beatInterval);
    startBeatLoop();
  }
});

// --- Time Signature Change ---
timeSignatureSelect.addEventListener('change', () => {
  beatsPerMeasure = parseInt(timeSignatureSelect.value, 10);
  currentBeat = 0;
  updateAccentButtons();
});

// --- Play/Stop Toggle ---
toggleBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopMetronome();
  } else {
    startMetronome();
  }
});

// --- Audio Playback ---
function playClick(accent = false) {
    const osc = audioCtx.createOscillator();
    const envelope = audioCtx.createGain();

    osc.type = 'sine'; // smoother than square
    osc.frequency.value = accent ? 880 : 440; // A5 and A4 tones

    envelope.gain.setValueAtTime(0.3, audioCtx.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

    osc.connect(envelope);
    envelope.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.2);
}
  

// --- Visual Beat Indicator ---
function pulseIndicator(accent) {
  beatIndicator.classList.remove('bg-blue-500', 'bg-gray-400', 'scale-125', 'opacity-100');

  beatIndicator.classList.add(
    accent ? 'bg-blue-500' : 'bg-gray-400',
    'scale-125',
    'opacity-100'
  );

  setTimeout(() => {
    beatIndicator.classList.remove('scale-125', 'opacity-100');
    beatIndicator.classList.add('opacity-30');
  }, 150);
}

// --- Accent Button UI ---
function updateAccentButtons() {
  accentControls.innerHTML = '';
  accentPattern = [];
  accentButtons = [];

  for (let i = 0; i < beatsPerMeasure; i++) {
    const btn = document.createElement('button');
    btn.className = 'w-8 h-8 rounded-full text-sm flex items-center justify-center ' +
                    'border border-white transition ' +
                    (i === 0 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400');
    btn.textContent = i + 1;
    btn.dataset.index = i;

    accentPattern[i] = i === 0;

    btn.addEventListener('click', () => {
      accentPattern[i] = !accentPattern[i];
      btn.classList.toggle('bg-blue-500');
      btn.classList.toggle('text-white');
      btn.classList.toggle('bg-gray-800');
      btn.classList.toggle('text-gray-400');
    });

    accentControls.appendChild(btn);
    accentButtons.push(btn);
  }
}

// --- Beat Loop ---
function startBeatLoop() {
  const intervalMs = (60 / bpm) * 1000;

  beatInterval = setInterval(() => {
    const isAccent = accentPattern[currentBeat];

    playClick(isAccent);
    pulseIndicator(isAccent);

    // Live button highlight
    accentButtons.forEach((btn, i) => {
      btn.classList.remove('ring-2', 'ring-blue-500', 'scale-110');
      if (i === currentBeat) {
        btn.classList.add('ring-2', 'ring-blue-500', 'scale-110');
      }
    });

    currentBeat = (currentBeat + 1) % beatsPerMeasure;
  }, intervalMs);
}

// --- Start / Stop ---
function startMetronome() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  startBeatLoop();

  toggleBtn.textContent = '⏹️ Stop';
  isPlaying = true;
}

function stopMetronome() {
  clearInterval(beatInterval);
  toggleBtn.textContent = '▶️ Play';
  isPlaying = false;
  currentBeat = 0;

  // Remove button highlights
  accentButtons.forEach(btn => {
    btn.classList.remove('ring-2', 'ring-blue-500', 'scale-110');
  });
}

// --- Initial Setup ---
updateAccentButtons();
