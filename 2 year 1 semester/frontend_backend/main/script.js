
document.addEventListener('DOMContentLoaded', function() {
        window.onscroll = function() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                document.getElementById("scrollToTop").style.display = "block";
            } else {
                document.getElementById("scrollToTop").style.display = "none";
            }
        };

        // Прокрутка вверх при клике на кнопку
        document.getElementById("scrollToTop").onclick = function() {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        };
});


document.addEventListener('DOMContentLoaded', function() {
    // Функции
    function showMessage(message) {
        console.log(message);
    }

    function changeBackgroundColor(color) {
        document.body.style.backgroundColor = color;
    }

    function toggleVisibility(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }

    function updateH1FromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmTerm = urlParams.get('utm_term');
        const h1 = document.querySelector('h1');
        if (utmTerm && h1) {
            h1.textContent = utmTerm;
        }
    }

    function logCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU');
        console.log(`Текущее время: ${timeString}`);
    }

    function resetBackgroundColor() {
        document.body.style.backgroundColor = 'white';
    }

    // Действия после загрузки страницы
    showMessage("Скрипт загружен!");
    changeBackgroundColor("lightblue");
    resetBackgroundColor();
    logCurrentTime();
    updateH1FromUrl();

    // Действия при нажатии на кнопку
    document.getElementById('task12Btn').addEventListener('click', function() {
            console.log("Практическая работа №12 началась!");
            resetBackgroundColor();
            changeBackgroundColor("lightblue");
            toggleVisibility("#frontend");  // Пример: скрытие секции "Фронтенд"
        });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('task11Btn').addEventListener('click', function() {
        // Задание 1: Изменение заголовка H1
        const h1 = document.querySelector('h1');
        if (h1) {
            h1.textContent = 'Добро пожаловать на наш сайт!';
        }

        // Задание 2: Изменение цвета текста H2
        const h2 = document.querySelector('h2');
        if (h2) {
            h2.style.color = 'red';
        }

        // Задание 3: Изменение текста первого параграфа
        const firstParagraph = document.querySelector('p');
        if (firstParagraph) {
            firstParagraph.textContent = 'Это новый текст параграфа.';
        }

        // Задание 4: Скрытие встроенного видео
        const embeddedVideo = document.querySelector('iframe');
        if (embeddedVideo) {
            embeddedVideo.style.display = 'none';
        }

        console.log('Практическая работа №11 выполнена успешно!');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Задание 1: Переменные и условные операторы
    function task1() {
        const myName = 'Демьян';
        const myAge = 19;
        console.log("Задание 1:");
        console.log("Имя:", myName);
        console.log("Возраст:", myAge);
        
        if (myAge >= 18) {
            console.log('Вы совершеннолетний');
            alert('Вы совершеннолетний');
        } else {
            console.log('Вы несовершеннолетний');
            alert('Вы несовершеннолетний');
        }
    }

    // Задание 2: Циклы
    function task2() {
        console.log('Задание 2: Циклы');
        
        // Цикл for от 1 до 10
        console.log('Числа от 1 до 10:');
        for (let i = 1; i <= 10; i++) {
            console.log(i);
        }
        
        // Цикл while в обратном порядке
        console.log('Числа от 10 до 1:');
        let j = 10;
        while (j >= 1) {
            console.log(j);
            j--;
        }
    }

    // Задание 3: Работа с массивами
    function task3() {
        console.log('Задание 3: Работа с массивами');
        
        const lectures = ['Тема 1', 'Тема 2', 'Тема 3'];
        const practices = ['Практика 1', 'Практика 2', 'Практика 3'];
        
        // Добавление новых элементов
        lectures.push('Тема 4');
        practices.unshift('Практика 0');
        
        console.log('Темы лекций:');
        lectures.forEach(lecture => console.log(lecture));
        
        console.log('Темы практик:');
        practices.forEach(practice => console.log(practice));
        
        // Функция вывода массива в строку
        function printArrayToString(arr) {
            console.log(arr.join(', '));
        }
        
        console.log('Массивы в строку:');
        printArrayToString(lectures);
        printArrayToString(practices);
    }

    // Задание 4: Манипуляции с массивами
    function task4() {
        console.log('Задание 4: Манипуляции с массивами');
        
        const lectures = ['Основы Java', 'Теория алгоритмов', 'Объектно-ориентированное программирование', 'Операционные системы'];
        
        function filterLecturesStartingWithO(arr) {
            return arr.filter(lecture => lecture.startsWith('О'));
        }
        
        const filteredLectures = filterLecturesStartingWithO(lectures);
        
        console.log('Лекции, начинающиеся с "О":');
        console.log(filteredLectures);
    }

    // Привязка кнопок к функциям
    document.getElementById('task1Btn').addEventListener('click', task1);
    document.getElementById('task2Btn').addEventListener('click', task2);
    document.getElementById('task3Btn').addEventListener('click', task3);
    document.getElementById('task4Btn').addEventListener('click', task4);
});