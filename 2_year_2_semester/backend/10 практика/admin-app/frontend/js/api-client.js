/**
 * REST API Client for Admin Application
 */
class ApiClient {
    constructor(baseUrl = '/api') {
      this.baseUrl = baseUrl;
    }
  
    /**
     * Make a request to the API
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object} data - Request data
     * @returns {Promise} - Response data
     */
    async request(endpoint, method = 'GET', data = null) {
      const url = `${this.baseUrl}${endpoint}`;
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      try {
        const response = await fetch(url, options);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.message || 'API request failed');
          }
          
          return result;
        } else {
          const text = await response.text();
          
          if (!response.ok) {
            throw new Error(text || 'API request failed');
          }
          
          return { message: text };
        }
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    }
  
    /**
     * Get all products
     * @returns {Promise} - Products data
     */
    async getProducts() {
      return this.request('/products');
    }
  
    /**
     * Get product by ID
     * @param {string} id - Product ID
     * @returns {Promise} - Product data
     */
    async getProductById(id) {
      return this.request(`/products/${id}`);
    }
  
    /**
     * Add a new product
     * @param {Object} product - Product data
     * @returns {Promise} - Response data
     */
    async addProduct(product) {
      return this.request('/products', 'POST', product);
    }
  
    /**
     * Add multiple products
     * @param {Array} products - Array of product data
     * @returns {Promise} - Response data
     */
    async addProducts(products) {
      return this.request('/products', 'POST', products);
    }
  
    /**
     * Update a product
     * @param {string} id - Product ID
     * @param {Object} product - Updated product data
     * @returns {Promise} - Response data
     */
    async updateProduct(id, product) {
      return this.request(`/products/${id}`, 'PUT', product);
    }
  
    /**
     * Delete a product
     * @param {string} id - Product ID
     * @returns {Promise} - Response data
     */
    async deleteProduct(id) {
      return this.request(`/products/${id}`, 'DELETE');
    }
  
    /**
     * Get all categories
     * @returns {Promise} - Categories data
     */
    async getCategories() {
      return this.request('/products/categories/all');
    }
  }
  
  // Export the client
  window.ApiClient = ApiClient;