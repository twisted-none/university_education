document.addEventListener('DOMContentLoaded', function() {

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Открытие модального окна
    const orderButtons = document.querySelectorAll('.service-item button');
    orderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceType = this.closest('.service-item').querySelector('h3').textContent.toLowerCase();
            openModal(serviceType);
        });
    });

    const myModal = new bootstrap.Modal(document.getElementById('modal'));
    window.openModal = function(serviceType) {
        const modalTitle = document.querySelector(".modal-title");
        const serviceInput = document.getElementById("serviceType");
        const serviceName = {
            'сайт-визитка': 'сайта-визитки',
            'корпоративный сайт': 'корпоративного сайта',
            'интернет-магазин': 'интернет-магазина'
        }[serviceType] || '';
        modalTitle.textContent = `Заказать разработку ${serviceName}`;
        serviceInput.value = serviceType;
        myModal.show();
    };

    window.closeModal = function() {
        myModal.hide();
    };

    window.onclick = function(event) {
        const modal = document.getElementById('modal');
        if (event.target == modal) closeModal();
    };

    // Обработка формы
    const formData = {
        name: '',
        email: '',
        phone: '',
        date: '',
        comment: '',
        printData() {
            console.log(`Имя: ${this.name}\nE-mail: ${this.email}\nТелефон: ${this.phone}\nДата: ${this.date}\nКомментарий: ${this.comment}`);
        }
    };

    function submitForm(e) {
        e.preventDefault();
        const { name, email, phone, date, comment } = e.target.elements;
    
        if (!name.value || !email.value || !comment.value) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }
    
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!email.value.match(emailRegex)) {
            alert('Пожалуйста, введите корректный E-mail.');
            return;
        }
    
        formData.name = name.value;
        formData.email = email.value;
        formData.phone = phone.value;
        formData.date = date.value;
        formData.comment = comment.value;
        formData.printData();
    
        // Закрываем модальное окно
        closeModal();
    
        // Показываем сообщение об успешной отправке
        showSuccessMessage("Форма отправлена!");
    
        e.target.reset(); // Сброс формы
    }
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', submitForm);
    }
    
    function showSuccessMessage(message) {
        const msgContainer = document.createElement('div');
        msgContainer.className = 'alert alert-success message';
        msgContainer.textContent = message;
    
        document.body.appendChild(msgContainer);
    
        setTimeout(() => {
            msgContainer.classList.add('fade-out');
            msgContainer.addEventListener('transitionend', () => msgContainer.remove());
        }, 2000);
    }
    
});