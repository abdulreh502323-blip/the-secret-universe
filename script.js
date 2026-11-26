// Keep this URL unchanged: it is the Google Apps Script endpoint already configured for your Sheet.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwETiOsy--lGgkXSAdeA4Q1esYBeQB_qVac7oPDAq3huGDpYt4nJ-w2vPPbcuQyCqMI/exec";

const scenes = [...document.querySelectorAll(".scene")];
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const floatLayer = document.getElementById("floatLayer");
let currentScene = 0;
let musicOn = false;
let audioContext = null;
let musicTimer = null;
let submitted = false;
let giftOpened = false;

const progressNames = [
  "A surprise is waiting", "Entering the dream world", "Mini-game 1 of 3",
  "Mini-game 2 of 3", "Mini-game 3 of 3", "A little surprise",
  "A message from the heart", "The final question", "Thank you"
];

function showScene(index) {
  currentScene = index;
  scenes.forEach((scene, i) => scene.classList.toggle("active", i === index));
  progressBar.style.width = `${Math.max(8, (index + 1) / scenes.length * 100)}%`;
  progressLabel.textContent = progressNames[index];
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.getElementById("beginBtn").addEventListener("click", () => {
  startMusic();
  showScene(1);
});
document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => showScene(Number(button.dataset.next)));
});

const gameReplies = {
  cupcake: {
    detective: "Chief Cupcake Detective unlocked. Your first clue: the crumbs are suspicious. 🕵️",
    suspect: "Excellent interviewing skills. Everyone is now under a very polite investigation. 👀",
    bake: "A practical genius! The case is solved by creating more cupcakes. 🧁",
    dramatic: "A powerful speech has been delivered. The cupcake community will remember this. 🎭"
  },
  penguin: {
    tea: "The penguin accepts. It rates your hospitality 10/10 and requests tiny biscuits. ☕",
    dance: "The penguin wins the dance-off. Years of ice practice have paid off. 🕺",
    interview: "Breaking news: the penguin is mysterious, polite and very committed to its scarf. 🎤",
    map: "Good thinking! The penguin was looking for the fish market. Mystery solved. 🗺️"
  }
};
document.querySelectorAll(".game-choice").forEach(button => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;
    const choice = button.dataset.choice;
    document.querySelectorAll(`.game-choice[data-game="${game}"]`).forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    document.getElementById(`${game}Feedback`).textContent = gameReplies[game][choice];
    document.getElementById(`${game}Next`).classList.remove("hidden");
    sprinkle(18);
  });
});

const colourMessages = {
  pink: "Pink picked! Your day has officially been upgraded with extra sweetness. 🌸",
  purple: "Lavender picked! A little mystery and a lot of imagination. 🪻",
  peach: "Peach picked! Warm, sunny and full of good-energy vibes. 🍑",
  mint: "Mint picked! Fresh, calm and quietly magical. 🍃"
};
document.querySelectorAll(".colour-choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".colour-choice").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    document.getElementById("colourFeedback").textContent = colourMessages[button.dataset.colour];
    document.getElementById("colourNext").classList.remove("hidden");
    sprinkle(22);
  });
});

document.getElementById("openGift").addEventListener("click", () => {
  if (giftOpened) return;
  giftOpened = true;
  document.getElementById("giftIcon").textContent = "💝";
  document.getElementById("giftIcon").classList.add("open");
  document.getElementById("giftFeedback").textContent =
    "Surprise! The best little gifts are thoughtful moments, kind words and reasons to smile. Hope this one made you smile. 💗";
  document.getElementById("giftNext").classList.remove("hidden");
  sprinkle(35);
});

// Soft original ambient notes using Web Audio. Starts only after the visitor presses the invitation.
function playNote(freq, start, duration, volume = 0.012) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.start(start); osc.stop(start + duration + 0.04);
}
function startMusic() {
  if (musicOn) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    musicOn = true;
    const chords = [[261.63,329.63,392],[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66]];
    let bar = 0;
    const playBar = () => {
      if (!musicOn) return;
      const now = audioContext.currentTime + 0.04;
      chords[bar % chords.length].forEach((n, i) => playNote(n, now + i * .035, 3.1, .0055));
      const melody = [523.25,587.33,659.25,587.33,493.88,440,392,440];
      [0,1,2,3].forEach(i => playNote(melody[(bar * 2 + i) % melody.length], now + .35 + i * .68, .85, .009));
      bar++;
    };
    playBar();
    musicTimer = setInterval(playBar, 3300);
    document.getElementById("musicToggle").textContent = "♫ Music on";
    document.getElementById("musicToggle").setAttribute("aria-pressed","true");
  } catch (err) {
    document.getElementById("musicToggle").textContent = "♫ Music unavailable";
  }
}
function stopMusic() {
  musicOn = false;
  clearInterval(musicTimer);
  musicTimer = null;
  if (audioContext) audioContext.suspend();
  document.getElementById("musicToggle").textContent = "♫ Music off";
  document.getElementById("musicToggle").setAttribute("aria-pressed","false");
}
document.getElementById("musicToggle").addEventListener("click", () => musicOn ? stopMusic() : startMusic());

function sprinkle(count = 20) {
  const symbols = ["✦","✧","♡","🌸","🦋","✿"];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "floaty";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--duration", `${4 + Math.random() * 4}s`);
    piece.style.setProperty("--size", `${12 + Math.random() * 17}px`);
    piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    floatLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 8500);
  }
}
setInterval(() => {
  const piece = document.createElement("span");
  piece.className = "floaty";
  piece.textContent = ["✦","♡","🦋","✿"][Math.floor(Math.random()*4)];
  piece.style.left = `${Math.random()*100}%`;
  piece.style.setProperty("--duration", `${9 + Math.random()*5}s`);
  piece.style.setProperty("--size", `${11 + Math.random()*13}px`);
  piece.style.setProperty("--drift", `${-65 + Math.random()*130}px`);
  floatLayer.appendChild(piece);
  setTimeout(() => piece.remove(), 15000);
}, 1900);

async function submitAnswer(answer) {
  if (submitted) return;
  const status = document.getElementById("submitStatus");
  const message = document.getElementById("message").value.trim();
  if (!SCRIPT_URL.startsWith("https://script.google.com/") || !SCRIPT_URL.endsWith("/exec")) {
    status.textContent = "The response system URL needs checking. Please contact the website creator.";
    return;
  }
  submitted = true;
  status.textContent = "Sending your answer… ✨";
  const payload = { answer, message, submittedAt: new Date().toLocaleString() };
  try {
    // no-cors is intentional for this Apps Script endpoint; browser cannot read its response.
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    document.getElementById("endingIcon").textContent = answer.startsWith("YES") ? "💗" : "💌";
    document.getElementById("endingTitle").textContent = answer.startsWith("YES") ? "A new little chapter." : "Thank you for being honest.";
    document.getElementById("endingText").textContent = answer.startsWith("YES")
      ? "You said yes! 💜 I'm happy to take this one step at a time, with kindness, honesty and respect. Thank you for giving this a chance."
      : "Thank you for sharing your honest answer. I respect your choice and wish you happiness. Thank you for exploring this little universe.";
    showScene(8);
    sprinkle(55);
  } catch (error) {
    submitted = false;
    status.textContent = "There was a connection issue. Please try again.";
  }
}
document.getElementById("yesBtn").addEventListener("click", () => submitAnswer("YES — I'd love to be your girlfriend 💜"));
document.getElementById("noBtn").addEventListener("click", () => submitAnswer("NO — I don't feel the same"));
