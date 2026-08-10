const MODES = {
    pomodoro: {
        time: 25 * 60,
        label: 'Pomodoro',
        status: 'Hora de focar!'
    },
    shortBreak: {
        time: 5 * 60,
        label: 'Pausa Curta',
        status: 'Hora do descanso!'
    },
    longBreak: {
        time: 15 * 60,
        label: 'Pausa Longa',
        status: 'Descanso merecido!'
    }
};

let currentMode = 'pomodoro';
let timeRemaining = MODES.pomodoro.time;
let isRunning = false;
let timerInterval = null;
let sessionCount = 0;
let completedSessions = 0;

const timeDisplay = document.getElementById('timeDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeButtons = document.querySelectorAll('.mode-btn');
const statusText = document.getElementById('statusText');
const sessionCountEl = document.getElementById('sessionCount');
const ringProgress = document.querySelector('.ring-progress');
const timerDisplayEl = document.querySelector('.timer-display');

function init() {
    updateDisplay();
    updateRing();
    loadSessionCount();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(timeRemaining);
}

function updateRing() {
    const totalTime = MODES[currentMode].time;
    const progress = timeRemaining / totalTime;
    const circumference = 2 * Math.PI * 88;
    const offset = circumference * (1 - progress);
    ringProgress.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isRunning = true;
    startPauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pausar</span>';
    timerDisplayEl.classList.add('active');
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateDisplay();
        updateRing();
        
        if (timeRemaining <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    startPauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Iniciar</span>';
    timerDisplayEl.classList.remove('active');
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timeRemaining = MODES[currentMode].time;
    updateDisplay();
    updateRing();
}

function completeTimer() {
    pauseTimer();
    playNotification();
    
    if (currentMode === 'pomodoro') {
        completedSessions++;
        sessionCount = completedSessions % 4;
        if (sessionCount === 0) sessionCount = 4;
        saveSessionCount();
        
        if (completedSessions % 4 === 0) {
            switchMode('longBreak');
        } else {
            switchMode('shortBreak');
        }
    } else {
        switchMode('pomodoro');
    }
    
    statusText.textContent = 'Tempo esgotado! 🎉';
}

function switchMode(mode) {
    currentMode = mode;
    timeRemaining = MODES[mode].time;
    
    modeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    statusText.textContent = MODES[mode].status;
    updateDisplay();
    updateRing();
}

function playNotification() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    setTimeout(() => {
        oscillator.stop();
        gainNode.gain.value = 0;
    }, 200);
    
    setTimeout(() => {
        oscillator.start();
        gainNode.gain.value = 0.3;
    }, 400);
    
    setTimeout(() => {
        oscillator.stop();
        gainNode.gain.value = 0;
    }, 600);
    
    setTimeout(() => {
        oscillator.start();
        gainNode.gain.value = 0.3;
    }, 800);
    
    setTimeout(() => {
        oscillator.stop();
    }, 1000);
}

function saveSessionCount() {
    localStorage.setItem('pomodoroSessions', completedSessions.toString());
}

function loadSessionCount() {
    const saved = localStorage.getItem('pomodoroSessions');
    if (saved) {
        completedSessions = parseInt(saved, 10);
        sessionCount = completedSessions % 4;
        if (sessionCount === 0 && completedSessions > 0) sessionCount = 4;
        sessionCountEl.textContent = sessionCount;
    }
}

startPauseBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        pauseTimer();
        switchMode(btn.dataset.mode);
    });
});

init();
