document.addEventListener('DOMContentLoaded', function() {
    (function () {
        'use strict'
        var forms = document.querySelectorAll('.needs-validation')
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }
                    form.classList.add('was-validated')
                }, false)
            })
    })()

    // Обработка кликов по ячейкам таблицы
    document.querySelectorAll('.attendance-cell, .completion-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            this.textContent = this.textContent === '✓' ? '' : '✓';
        });
    });

    // Инициализация карты
    ymaps.ready(init);
    function init(){
        var myMap = new ymaps.Map("map", {
            center: [55.669984, 37.479318],
            zoom: 15
        });
        var myPlacemark = new ymaps.Placemark([55.669984, 37.479318], {
            hintContent: 'РТУ МИРЭА',
            balloonContent: 'РТУ МИРЭА, проспект Вернадского, д. 78'
        });
        myMap.geoObjects.add(myPlacemark);
    }

    // Кнопка прокрутки вверх
    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById("scrollToTop").style.display = "block";
        } else {
            document.getElementById("scrollToTop").style.display = "none";
        }
    };

    document.getElementById("scrollToTop").onclick = function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    // Обработчик клика по заголовку H1
    document.getElementById("main-title").addEventListener("click", function() {
    alert("Вы кликнули на заголовок - так держать!");
    });

    // Обработчик клика по кнопке смены семестра
    document.getElementById("view-second-semester").addEventListener("click", function() {
    // Меняем заголовок h2
    document.querySelector("h2").textContent = "Второй семестр";

    const secondSemesterPractices = [
    "Базовое бэкенд-приложение", "HTTP-запросы", "JSON и работа с ним", "HTTP-ответы",
    "Проектирование API", "Роутинг и его настройка", "NoSQL базы данных", 
    "Обеспечение авторизации и доступа пользователей", "Работа сторонних сервисов уведомления и авторизации",
    "Основы ReactJS", "Работа с компонентами динамической DOM", "Использование хуков в React",
    "Основы микросервисной архитектуры", "Разработка классических модулей веб-приложений"
    ];

    const tableBody = document.querySelector("#practices-table tbody");
    tableBody.innerHTML = secondSemesterPractices.map((topic, index) => `
    <tr><td>${index + 1}</td><td>${topic}</td></tr>
    `).join('');
    });


    // Обработчики событий на фото студента
    const studentPhoto = document.getElementById("student-photo");

    studentPhoto.addEventListener("mouseover", function() {
    this.style.width = "220px";
    });

    studentPhoto.addEventListener("mouseout", function() {
    this.style.width = "200px";
    });

    studentPhoto.addEventListener("click", function() {
    this.src = "prepod.jpg";
    });

    studentPhoto.addEventListener("dblclick", function() {
    alert("Не налегай, у меня не так много любимых преподавателей");
    });

    document.querySelectorAll('.paragraph').forEach(paragraph => {
    paragraph.addEventListener('click', function() {
    this.classList.toggle('clicked');
    });

    const toggleLecturesButton = document.getElementById("toggleLectures");
    const lecturesTable = document.getElementById("lectures-table");

    // Обработчик события для кнопки
    toggleLecturesButton.addEventListener("click", function() {
    // Переключаем класс "show" для таблицы
    lecturesTable.classList.toggle("show");
    });
    });
});