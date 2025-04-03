let timer;
let isRunning = false;
let isWorkSession = true;
let timeLeft;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
const beep = new Audio('https://www.soundjay.com/button/beep-07.mp3');

const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const workInput = document.getElementById("work-duration");
const breakInput = document.getElementById("break-duration");
const applySettingsButton = document.getElementById("apply-settings");
const progressBar = document.getElementById("progress-bar");
const modeToggle = document.getElementById("modeToggle");
const modeLabel = document.getElementById("modeLabel");
const historyList = document.getElementById("history-list");

function updateDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    minutesDisplay.textContent = String(minutes).padStart(2, "0");
    secondsDisplay.textContent = String(seconds).padStart(2, "0");

    let progress = isWorkSession
        ? ((workDuration - timeLeft) / workDuration) * 100
        : ((breakDuration - timeLeft) / breakDuration) * 100;
    progressBar.style.width = `${progress}%`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                beep.play();
                logSession(isWorkSession ? 'Work' : 'Break');
                clearInterval(timer);
                isRunning = false;
                isWorkSession = !isWorkSession;
                timeLeft = isWorkSession ? workDuration : breakDuration;
                updateDisplay();
                startTimer();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    isWorkSession = true;
    timeLeft = workDuration;
    updateDisplay();
    progressBar.style.width = "0%";
}

function applySettings() {
    workDuration = parseInt(workInput.value) * 60;
    breakDuration = parseInt(breakInput.value) * 60;
    resetTimer();
}

function logSession(type) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    const entry = `${type} session completed at ${time}`;
    const listItem = document.createElement("li");
    listItem.textContent = entry;
    historyList.appendChild(listItem);

    // Save to localStorage
    let sessions = JSON.parse(localStorage.getItem("pomodoroHistory")) || [];
    sessions.push(entry);
    localStorage.setItem("pomodoroHistory", JSON.stringify(sessions));
}

function loadHistory() {
    const sessions = JSON.parse(localStorage.getItem("pomodoroHistory")) || [];
    sessions.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = entry;
        historyList.appendChild(li);
    });
}

modeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    modeLabel.textContent = document.body.classList.contains("dark") ? "Dark Mode" : "Light Mode";
});

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
applySettingsButton.addEventListener("click", applySettings);

loadHistory();
resetTimer();
