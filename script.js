/* ========================================
   الامتحان الأسطوري - Main JavaScript
   Boss Mode Edition
   ======================================== */

// ========================================
// البيانات والمتغيرات العامة
// ========================================

let currentExam = null;
let currentQuestionIndex = 0;
let studentAnswers = [];
let studentName = '';
let isBossMode = false;
let examStartTime = null;
let examDuration = 3600; // 60 دقيقة بالثواني
let timerInterval = null;
let musicPlaying = true;

// ========================================
// نظام الأسئلة (Sample Data)
// ========================================

const examsData = {
    exam1: {
        title: "الامتحان الأول - العلوم",
        questions: [
            {
                text: "ما هي أصغر وحدة بناء في المادة؟",
                options: [
                    { text: "الذرة", correct: true },
                    { text: "الجزيء", correct: false },
                    { text: "الإلكترون", correct: false },
                    { text: "الخلية", correct: false }
                ],
                explanation: "الذرة هي أصغر جزء من العنصر يحتفظ بخصائصه الكيميائية. وهي تتكون من نواة تحيط بها إلكترونات."
            },
            {
                text: "كم عدد كواكب النظام الشمسي؟",
                options: [
                    { text: "7", correct: false },
                    { text: "8", correct: true },
                    { text: "9", correct: false },
                    { text: "10", correct: false }
                ],
                explanation: "النظام الشمسي يحتوي على 8 كواكب رئيسية: عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، ونبتون."
            }
        ]
    }
};

// ========================================
// إنشاء نظام النجوم المتساقطة
// ========================================

function createStarfield() {
    const starfield = document.getElementById('starfield');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const x = Math.random() * 100;
        const y = Math.random() * -100;
        const size = Math.random() * 2 + 0.5;
        const duration = Math.random() * 8 + 5;
        const drift = (Math.random() - 0.5) * 100;
        
        star.style.left = x + '%';
        star.style.top = y + '%';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.setProperty('--drift', drift + 'px');
        star.style.animationDuration = duration + 's';
        star.style.animationDelay = Math.random() * 2 + 's';
        
        starfield.appendChild(star);
    }
}

// ========================================
// إدارة الشاشات
// ========================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ========================================
// شاشة الدخول الرئيسية
// ========================================

document.getElementById('startBtn').addEventListener('click', function() {
    const name = document.getElementById('studentName').value.trim();
    if (name) {
        studentName = name;
        isBossMode = false;
        startExam('exam1');
    } else {
        alert('الرجاء إدخال اسمك الثلاثي');
    }
});

document.getElementById('vipButton').addEventListener('click', function() {
    showScreen('vipLoadingScreen');
    startVIPCountdown();
});

// ========================================
// نظام ��داد VIP (15 ثانية)
// ========================================

function startVIPCountdown() {
    let countdown = 15;
    const countdownElement = document.getElementById('countdownNumber');
    const progressRing = document.querySelector('.progress-ring__circle');
    const circumference = 2 * Math.PI * 90;
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = 0;

    const countdownInterval = setInterval(() => {
        countdownElement.textContent = countdown;
        
        // تحديث شريط التقدم
        const progress = (15 - countdown) / 15;
        progressRing.style.strokeDashoffset = circumference * (1 - progress);
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            showScreen('bossLoginScreen');
            loadBossAudio();
        }
        countdown--;
    }, 1000);
}

// ========================================
// نظام دخول Boss VIP
// ========================================

document.getElementById('bossLoginBtn').addEventListener('click', function() {
    const password = document.getElementById('bossPassword').value;
    const errorMsg = document.getElementById('bossErrorMsg');
    
    if (password === '5555') {
        errorMsg.classList.remove('show');
        studentName = 'Boss Vip';
        isBossMode = true;
        startExam('exam1');
    } else {
        errorMsg.textContent = 'كلمة السر غير صحيحة! 🔴';
        errorMsg.classList.add('show');
        document.getElementById('bossPassword').value = '';
    }
});

// ========================================
// تحميل الصوت الخلفي
// ========================================

function loadBossAudio() {
    const audio = document.getElementById('backgroundMusic');
    audio.src = 'https://files.catbox.moe/wde2zv.mp3';
    // سيتم تشغيله عند بدء الامتحان
}

// ========================================
// بدء الامتحان
// ========================================

function startExam(examId) {
    currentExam = examsData[examId];
    currentQuestionIndex = 0;
    studentAnswers = new Array(currentExam.questions.length).fill(null);
    examStartTime = Date.now();
    
    // تشغيل الصوت إذا كان Boss Mode
    if (isBossMode) {
        const audio = document.getElementById('backgroundMusic');
        audio.play().catch(e => console.log('Auto-play blocked'));
    }
    
    showScreen('examScreen');
    displayQuestion();
    startTimer();
    updateProgressBar();
}

// ========================================
// عرض السؤال
// ========================================

function displayQuestion() {
    const question = currentExam.questions[currentQuestionIndex];
    const container = document.getElementById('questionsContainer');
    
    // تحديث عداد الأسئلة
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = currentExam.questions.length;
    
    // مسح الحاوية
    container.innerHTML = '';
    
    // إنشاء عنصر السؤال
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.text;
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        if (studentAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-label">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionElement.addEventListener('click', () => {
            selectAnswer(index);
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    questionItem.appendChild(questionText);
    questionItem.appendChild(optionsContainer);
    container.appendChild(questionItem);
    
    // تحديث أزرار التنقل
    updateNavigationButtons();
}

function selectAnswer(optionIndex) {
    studentAnswers[currentQuestionIndex] = optionIndex;
    displayQuestion();
    updateProgressBar();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentExam.questions.length - 1;
    
    prevBtn.onclick = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion();
        }
    };
    
    nextBtn.onclick = () => {
        if (currentQuestionIndex < currentExam.questions.length - 1) {
            currentQuestionIndex++;
            displayQuestion();
        }
    };
}

// ========================================
// نظام المؤقت
// ========================================

function startTimer() {
    let remainingTime = examDuration;
    
    timerInterval = setInterval(() => {
        const hours = Math.floor(remainingTime / 3600);
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;
        
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        
        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
        
        remainingTime--;
    }, 1000);
}

// ========================================
// شريط التقدم
// ========================================

function updateProgressBar() {
    const answered = studentAnswers.filter(a => a !== null).length;
    const total = currentExam.questions.length;
    const percentage = Math.round((answered / total) * 100);
    
    document.getElementById('progressText').textContent = percentage + '%';
    
    const circle = document.querySelector('.progress-fill');
    const circumference = 2 * Math.PI * 45;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - answered / total);
}

// ========================================
// إنهاء الامتحان
// ========================================

document.getElementById('submitBtn').addEventListener('click', submitExam);

function submitExam() {
    clearInterval(timerInterval);
    
    const audio = document.getElementById('backgroundMusic');
    audio.pause();
    audio.currentTime = 0;
    
    calculateResults();
}

// ========================================
// حساب النتائج
// ========================================

function calculateResults() {
    let correct = 0;
    
    currentExam.questions.forEach((question, index) => {
        if (studentAnswers[index] !== null && question.options[studentAnswers[index]].correct) {
            correct++;
        }
    });
    
    const total = currentExam.questions.length;
    const percentage = Math.round((correct / total) * 100);
    const wrong = total - correct;
    
    document.getElementById('finalScore').textContent = correct;
    document.getElementById('totalScore').textContent = total;
    document.getElementById('percentage').textContent = percentage + '%';
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
    
    showScreen('resultsScreen');
}

// ========================================
// أزرار النتائج
// ========================================

document.getElementById('reviewBtn').addEventListener('click', showReview);
document.getElementById('retakeBtn').addEventListener('click', () => {
    showScreen('loginScreen');
    document.getElementById('studentName').value = '';
    document.getElementById('bossPassword').value = '';
});

document.getElementById('exitBtn').addEventListener('click', () => {
    showScreen('loginScreen');
    document.getElementById('studentName').value = '';
    document.getElementById('bossPassword').value = '';
});

// ========================================
// شاشة المراجعة
// ========================================

function showReview() {
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';
    
    currentExam.questions.forEach((question, index) => {
        const answer = studentAnswers[index];
        const selectedOption = answer !== null ? question.options[answer] : null;
        const correctOption = question.options.find(o => o.correct);
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        let html = `
            <div class="review-question">السؤال ${index + 1}: ${question.text}</div>
        `;
        
        if (answer !== null) {
            const isCorrect = selectedOption.correct;
            html += `
                <div class="review-answer ${isCorrect ? '' : 'wrong'}">
                    <div class="answer-label">إجابتك:</div>
                    <div class="answer-text">${String.fromCharCode(65 + answer)}) ${selectedOption.text}</div>
                </div>
            `;
            
            if (!isCorrect) {
                html += `
                    <div class="review-answer">
                        <div class="answer-label">الإجابة الصحيحة:</div>
                        <div class="answer-text">${correctOption.text}</div>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="review-answer wrong">
                    <div class="answer-label">لم تجب على هذا السؤال</div>
                </div>
                <div class="review-answer">
                    <div class="answer-label">الإجابة الصحيحة:</div>
                    <div class="answer-text">${correctOption.text}</div>
                </div>
            `;
        }
        
        html += `
            <div class="review-explanation">
                <div class="explanation-title">الشرح:</div>
                <div class="explanation-text">${question.explanation}</div>
            </div>
        `;
        
        reviewItem.innerHTML = html;
        reviewContent.appendChild(reviewItem);
    });
    
    showScreen('reviewScreen');
}

document.getElementById('backToResults').addEventListener('click', () => {
    showScreen('resultsScreen');
});

// ========================================
// أزرار التحكم
// ========================================

document.getElementById('soundToggle').addEventListener('click', function() {
    this.classList.toggle('active');
});

document.getElementById('musicToggle').addEventListener('click', function() {
    const audio = document.getElementById('backgroundMusic');
    if (musicPlaying) {
        audio.pause();
        musicPlaying = false;
    } else {
        audio.play();
        musicPlaying = true;
    }
    this.classList.toggle('active');
});

document.getElementById('themeToggle').addEventListener('click', function() {
    this.classList.toggle('active');
});

// ========================================
// مراقبة التبويب
// ========================================

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = 'ركز في ورقتك! ⚠️';
    } else {
        document.title = 'الامتحان الأسطوري';
    }
});

// ========================================
// البدء
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    createStarfield();
    showScreen('loginScreen');
});