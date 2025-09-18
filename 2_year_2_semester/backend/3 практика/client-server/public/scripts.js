// Глобальные переменные
let products = [];
let categories = [];
let currentCategory = 'all';

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});

// Функция для загрузки товаров
async function fetchProducts(categoryId = null) {
  try {
    let url = '/api/products';
    if (categoryId && categoryId !== 'all') {
      url = `/api/products/category/${categoryId}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    products = data.products;
    categories = data.categories;
    
    renderCategories();
    renderProducts();
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    document.getElementById('products-container').innerHTML = 
      '<div class="error">Ошибка при загрузке товаров. Пожалуйста, попробуйте позже.</div>';
  }
}

// Функция для отображения категорий
function renderCategories() {
  const navElement = document.getElementById('categories-nav').querySelector('ul');
  
  // Очищаем текущие категории, оставляя только "Все товары"
  navElement.innerHTML = '<li><a href="#" data-category="all" class="active">Все товары</a></li>';
  
  // Добавляем категории из загруженных данных
  categories.forEach(category => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    
    link.textContent = category.name;
    link.setAttribute('href', '#');
    link.setAttribute('data-category', category.id);
    
    if (currentCategory === category.id) {
      link.classList.add('active');
    }
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Удаляем класс active со всех ссылок
      document.querySelectorAll('#categories-nav a').forEach(el => {
        el.classList.remove('active');
      });
      
      // Добавляем класс active на кликнутую ссылку
      e.target.classList.add('active');
      
      currentCategory = category.id;
      fetchProducts(currentCategory);
    });
    
    listItem.appendChild(link);
    navElement.appendChild(listItem);
  });
  
  // Добавляем обработчик для "Все товары"
  document.querySelector('[data-category="all"]').addEventListener('click', (e) => {
    e.preventDefault();
    
    // Удаляем класс active со всех ссылок
    document.querySelectorAll('#categories-nav a').forEach(el => {
      el.classList.remove('active');
    });
    
    // Добавляем класс active на кликнутую ссылку
    e.target.classList.add('active');
    
    currentCategory = 'all';
    fetchProducts();
  });
}

// Функция для отображения товаров
function renderProducts() {
  const container = document.getElementById('products-container');
  container.innerHTML = '';
  
  if (products.length === 0) {
    container.innerHTML = '<div class="no-products">Товары не найдены</div>';
    return;
  }
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Получаем названия категорий товара
    const productCategories = product.categories.map(catId => {
      const category = categories.find(c => c.id === catId);
      return category ? category.name : catId;
    });
    
    card.innerHTML = `
      <div class="product-card-content">
        <h2>${product.name}</h2>
        <div class="price">${formatPrice(product.price)} ₽</div>
        <div class="description">${product.description}</div>
        <div class="product-categories">
          ${productCategories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Форматирование цены
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}