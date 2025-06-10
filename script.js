document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');
    const workInput = document.getElementById('work-duration');
    const breakInput = document.getElementById('break-duration');
    const applySettingsBtn = document.getElementById('apply-settings');
    const progressBar = document.getElementById('progress-bar');
    const historyList = document.getElementById('history-list');
    const modeToggle = document.getElementById('modeToggle');
    const modeLabel = document.getElementById('modeLabel');
    const timerDisplay = document.querySelector('.timer');

    // State
    let timer = null;
    let isRunning = false;
    let isWorkSession = true;
    let workDuration = parseInt(workInput.value, 10) * 60;
    let breakDuration = parseInt(breakInput.value, 10) * 60;
    let timeLeft = workDuration;
    let totalTime = workDuration;
    let sessionHistory = [];

    // Utility Functions
    const pad = (num) => String(num).padStart(2, '0');

    function updateTimerDisplay() {
        minutesEl.textContent = pad(Math.floor(timeLeft / 60));
        secondsEl.textContent = pad(timeLeft % 60);
    }

    function updateProgressBar() {
        const percent = 100 - Math.floor((timeLeft / totalTime) * 100);
        progressBar.style.width = `${percent}%`;
    }

    function setTimerState(running) {
        isRunning = running;
        startBtn.disabled = running;
        pauseBtn.disabled = !running;
        resetBtn.disabled = false;
        timerDisplay.classList.toggle('animated', running);
    }

    function resetProgressBar() {
        progressBar.style.width = '0%';
    }

    function addSessionToHistory(type, duration) {
        const now = new Date();
        const item = document.createElement('li');
        item.textContent = `[${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}] ${type} - ${Math.floor(duration/60)} min`;
        historyList.insertBefore(item, historyList.firstChild);
        sessionHistory.push({ type, duration, time: now });
        // Limit history to last 10 sessions
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    function switchSession() {
        isWorkSession = !isWorkSession;
        totalTime = isWorkSession ? workDuration : breakDuration;
        timeLeft = totalTime;
        updateTimerDisplay();
        resetProgressBar();
        timerDisplay.setAttribute('aria-label', isWorkSession ? 'Work session' : 'Break session');
        timerDisplay.style.color = isWorkSession ? '#fff' : '#ccc';
    }

    // Timer Logic
    function startTimer() {
        if (isRunning) return;
        setTimerState(true);
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
                updateProgressBar();
            } else {
                clearInterval(timer);
                setTimerState(false);
                // Add to history
                addSessionToHistory(isWorkSession ? 'Work' : 'Break', totalTime);
                // Play sound (optional)
                // new Audio('ding.mp3').play();
                // Switch session
                switchSession();
                // Auto-start next session after short delay
                setTimeout(startTimer, 1200);
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        clearInterval(timer);
        setTimerState(false);
    }

    function resetTimer() {
        clearInterval(timer);
        setTimerState(false);
        timeLeft = isWorkSession ? workDuration : breakDuration;
        totalTime = timeLeft;
        updateTimerDisplay();
        resetProgressBar();
    }

    function applySettings() {
        // Validate input
        let workVal = parseInt(workInput.value, 10);
        let breakVal = parseInt(breakInput.value, 10);
        if (isNaN(workVal) || workVal < 1) workVal = 25;
        if (isNaN(breakVal) || breakVal < 1) breakVal = 5;
        workInput.value = workVal;
        breakInput.value = breakVal;
        workDuration = workVal * 60;
        breakDuration = breakVal * 60;
        // Reset timer to new settings
        isWorkSession = true;
        timeLeft = workDuration;
        totalTime = workDuration;
        updateTimerDisplay();
        resetProgressBar();
    }

    // Mode Toggle (Light/Dark)
    function setMode(isLight) {
        document.body.classList.toggle('light-mode', isLight);
        modeLabel.textContent = isLight ? 'Light Mode' : 'Dark Mode';
    }

    // Accessibility: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.key.toLowerCase()) {
            case ' ':
            case 'enter':
                if (!isRunning) startTimer();
                else pauseTimer();
                break;
            case 'r':
                resetTimer();
                break;
        }
    });

    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    applySettingsBtn.addEventListener('click', applySettings);
    modeToggle.addEventListener('change', (e) => setMode(e.target.checked));

    // Initial UI State
    updateTimerDisplay();
    resetProgressBar();
    setTimerState(false);
    setMode(modeToggle.checked);

    // Accessibility: ARIA
    timerDisplay.setAttribute('aria-live', 'polite');
    timerDisplay.setAttribute('aria-atomic', 'true');
    timerDisplay.setAttribute('aria-label', 'Work session');
});
