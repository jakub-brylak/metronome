let isPlaying = false;
let bpm = 120;
let beatInterval;
let audioCtx;
let currentBeat = 0;
let beatsPerMeasure = 4;

const tempoInput = document.getElementById('tempo');
const tempoDisplay = document.getElementById('tempo-display');
const toggleBtn = document.getElementById('toggle-btn');
const timeSignatureSelect = document.getElementById('time-signature');
const beatIndicator = document.getElementById('beat-indicator');

// Update tempo display and logic
tempoInput.addEventListener('input', () => {
  bpm = parseInt(tempoInput.value, 10);
  tempoDisplay.textContent = bpm;
  if (isPlaying) {
    stopMetronome();
    startMetronome();
  }
});

// Update time signature
timeSignatureSelect.addEventListener('change', () => {
  beatsPerMeasure = parseInt(timeSignatureSelect.value, 10);
  currentBeat = 0;
});

// Toggle play/stop
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

  osc.type = 'square';
  osc.frequency.value = accent ? 1000 : 700;
  envelope.gain.setValueAtTime(1, audioCtx.currentTime);
  envelope.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  osc.connect(envelope);
  envelope.connect(audioCtx.destination);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

// --- Visual Indicator ---
function pulseIndicator(accent) {
  // Reset
  beatIndicator.classList.remove('bg-blue-500', 'bg-gray-400', 'scale-125', 'opacity-100');

  // Pulse effect
  beatIndicator.classList.add(
    accent ? 'bg-blue-500' : 'bg-gray-400',
    'scale-125',
    'opacity-100'
  );

  // Revert after short delay
  setTimeout(() => {
    beatIndicator.classList.remove('scale-125', 'opacity-100');
    beatIndicator.classList.add('opacity-30');
  }, 150);
}

// --- Start / Stop ---
function startMetronome() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const intervalMs = (60 / bpm) * 1000;

  beatInterval = setInterval(() => {
    const isAccent = currentBeat === 0;
    playClick(isAccent);
    pulseIndicator(isAccent);

    currentBeat = (currentBeat + 1) % beatsPerMeasure;
  }, intervalMs);

  toggleBtn.textContent = '⏹️ Stop';
  isPlaying = true;
}

function stopMetronome() {
  clearInterval(beatInterval);
  toggleBtn.textContent = '▶️ Play';
  isPlaying = false;
  currentBeat = 0;
}
