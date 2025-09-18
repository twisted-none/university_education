// Main application logic for customer frontend
document.addEventListener('DOMContentLoaded', async () => {
    const productsContainer = document.getElementById('products-container');
    const categorySelect = document.getElementById('category-select');
    const toggleChatButton = document.getElementById('toggle-chat');
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendMessageButton = document.getElementById('send-message');
    const messagesContainer = document.getElementById('messages');

    // Initialize WebSocket connection
    try {
        await chatClient.connect();
        console.log('WebSocket connected');
        
        // Handle incoming messages
        chatClient.onMessage((message) => {
            if (message.type === 'chat') {
                displayMessage(message);
            }
        });
    } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
    }

    // Load categories and populate filter dropdown
    try {
        const { categories } = await graphqlClient.getCategories();
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }

    // Load products with details
    async function loadProducts(categoryId = null) {
        productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
        
        try {
            let data;
            
            if (categoryId && categoryId !== 'all') {
                data = await graphqlClient.getProductsByCategory(categoryId);
                displayProducts(data.productsByCategory);
            } else {
                data = await graphqlClient.getProductDetails();
                displayProducts(data.products);
            }
        } catch (error) {
            productsContainer.innerHTML = '<div class="error">Failed to load products</div>';
            console.error('Failed to load products:', error);
        }
    }

    // Display product cards
    function displayProducts(products) {
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }

        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            const productInfo = document.createElement('div');
            productInfo.className = 'product-info';
            
            const productName = document.createElement('h3');
            productName.className = 'product-name';
            productName.textContent = product.name;
            
            const productPrice = document.createElement('div');
            productPrice.className = 'product-price';
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            
            const productDescription = document.createElement('p');
            productDescription.className = 'product-description';
            productDescription.textContent = product.description;
            
            const categoriesDiv = document.createElement('div');
            categoriesDiv.className = 'product-categories';
            
            if (product.categories && product.categories.length > 0) {
                product.categories.forEach(categoryId => {
                    const categoryTag = document.createElement('span');
                    categoryTag.className = 'category-tag';
                    
                    // Find category name by ID
                    const categoryOption = categorySelect.querySelector(`option[value="${categoryId}"]`);
                    categoryTag.textContent = categoryOption ? categoryOption.textContent : categoryId;
                    
                    categoriesDiv.appendChild(categoryTag);
                });
            }
            
            productInfo.appendChild(productName);
            productInfo.appendChild(productPrice);
            productInfo.appendChild(productDescription);
            productInfo.appendChild(categoriesDiv);
            
            productCard.appendChild(productInfo);
            productsContainer.appendChild(productCard);
        });
    }

    // Handle category filter change
    categorySelect.addEventListener('change', (e) => {
        const categoryId = e.target.value;
        loadProducts(categoryId);
    });

    // Toggle chat box
    toggleChatButton.addEventListener('click', () => {
        const isVisible = chatBox.style.display === 'block';
        chatBox.style.display = isVisible ? 'none' : 'block';
        toggleChatButton.textContent = isVisible ? 'Open Chat' : 'Close Chat';
    });

    // Send chat message
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const message = chatClient.sendMessage(text);
            displayMessage(message);
            messageInput.value = '';
        }
    }

    sendMessageButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Display chat message
    function displayMessage(message) {
        const messageElement = document.createElement('div');
        
        if (message.userType === 'customer') {
            messageElement.className = 'user-message';
        } else if (message.userType === 'admin') {
            messageElement.className = 'admin-message';
        } else {
            messageElement.className = 'system-message';
        }
        
        messageElement.textContent = message.text;
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Initial load of products
    loadProducts();
});