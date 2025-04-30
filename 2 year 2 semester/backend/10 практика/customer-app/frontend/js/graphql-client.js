/**
 * GraphQL Client for the Customer Application
 */
class GraphQLClient {
    constructor(endpoint = '/graphql') {
      this.endpoint = endpoint;
    }
  
    /**
     * Execute a GraphQL query
     * @param {string} query - The GraphQL query
     * @param {Object} variables - Query variables
     * @returns {Promise} - Response data
     */
    async query(query, variables = {}) {
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables
          })
        });
  
        const result = await response.json();
        
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          throw new Error('GraphQL query failed');
        }
        
        return result.data;
      } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
      }
    }
  
    /**
     * Get all products with full details
     * @returns {Promise} - Products data
     */
    async getAllProducts() {
      const query = `
        query {
          products {
            id
            name
            price
            description
            categories
            categoryDetails {
              id
              name
            }
          }
        }
      `;
      
      const result = await this.query(query);
      return result.products;
    }
  
    /**
     * Get all products with only names and prices
     * @returns {Promise} - Products with names and prices
     */
    async getProductNamesAndPrices() {
      const query = `
        query {
          productPrices {
            id
            name
            price
          }
        }
      `;
      
      const result = await this.query(query);
      return result.productPrices;
    }
  
    /**
     * Get all products with only names and descriptions
     * @returns {Promise} - Products with names and descriptions
     */
    async getProductNamesAndDescriptions() {
      const query = `
        query {
          productDescriptions {
            id
            name
            description
          }
        }
      `;
      
      const result = await this.query(query);
      return result.productDescriptions;
    }
  
    /**
     * Get a product by ID
     * @param {string} id - Product ID
     * @returns {Promise} - Product data
     */
    async getProductById(id) {
      const query = `
        query($id: ID!) {
          product(id: $id) {
            id
            name
            price
            description
            categories
            categoryDetails {
              id
              name
            }
          }
        }
      `;
      
      const variables = { id };
      const result = await this.query(query, variables);
      return result.product;
    }
  
    /**
     * Get all categories
     * @returns {Promise} - Categories data
     */
    async getCategories() {
      const query = `
        query {
          categories {
            id
            name
          }
        }
      `;
      
      const result = await this.query(query);
      return result.categories;
    }
  
    /**
     * Get products by category
     * @param {string} categoryId - Category ID
     * @returns {Promise} - Products in the category
     */
    async getProductsByCategory(categoryId) {
      const query = `
        query($categoryId: String!) {
          productsByCategory(categoryId: $categoryId) {
            id
            name
            price
            description
            categories
          }
        }
      `;
      
      const variables = { categoryId };
      const result = await this.query(query, variables);
      return result.productsByCategory;
    }
  }
  
  // Export the client
  window.GraphQLClient = GraphQLClient;