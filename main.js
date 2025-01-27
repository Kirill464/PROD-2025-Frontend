import { loadAllTests, addNewTest, deleteTest } from './data.js';

// Глобальные переменные
let currentTest = null;
let currentQuestion = 0;
let userAnswers = [];
let userProgress = loadProgress();
let testsData = loadAllTests();

// Загрузка прогресса из localStorage
function loadProgress() {
    try {
        const savedProgress = localStorage.getItem('quizProgress');
        return savedProgress ? JSON.parse(savedProgress) : {};
    } catch (error) {
        console.error('Error loading progress:', error);
        return {};
    }
}

// Сохранение прогресса
function saveProgress() {
    if (currentTest) {
        userProgress[currentTest.id] = {
            answers: userAnswers,
            currentQuestion: currentQuestion
        };
        localStorage.setItem('quizProgress', JSON.stringify(userProgress));
    }
}

// Загрузка тестов
function loadTests() {
    const testsGrid = document.getElementById('tests-grid');
    if (!testsGrid) return;
    
    testsGrid.innerHTML = '';

    testsData.tests.forEach(test => {
        const progress = userProgress[test.id] || { answers: [] };
        const answeredCount = progress.answers?.filter(answer => answer !== null).length || 0;

        const card = document.createElement('div');
        card.className = 'test-card';
        
        if (!test.isDefault) {
            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('test-id', 'list-item-delete');
            deleteButton.className = 'delete-test-btn';
            deleteButton.innerHTML = '×';
            deleteButton.addEventListener('click', (e) => showDeleteConfirmation(test.id, e));
            card.appendChild(deleteButton);
        }

        card.innerHTML += `
            <h3 test-id="list-item-title">${test.title}</h3>
            <p>${test.description}</p>
            <div class="test-info">
                <span>${test.questionsCount} вопросов</span>
                ${answeredCount > 0 ? 
                    `<span class="progress-info">Отвечено: ${answeredCount}/${test.questionsCount}</span>` : 
                    ''}
            </div>
        `;
        card.addEventListener('click', () => startTest(test));
        testsGrid.appendChild(card);
    });
}

// Удаление теста
function showDeleteConfirmation(testId, event) {
    event.stopPropagation();
    if (deleteTest(testId)) {
        testsData = loadAllTests();
        loadTests();
    }
}

// Запуск теста
function startTest(test) {

    document.querySelector('.sidebar').classList.add('active');
    document.querySelector('body').classList.add('active');
    currentTest = test;
    currentQuestion = 0;
    
    const progress = userProgress[test.id];
    if (progress) {
        userAnswers = progress.answers;
        currentQuestion = progress.currentQuestion;
    } else {
        userAnswers = new Array(test.questions.length).fill(null);
    }

    document.getElementById('quiz-title').textContent = test.title;
    document.getElementById('tests-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    loadQuestions();
}

// Загрузка вопросов
function loadQuestions() {
    loadCurrentQuestion();
    updateNavButtons();
    loadQuestionsNav();
}

// Загрузка текущего вопроса
function loadCurrentQuestion() {
    const question = currentTest.questions[currentQuestion];
    const questionTitle = document.getElementById('question-title');
    questionTitle.setAttribute('test-id', 'question');
    const answersContainer = document.getElementById('answers');
    
    questionTitle.textContent = `Вопрос ${currentQuestion + 1}: ${question.question}`;
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.setAttribute('test-id', 'question-option');
        button.className = 'answer-btn';
        button.textContent = answer;
        if (userAnswers[currentQuestion]){
        }else{
            button.addEventListener('click', () => selectAnswer(index));
        }
        
        if (userAnswers[currentQuestion] === index) {
            button.classList.add('selected');
            if (index === question.correct) {
                button.classList.add('correct');
            } else {
                button.classList.add('wrong');
            }
        }
        
        answersContainer.appendChild(button);
    });
}

// Выбор ответа
function selectAnswer(answerIndex) {
    userAnswers[currentQuestion] = answerIndex;
    saveProgress();
    loadCurrentQuestion();
    loadQuestionsNav();
}

// Обновление кнопок навигации
function updateNavButtons() {
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    
    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = currentQuestion === currentTest.questions.length - 1;
}

// Загрузка навигации по вопросам
function loadQuestionsNav() {
    const questionsNav = document.getElementById('questions-nav');
    questionsNav.innerHTML = '';
    
    currentTest.questions.forEach((question, index) => {
        const button = document.createElement('button');
            button.className = 'question-nav-item';
            button.setAttribute('test-id', 'navigation-item');
            if (index === currentQuestion) {
            button.classList.add('active');
        }
        
        if (userAnswers[index] !== null) {
            if (userAnswers[index] === question.correct) {
                button.classList.add('correct');
            } else {
                button.classList.add('wrong');
            }
        }
        
        if (window.innerWidth < 782) {
            button.textContent = `${index + 1}`;
        } else {
            button.textContent = `Вопрос ${index + 1}`;
        }
        button.addEventListener('click', () => {
            currentQuestion = index;
            loadCurrentQuestion();
            updateNavButtons();
            updateQuestionsNav();
        });
        
        questionsNav.appendChild(button);
    });
}

// Обновление навигации по вопросам
function updateQuestionsNav() {
    const navItems = document.querySelectorAll('.question-nav-item');
    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentQuestion) {
            item.classList.add('active');
        }
    });
}

// Показать результаты
function showResults() {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('body').classList.remove('active');
    const stats = userAnswers.reduce((acc, answer, index) => {
        if (answer === null) {
            acc.unanswered++;
        } else if (answer === currentTest.questions[index].correct) {
            acc.correct++;
        } else {
            acc.incorrect++;
        }
        return acc;
    }, { correct: 0, incorrect: 0, unanswered: 0 });

    document.getElementById('correct-answers').textContent = stats.correct;
    document.getElementById('incorrect-answers').textContent = stats.incorrect;
    document.getElementById('unanswered-questions').textContent = stats.unanswered;
    document.getElementById('unanswered-container').style.display = stats.unanswered === 0 ? 'none' : 'flex';
    
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
}

// Перезапуск теста
function restartTest() {
    document.querySelector('.sidebar').classList.add('active');
    document.querySelector('body').classList.add('active');
    userAnswers = new Array(currentTest.questions.length).fill(null);
    currentQuestion = 0;
    saveProgress();
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    loadQuestions();
}

// Показать модальное окно создания теста
function showCreateTestModal() {
    document.getElementById('create-test-modal').classList.remove('hidden');
    initializeCreateTestForm();
}

// Скрыть модальное окно создания теста
function hideCreateTestModal() {
    document.getElementById('create-test-modal').classList.add('hidden');
    document.getElementById('create-test-form').reset();
    document.getElementById('questions-container').innerHTML = '';
    addQuestion();
}

// Инициализация формы создания теста
function initializeCreateTestForm() {
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';
    addQuestion();
}

// Добавить новый вопрос
function addQuestion() {
    const questionsContainer = document.getElementById('questions-container');
    const questionNumber = questionsContainer.children.length + 1;

    const questionBlock = document.createElement('div');
    questionBlock.className = 'question-block';
    questionBlock.innerHTML = `
        <div class="question-header">
            <span class="question-number">Вопрос ${questionNumber}</span>
        </div>
        <div class="form-group">
            <input type="text" class="question-input" placeholder="Введите вопрос" required test-id="new-test-question">
            <div class="error-message"></div>
        </div>
        <div class="answers-grid" test-id="new-test-options">
            ${Array(4).fill(0).map((_, i) => `
                <div class="answer-option"">
                    <input type="radio" name="correct-${questionNumber}" value="${i}" required>
                    <input type="text" class="answer-input" placeholder="Вариант ответа ${i + 1}" required>
                </div>
            `).join('')}
        </div>
    `;

    questionsContainer.appendChild(questionBlock);
    updateRemoveQuestionButton();
}

// Удалить последний вопрос
function removeLastQuestion() {
    const questionsContainer = document.getElementById('questions-container');
    if (questionsContainer.children.length > 1) {
        questionsContainer.removeChild(questionsContainer.lastChild);
    }
    updateRemoveQuestionButton();
}

// Обновить состояние кнопки удаления вопроса
function updateRemoveQuestionButton() {
    const questionsContainer = document.getElementById('questions-container');
    document.getElementById('remove-question-btn').disabled = questionsContainer.children.length <= 1;
}

// Обработка создания теста
function handleCreateTest(e) {
    e.preventDefault();

    const title = document.getElementById('test-title').value.trim();
    const description = document.getElementById('test-description').value.trim();
    const questions = [];

    const questionBlocks = document.querySelectorAll('.question-block');
    let isValid = true;

    questionBlocks.forEach((block, index) => {
        const questionInput = block.querySelector('.question-input');
        const answerInputs = block.querySelectorAll('.answer-input');
        const correctAnswer = block.querySelector(`input[name="correct-${index + 1}"]:checked`);

        if (!questionInput.value.trim() || 
            Array.from(answerInputs).some(input => !input.value.trim()) || 
            !correctAnswer) {
            isValid = false;
            const errorMessage = block.querySelector('.error-message');
            errorMessage.textContent = 'Заполните все поля и выберите правильный ответ';
        }

        if (isValid) {
            questions.push({
                question: questionInput.value.trim(),
                answers: Array.from(answerInputs).map(input => input.value.trim()),
                correct: parseInt(correctAnswer.value)
            });
        }
    });

    if (!isValid) {
        return;
    }

    const newTest = {
        title,
        description,
        questions
    };

    if (addNewTest(newTest)) {
        testsData = loadAllTests();
        hideCreateTestModal();
        loadTests();
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    document.querySelectorAll('.tests-link').forEach(link => {
        link.addEventListener('click', () => {
            userAnswers = new Array(currentTest.questions.length).fill(null);
            currentQuestion = 0;
            saveProgress();
            document.getElementById('quiz-screen').classList.add('hidden');
            document.getElementById('results-screen').classList.add('hidden');
            document.getElementById('tests-screen').classList.remove('hidden');
            loadTests();
        });
    });

    document.getElementById('back-to-tests-btn').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('body').classList.remove('active');
        saveProgress();
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('tests-screen').classList.remove('hidden');
        loadTests();
    });

    document.getElementById('restart-btn').addEventListener('click', restartTest);
    document.getElementById('prev-btn').addEventListener('click', () => {
        currentQuestion--;
        loadCurrentQuestion();
        updateNavButtons();
        updateQuestionsNav();
    });
    
    document.getElementById('next-btn').addEventListener('click', () => {
        currentQuestion++;
        loadCurrentQuestion();
        updateNavButtons();
        updateQuestionsNav();
    });

    document.getElementById('finish-btn').addEventListener('click', showResults);
    document.getElementById('add-test-btn').addEventListener('click', showCreateTestModal);
    document.querySelector('.modal-overlay').addEventListener('click', hideCreateTestModal);
    document.getElementById('cancel-create-test').addEventListener('click', hideCreateTestModal);
    document.getElementById('create-test-form').addEventListener('submit', handleCreateTest);
    document.getElementById('add-question-btn').addEventListener('click', addQuestion);
    document.getElementById('remove-question-btn').addEventListener('click', removeLastQuestion);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTests();
    setupEventListeners();
});