
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwETiOsy--lGgkXSAdeA4Q1esYBeQB_qVac7oPDAq3huGDpYt4nJ-w2vPPbcuQyCqMI/exec";

const scenes = [...document.querySelectorAll(".scene")];
const progress = document.getElementById("progress");
let currentScene = 0;
let selectedMood = "";
let starsCaught = 0;
let riddleCorrect = false;
let giftOpened = false;
let letterOpened = false;
let proposalAnswer = "";
let audioContext = null;
let musicPlaying = false;

const answers = {
  mood: "",
  stars: 0,
  riddle: ""
};

// Small decorative starfield
const starLayer = document.getElementById("stars");
for (let i = 0; i < 24; i++) {
  const star = document.createElement("span");
  star.className = "bg-star";
  star.textContent = i % 3 === 0 ? "✦" : "·";
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.fontSize = (8 + Math.random() * 13) + "px";
  star.style.animationDelay = (Math.random() * 3) + "s";
  starLayer.appendChild(star);
}

function showScene(number) {
  if (number < 0 || number >= scenes.length) return;

  scenes[currentScene].classList.remove("active");
  currentScene = number;
  scenes[currentScene].classList.add("active");

  progress.style.width = ((number + 1) / scenes.length * 100) + "%";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".next-scene").forEach(button => {
  button.addEventListener("click", () => showScene(currentScene + 1));
});

// Intro
document.getElementById("beginButton").addEventListener("click", () => {
  startMusic();
  showScene(1);
});

// Mood selection
document.querySelectorAll(".mood-choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-choice").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
    selectedMood = button.dataset.value;
    answers.mood = selectedMood;
    document.getElementById("moodFeedback").textContent = "Lovely choice! ✨";
    document.getElementById("moodNext").disabled = false;
  });
});

document.getElementById("moodNext").addEventListener("click", () => showScene(3));

// Star-catching game
document.querySelectorAll(".game-star").forEach(star => {
  star.addEventListener("click", () => {
    if (star.classList.contains("caught")) return;

    star.classList.add("caught");
    starsCaught++;
    document.getElementById("starScore").textContent = starsCaught;
    answers.stars = starsCaught;

    if (starsCaught === 5) {
      document.getElementById("gameMessage").textContent = "You found them all! ✨";
      document.getElementById("starNext").disabled = false;
      showToast("Stardust collected! ⭐");
      celebrate(18);
    }
  });
});

document.getElementById("starNext").addEventListener("click", () => showScene(4));

// Riddle
document.querySelectorAll(".riddle-answer").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".riddle-answer").forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");

    if (button.dataset.answer === "A smile") {
      riddleCorrect = true;
      answers.riddle = "A smile";
      document.getElementById("riddleFeedback").textContent = "Exactly! A smile can brighten a day. 😊";
      document.getElementById("riddleNext").disabled = false;
    } else {
      riddleCorrect = false;
      document.getElementById("riddleFeedback").textContent = "Not quite! Have another little think. 💭";
      document.getElementById("riddleNext").disabled = true;
    }
  });
});

document.getElementById("riddleNext").addEventListener("click", () => {
  if (riddleCorrect) showScene(5);
});

// Gift reveal
document.getElementById("giftButton").addEventListener("click", () => {
  if (giftOpened) return;

  giftOpened = true;
  document.getElementById("giftReveal").classList.add("show");
  document.getElementById("giftNext").disabled = false;
  document.getElementById("giftButton").style.transform = "scale(.85) rotate(8deg)";
  showToast("Surprise unlocked! 💌");
  celebrate(25);
});

document.getElementById("giftNext").addEventListener("click", () => showScene(6));

// Letter
document.getElementById("openLetter").addEventListener("click", () => {
  if (letterOpened) return;

  letterOpened = true;
  document.getElementById("letterEnvelope").classList.add("open");
  document.getElementById("letterHint").textContent = "A little note, opened just for you. 💗";
  document.getElementById("letterNext").disabled = false;
  setTimeout(() => celebrate(12), 400);
});

document.getElementById("letterNext").addEventListener("click", () => showScene(7));

// Proposal response
document.getElementById("yesButton").addEventListener("click", () => {
  proposalAnswer = "Yes";
  sendResponse();
});

document.getElementById("noButton").addEventListener("click", () => {
  proposalAnswer = "No";
  sendResponse();
});

async function sendResponse() {
  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const feedback = document.getElementById("proposalFeedback");
  const message = document.getElementById("personalMessage").value.trim();

  yesButton.disabled = true;
  noButton.disabled = true;
  feedback.textContent = "Sending your response…";

  const result = {
    question1: proposalAnswer,
    question2: message,
    answer: proposalAnswer,
    message: message,
    mood: answers.mood,
    quizAnswers: answers,
    submittedAt: new Date().toLocaleString()
  };

  // Keep a local copy as a backup.
  localStorage.setItem("universeResponse", JSON.stringify(result));

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(result)
    });
  } catch (error) {
    console.error("Response sending error:", error);
  }

  if (proposalAnswer === "Yes") {
    document.getElementById("endingIcon").textContent = "💗";
    document.getElementById("endingTitle").innerHTML = "A beautiful little<br><em>beginning.</em>";
    document.getElementById("endingText").textContent =
      "Thank you for giving this a chance. Let's take things one step at a time and make it something lovely.";
    celebrate(55);
  } else {
    document.getElementById("endingIcon").textContent = "🌷";
    document.getElementById("endingTitle").innerHTML = "Thank you for<br>being <em>honest.</em>";
    document.getElementById("endingText").textContent =
      "Your answer is respected. Thank you for exploring this little universe, and I wish you happiness.";
    celebrate(12);
  }

  showScene(8);
}

document.getElementById("restartButton").addEventListener("click", () => {
  window.location.reload();
});

// Music: a gentle original ambient melody made with Web Audio.
function startMusic() {
  if (musicPlaying) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      showToast("Music isn't supported in this browser.");
      return;
    }

    audioContext = audioContext || new AudioContextClass();
    if (audioContext.state === "suspended") audioContext.resume();

    musicPlaying = true;
    document.querySelector("#musicButton span").textContent = "Music on";
    playMelody();
  } catch (error) {
    console.log("Audio unavailable:", error);
  }
}

let melodyTimer = null;
let noteIndex = 0;

function playMelody() {
  if (!audioContext || !musicPlaying) return;

  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  const frequency = notes[noteIndex % notes.length];
  noteIndex++;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1.25);

  melodyTimer = setTimeout(playMelody, 850);
}

function stopMusic() {
  musicPlaying = false;
  clearTimeout(melodyTimer);
  document.querySelector("#musicButton span").textContent = "Music off";
}

document.getElementById("musicButton").addEventListener("click", () => {
  if (musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

// Small bursts only when a scene is completed: keeps mobile performance smooth.
function celebrate(amount = 20) {
  const symbols = ["✦", "✧", "♡", "·", "✿"];
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.color = ["#e7a4c7", "#b9a8ed", "#ffd1a9", "#d6b9df"][Math.floor(Math.random() * 4)];
    piece.style.fontSize = (10 + Math.random() * 16) + "px";
    piece.style.animationDuration = (2 + Math.random() * 2) + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
