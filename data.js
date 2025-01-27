const defaultTests = {
    tests: [
        {
            id: "js-basic",
            title: "JavaScript Базовый",
            description: "Базовые концепции JavaScript: переменные, типы данных, функции",
            questionsCount: 5,
            isDefault: true,
            questions: [
                {
                    question: "Что такое JavaScript?",
                    answers: [
                        "Язык разметки",
                        "Язык программирования",
                        "База данных",
                        "Операционная система"
                    ],
                    correct: 1
                },
                {
                    question: "Как объявить переменную в JavaScript?",
                    answers: [
                        "variable x;",
                        "var x;",
                        "v x;",
                        "int x;"
                    ],
                    correct: 1
                },
                {
                    question: "Какой оператор используется для строгого сравнения в JavaScript?",
                    answers: [
                        "==",
                        "===",
                        "=",
                        "!="
                    ],
                    correct: 1
                },
                {
                    question: "Что такое NaN?",
                    answers: [
                        "Не число",
                        "Нулевое значение",
                        "Неопределенное значение",
                        "Пустая строка"
                    ],
                    correct: 0
                },
                {
                    question: "Как объявить функцию в JavaScript?",
                    answers: [
                        "func myFunction()",
                        "function: myFunction()",
                        "function myFunction()",
                        "def myFunction()"
                    ],
                    correct: 2
                }
            ]
        }
    ]
};

// Загрузка тестов из localStorage или использование дефолтных
export function loadAllTests() {
    try {
        const customTests = JSON.parse(localStorage.getItem('customTests')) || [];
        return {
            tests: [...defaultTests.tests, ...customTests]
        };
    } catch (error) {
        console.error('Error loading tests:', error);
        return defaultTests;
    }
}

// Сохранение пользовательских тестов
function saveCustomTests(customTests) {
    try {
        localStorage.setItem('customTests', JSON.stringify(customTests));
        return true;
    } catch (error) {
        console.error('Error saving tests:', error);
        return false;
    }
}

// Добавление нового теста
export function addNewTest(test) {
    try {
        const customTests = JSON.parse(localStorage.getItem('customTests')) || [];
        const newTest = {
            ...test,
            id: `custom-${Date.now()}`,
            questionsCount: test.questions.length,
            isDefault: false
        };
        customTests.push(newTest);
        return saveCustomTests(customTests);
    } catch (error) {
        console.error('Error adding new test:', error);
        return false;
    }
}

// Удаление теста
export function deleteTest(testId) {
    try {
        const customTests = JSON.parse(localStorage.getItem('customTests')) || [];
        const updatedTests = customTests.filter(test => test.id !== testId);
        return saveCustomTests(updatedTests);
    } catch (error) {
        console.error('Error deleting test:', error);
        return false;
    }
}