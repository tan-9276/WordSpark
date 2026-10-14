const words = [
  { word: "circuit", hint: "A closed path through which electric current flows." },
  { word: "voltage", hint: "The electrical potential difference, measured in volts." },
  { word: "resistor", hint: "A component that limits electric current." },
  { word: "battery", hint: "A device that stores chemical energy and provides power." },
  { word: "capacitor", hint: "A component that stores electric charge." },
  { word: "diode", hint: "A component that lets current flow mostly in one direction." },
  { word: "current", hint: "The flow of electric charge, measured in amperes." },
  { word: "multimeter", hint: "An instrument used to measure voltage, current, and resistance." },
  { word: "breadboard", hint: "A board for building temporary circuits without soldering." },
  { word: "transistor", hint: "A semiconductor device used as a switch or amplifier." }
];

const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const resultScreen = document.querySelector("#result-screen");
const scrambledWord = document.querySelector("#scrambled-word");
const hint = document.querySelector("#hint");
const answerInput = document.querySelector("#answer-input");
const checkButton = document.querySelector("#check-button");
const message = document.querySelector("#message");
const roundText = document.querySelector("#round");
const scoreText = document.querySelector("#score");
const timeText = document.querySelector("#time");
const timerBar = document.querySelector("#timer-bar");
const hintButton = document.querySelector("#hint-button");

let selectedWords = [];
let currentRound = 0;
let score = 0;
let secondsLeft = 30;
let timer;
let hintUsed = false;
let isRoundFinished = false;

function shuffleWord(word) {
  let scrambled = word;
  while (scrambled === word) {
    scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
  }
  return scrambled.toUpperCase().split("").join(" ");
}

function startGame() {
  selectedWords = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  currentRound = 0;
  score = 0;
  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  loadRound();
}

function loadRound() {
  clearInterval(timer);
  secondsLeft = 30;
  hintUsed = false;
  isRoundFinished = false;
  const current = selectedWords[currentRound];
  roundText.textContent = `${String(currentRound + 1).padStart(2, "0")} / ${selectedWords.length}`;
  scoreText.textContent = score;
  scrambledWord.textContent = shuffleWord(current.word);
  hint.textContent = current.hint;
  answerInput.value = "";
  answerInput.disabled = false;
  checkButton.disabled = false;
  hintButton.disabled = false;
  message.textContent = "";
  message.className = "message";
  updateTimer();
  answerInput.focus();
  timer = setInterval(countDown, 1000);
}

function updateTimer() {
  timeText.textContent = secondsLeft;
  timerBar.style.width = `${(secondsLeft / 30) * 100}%`;
  timerBar.style.background = secondsLeft <= 10 ? "#ff927e" : "#6658e9";
}

function countDown() {
  secondsLeft -= 1;
  updateTimer();
  if (secondsLeft <= 0) finishRound(false, "Time is up!");
}

function checkAnswer() {
  if (isRoundFinished) return;
  const answer = answerInput.value.trim().toLowerCase();
  if (!answer) {
    message.textContent = "Type an answer before checking.";
    message.className = "message wrong";
    return;
  }
  const isCorrect = answer === selectedWords[currentRound].word;
  finishRound(isCorrect, isCorrect ? "Correct!" : "That is not the hidden word.");
}

function finishRound(isCorrect, prefix) {
  if (isRoundFinished) return;
  isRoundFinished = true;
  clearInterval(timer);
  answerInput.disabled = true;
  checkButton.disabled = true;
  hintButton.disabled = true;
  if (isCorrect) {
    const earnedPoints = hintUsed ? 5 : 10;
    score += earnedPoints;
    scoreText.textContent = score;
    message.textContent = `${prefix} +${earnedPoints} points`;
    message.className = "message correct";
  } else {
    message.textContent = `${prefix} The word was “${selectedWords[currentRound].word}”.`;
    message.className = "message wrong";
  }
  setTimeout(nextRound, 1200);
}

function nextRound() {
  if (currentRound < selectedWords.length - 1) {
    currentRound += 1;
    loadRound();
  } else {
    showResults();
  }
}

function useHint() {
  if (hintUsed || isRoundFinished) return;
  hintUsed = true;
  hintButton.disabled = true;
  message.textContent = "Hint used: a correct answer will now be worth 5 points.";
  message.className = "message";
}

function showResults() {
  clearInterval(timer);
  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  const best = Math.max(score, Number(localStorage.getItem("wordSparkBestScore")) || 0);
  localStorage.setItem("wordSparkBestScore", best);
  document.querySelector("#final-score").textContent = score;
  document.querySelector("#best-score").textContent = best;
  const heading = document.querySelector("#result-heading");
  const copy = document.querySelector("#result-copy");
  if (score >= 85) { heading.textContent = "Word wizard!"; copy.textContent = "Excellent speed and accuracy. You mastered this round."; }
  else if (score >= 50) { heading.textContent = "Words conquered!"; copy.textContent = "A strong round. A little more speed will take you even higher."; }
  else { heading.textContent = "Nice effort!"; copy.textContent = "Try again and use each round to improve your score."; }
}

document.querySelector("#start-button").addEventListener("click", startGame);
document.querySelector("#play-again").addEventListener("click", startGame);
checkButton.addEventListener("click", checkAnswer);
answerInput.addEventListener("keydown", (event) => { if (event.key === "Enter") checkAnswer(); });
hintButton.addEventListener("click", useHint);
document.querySelector("#skip-button").addEventListener("click", () => finishRound(false, "Skipped."));
