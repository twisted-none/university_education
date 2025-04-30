const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/products', productsRoutes);

// Serve admin panel
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// API Specification
app.get('/api-spec', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Admin API',
      description: 'API for managing products in the e-commerce store',
      version: '1.0.0',
    },
    paths: {
      '/api/products': {
        get: {
          summary: 'Get all products',
          responses: {
            '200': {
              description: 'A list of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Add one or more products',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/Product' },
                    {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' }
                    }
                  ]
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Product(s) added successfully'
            }
          }
        }
      },
      '/api/products/{id}': {
        get: {
          summary: 'Get product by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'A product',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Product' }
                }
              }
            },
            '404': {
              description: 'Product not found'
            }
          }
        },
        put: {
          summary: 'Update product by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product updated successfully'
            },
            '404': {
              description: 'Product not found'
            }
          }
        },
        delete: {
          summary: 'Delete product by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Product deleted successfully'
            },
            '404': {
              description: 'Product not found'
            }
          }
        }
      }
    },
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'price', 'description', 'categories'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            categories: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
});