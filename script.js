// ==========================================
// Farangizning Tug'ilgan Kuni - Interactive Scripts
// Akasi Boburdan samimiy tabrik
// ==========================================

// --- Background Balloons Generator ---
function createBalloons() {
  const container = document.getElementById('balloonContainer');
  if (!container) return;
  const colors = ['#ff70a6', '#ff9770', '#ffd670', '#e9ff70', '#70d6ff', '#b5838d', '#ff5e8e'];

  for (let i = 0; i < 15; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = `${Math.random() * 95}%`;
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = `${12 + Math.random() * 8}s`;
    balloon.style.animationDelay = `${Math.random() * 10}s`;
    balloon.style.transform = `scale(${0.7 + Math.random() * 0.5})`;
    container.appendChild(balloon);
  }
}

// --- Original & Synthesized Audio Player ---
class MusicBox {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timeoutId = null;
    this.audioElement = document.getElementById('bgAudio');
  }

  play() {
    if (this.audioElement) {
      this.audioElement.volume = 0.8;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.updateButtonUI(true);
        }).catch((err) => {
          console.log('Audio autoplay prevented or failed, using synth fallback:', err);
          this.playHappyBirthday();
          this.updateButtonUI(true);
        });
      }
    } else {
      this.playHappyBirthday();
      this.updateButtonUI(true);
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, time, duration) {
    if (!this.ctx || !this.isPlaying) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);

    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2, time);
    overGain.gain.setValueAtTime(0, time);
    overGain.gain.linearRampToValueAtTime(0.05, time + 0.03);
    overGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.6);

    overtone.connect(overGain);
    overGain.connect(this.ctx.destination);
    overtone.start(time);
    overtone.stop(time + duration);
  }

  playHappyBirthday() {
    this.initContext();
    this.isPlaying = true;

    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
    
    const melody = [
      [C4, 0.75], [C4, 0.25], [D4, 1.0], [C4, 1.0], [F4, 1.0], [E4, 2.0],
      [C4, 0.75], [C4, 0.25], [D4, 1.0], [C4, 1.0], [G4, 1.0], [F4, 2.0],
      [C4, 0.75], [C4, 0.25], [C5, 1.0], [A4, 1.0], [F4, 1.0], [E4, 1.0], [D4, 2.0],
      [A4, 0.75], [A4, 0.25], [A4, 1.0], [F4, 1.0], [G4, 1.0], [F4, 2.5]
    ];

    const beatLength = 0.55;
    let startTime = this.ctx.currentTime + 0.1;

    melody.forEach(([note, beats]) => {
      this.playTone(note, startTime, beats * beatLength * 0.9);
      startTime += beats * beatLength;
    });

    const totalDuration = (startTime - this.ctx.currentTime) * 1000;
    this.timeoutId = setTimeout(() => {
      if (this.isPlaying) {
        this.playHappyBirthday();
      }
    }, totalDuration + 1500);
  }

  toggle() {
    if (this.isPlaying) {
      if (this.audioElement && !this.audioElement.paused) {
        this.audioElement.pause();
      }
      this.isPlaying = false;
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.updateButtonUI(false);
    } else {
      this.play();
    }
  }

  updateButtonUI(active) {
    const btn = document.getElementById('musicToggleBtn');
    const icon = document.getElementById('musicIcon');
    const text = document.getElementById('musicStatusText');
    if (!btn) return;

    if (active) {
      btn.classList.add('bg-rose-500', 'text-white', 'shadow-rose-300');
      btn.classList.remove('bg-white/90', 'text-gray-700');
      if (icon) icon.className = 'fas fa-volume-up animate-pulse';
      if (text) text.textContent = "Musiqa: Yangramoqda 🎵";
    } else {
      btn.classList.remove('bg-rose-500', 'text-white', 'shadow-rose-300');
      btn.classList.add('bg-white/90', 'text-gray-700');
      if (icon) icon.className = 'fas fa-volume-mute';
      if (text) text.textContent = "Musiqani yoqish 🔇";
    }
  }
}

const musicPlayer = new MusicBox();


// --- Confetti Canvas System ---
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let animationId = null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

class ConfettiParticle {
  constructor(x, y, isExplosion = false) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || (isExplosion ? canvas.height / 2 : -20);
    this.size = Math.random() * 9 + 5;
    this.color = ['#ff5e8e', '#ffb703', '#8338ec', '#3a86ff', '#fb5607', '#06d6a0', '#ff006e'][Math.floor(Math.random() * 7)];
    
    if (isExplosion) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed - 4;
    } else {
      this.speedX = Math.random() * 4 - 2;
      this.speedY = Math.random() * 3 + 2;
    }

    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 8 - 4;
    this.shape = Math.random() > 0.4 ? 'rect' : 'circle';
    this.gravity = 0.15;
    this.decay = isExplosion ? 0.96 : 1;
    this.alpha = 1;
  }

  update() {
    this.speedY += this.gravity;
    this.speedX *= this.decay;
    this.speedY *= this.decay;
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.decay < 1) {
      this.alpha -= 0.008;
    }
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;

    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function launchConfetti(count = 90, x, y, explosion = false) {
  if (!canvas) return;
  for (let i = 0; i < count; i++) {
    particles.push(new ConfettiParticle(x, y, explosion));
  }
  if (!animationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].y > canvas.height + 30 || particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 0) {
    animationId = requestAnimationFrame(animateConfetti);
  } else {
    animationId = null;
  }
}

// --- Fireworks Canvas Blast ---
function triggerFireworks() {
  const blastCount = 5;
  for (let i = 0; i < blastCount; i++) {
    setTimeout(() => {
      const posX = Math.random() * (window.innerWidth * 0.7) + window.innerWidth * 0.15;
      const posY = Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.15;
      launchConfetti(80, posX, posY, true);
    }, i * 350);
  }
}

// --- Floating Hearts Rain ---
function rainHearts() {
  const heartEmojis = ['💖', '💕', '✨', '🌸', '💐', '🎂', '🥳', '🤍'];
  for (let i = 0; i < 24; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart text-2xl md:text-3xl';
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      heart.style.left = `${Math.random() * 90 + 5}%`;
      heart.style.bottom = '40px';
      heart.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
      document.body.appendChild(heart);

      setTimeout(() => heart.remove(), 4000);
    }, i * 100);
  }
}

// --- Floating Blue Hearts & Rose Rain ---
function rainBlueHearts() {
  const blueEmojis = ['💙', '💎', '✨', '🌹', '🦋', '⭐', '💫', '🤍'];
  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'floating-heart text-2xl md:text-4xl';
      heart.textContent = blueEmojis[Math.floor(Math.random() * blueEmojis.length)];
      heart.style.left = `${Math.random() * 90 + 5}%`;
      heart.style.bottom = '40px';
      heart.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
      document.body.appendChild(heart);

      setTimeout(() => heart.remove(), 4000);
    }, i * 90);
  }
  launchConfetti(80, window.innerWidth / 2, window.innerHeight * 0.5, true);
}


// --- Interactive Birthday Cake Logic ---
let candlesBlown = false;

function blowCandles() {
  const flames = document.querySelectorAll('.cake-flame');
  const wishBanner = document.getElementById('wishResultBanner');
  const actionBtn = document.getElementById('blowCandleBtn');

  if (!candlesBlown) {
    // Blow out!
    flames.forEach(flame => flame.classList.add('blown-out'));
    candlesBlown = true;
    
    // Launch celebratory effects
    launchConfetti(120, window.innerWidth / 2, window.innerHeight * 0.6, true);
    triggerFireworks();
    rainHearts();

    if (wishBanner) {
      wishBanner.classList.remove('hidden');
      wishBanner.classList.add('flex');
    }

    if (actionBtn) {
      actionBtn.innerHTML = '<i class="fas fa-redo-alt mr-2"></i> Qaytadan yoqish';
      actionBtn.classList.remove('from-rose-500', 'to-pink-500');
      actionBtn.classList.add('from-amber-500', 'to-orange-500');
    }
  } else {
    // Relight!
    flames.forEach(flame => flame.classList.remove('blown-out'));
    candlesBlown = false;

    if (wishBanner) {
      wishBanner.classList.add('hidden');
      wishBanner.classList.remove('flex');
    }

    if (actionBtn) {
      actionBtn.innerHTML = '✨ Barcha shamlarni o\'chirish';
      actionBtn.classList.remove('from-amber-500', 'to-orange-500');
      actionBtn.classList.add('from-rose-500', 'to-pink-500');
    }
  }
}

// --- Brother Bobur's Surprise Wishes Modal ---
const surpriseWishes = [
  {
    title: "Akang Boburdan qardoshlik tilagi 🌟",
    text: "Farangiz, 17 yoshing qutlug' bo'lsin! Hayotda har doim senga tog'dek suyanadigan, muvaffaqiyatlaringdan quvonadigan Bobur akang bor. Har bir qadaming omadli bo'lsin!"
  },
  {
    title: "17 Yosh va Katta Marralar 🚀",
    text: "16 yoshni ajoyib xotiralar bilan ortda qoldirib, yangi 17 yoshingni qarshi olding. O'qishlaringda va kelajakdagi barcha orzularingda doimo omad yor bo'lsin!"
  },
  {
    title: "Doimo kulib yur! 😊",
    text: "Sening quvnoqliging va samimiy xaraktering butun qarindoshlarimizga xush kayfiyat ulashadi. Yangi yoshingda ham yuzingdan tabassum aslo arimasin!"
  },
  {
    title: "Sog'lik va Zafarlar Tilagi 💫",
    text: "Farangiz, senga mustahkam sog'liq, qalb xotirjamligi va barcha boshlagan ishlaringda faqat va faqat zafarlar tilayman!"
  }
];

let wishIndex = 0;

function showSurpriseWish() {
  const modal = document.getElementById('surpriseWishModal');
  const titleEl = document.getElementById('modalWishTitle');
  const textEl = document.getElementById('modalWishText');

  const currentWish = surpriseWishes[wishIndex % surpriseWishes.length];
  wishIndex++;

  if (titleEl) titleEl.textContent = currentWish.title;
  if (textEl) textEl.textContent = currentWish.text;

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  launchConfetti(60, window.innerWidth / 2, window.innerHeight / 2, true);
}

function closeSurpriseWish() {
  const modal = document.getElementById('surpriseWishModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// --- Intro Gift Box Open Logic ---
function openGiftIntro() {
  const introModal = document.getElementById('introGiftModal');
  const giftBox = document.getElementById('giftBoxIcon');

  if (giftBox) {
    giftBox.classList.add('scale-150', 'rotate-12');
  }

  launchConfetti(150, window.innerWidth / 2, window.innerHeight / 2, true);
  rainHearts();

  // Play original music track
  musicPlayer.play();

  setTimeout(() => {
    if (introModal) {
      introModal.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      introModal.style.opacity = '0';
      introModal.style.transform = 'scale(1.1)';
      setTimeout(() => {
        introModal.style.display = 'none';
      }, 700);
    }
  }, 400);
}

// --- Lightbox Modal Logic ---
function openLightbox(src, caption) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  const cap = document.getElementById('lightboxCaption');

  if (img) img.src = src;
  if (cap) cap.textContent = caption || '';
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  createBalloons();

  // Gentle initial confetti
  setTimeout(() => {
    launchConfetti(40);
  }, 1000);
});

