// Audio context and sounds
let audioContext = null;

// Initialize audio context on user interaction
export const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Create a beep sound with given frequency and duration
const createBeep = (frequency, duration) => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.1; // Lower volume
  
  // Smooth fade out
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

// Play countdown beep
export const playCountdownBeep = () => {
  createBeep(880, 0.1); // Higher pitch, short duration
};

// Play capture sound
export const playCaptureSound = () => {
  createBeep(1760, 0.15); // Higher pitch, slightly longer
};

// Play completion sound
export const playCompleteSound = () => {
  if (!audioContext) return;
  
  // Play a sequence of beeps for completion
  setTimeout(() => createBeep(880, 0.1), 0);
  setTimeout(() => createBeep(1100, 0.1), 150);
  setTimeout(() => createBeep(1320, 0.15), 300);
};