const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const schema = require('./schema');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Ensure products.json exists
const productsFile = path.join(dataDir, 'products.json');
if (!fs.existsSync(productsFile)) {
  // Copy the products.json file from admin-app/backend/data if it exists
  const adminProductsFile = path.join(__dirname, '../../admin-app/backend/data/products.json');
  
  if (fs.existsSync(adminProductsFile)) {
    fs.copyFileSync(adminProductsFile, productsFile);
  } else {
    // Create a default products file
    const defaultProducts = {
      "products": [
        {
          "id": "1",
          "name": "Laptop Pro X",
          "price": 1299.99,
          "description": "Powerful laptop with 16GB RAM, 512GB SSD, and a 15-inch display.",
          "categories": ["electronics", "computers"]
        },
        {
          "id": "2",
          "name": "Wireless Headphones",
          "price": 199.99,
          "description": "Noise-cancelling headphones with 30-hour battery life.",
          "categories": ["electronics"]
        },
        {
          "id": "3",
          "name": "Smart Watch",
          "price": 249.99,
          "description": "Fitness tracking, heart rate monitoring, and smart notifications.",
          "categories": ["electronics", "wearables"]
        },
        {
          "id": "4",
          "name": "Coffee Maker",
          "price": 89.99,
          "description": "12-cup programmable coffee maker with auto shut-off.",
          "categories": ["home"]
        },
        {
          "id": "5",
          "name": "Desk Lamp",
          "price": 39.99,
          "description": "Adjustable LED desk lamp with multiple brightness levels.",
          "categories": ["home"]
        }
      ],
      "categories": [
        {
          "id": "electronics",
          "name": "Electronics"
        },
        {
          "id": "computers",
          "name": "Computers"
        },
        {
          "id": "wearables",
          "name": "Wearables"
        },
        {
          "id": "home",
          "name": "Home Goods"
        }
      ]
    };
    
    fs.writeFileSync(productsFile, JSON.stringify(defaultProducts, null, 2));
  }
}

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // Enable GraphiQL interface for development
}));

// Serve customer frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// GraphQL Schema documentation endpoint
app.get('/schema', (req, res) => {
  res.json({
    title: 'E-Commerce Customer GraphQL API',
    description: 'GraphQL API for retrieving product information',
    types: [
      {
        name: 'Product',
        fields: [
          { name: 'id', type: 'ID' },
          { name: 'name', type: 'String' },
          { name: 'price', type: 'Float' },
          { name: 'description', type: 'String' },
          { name: 'categories', type: '[String]' },
          { name: 'categoryDetails', type: '[Category]' }
        ]
      },
      {
        name: 'Category',
        fields: [
          { name: 'id', type: 'ID' },
          { name: 'name', type: 'String' }
        ]
      },
      {
        name: 'ProductName',
        fields: [
          { name: 'id', type: 'ID' },
          { name: 'name', type: 'String' }
        ]
      },
      {
        name: 'ProductPrice',
        fields: [
          { name: 'id', type: 'ID' },
          { name: 'name', type: 'String' },
          { name: 'price', type: 'Float' }
        ]
      },
      {
        name: 'ProductDescription',
        fields: [
          { name: 'id', type: 'ID' },
          { name: 'name', type: 'String' },
          { name: 'description', type: 'String' }
        ]
      }
    ],
    queries: [
      {
        name: 'products',
        description: 'Get all products',
        type: '[Product]'
      },
      {
        name: 'product',
        description: 'Get product by ID',
        type: 'Product',
        args: [{ name: 'id', type: 'ID!' }]
      },
      {
        name: 'categories',
        description: 'Get all categories',
        type: '[Category]'
      },
      {
        name: 'productsByCategory',
        description: 'Get products by category',
        type: '[Product]',
        args: [{ name: 'categoryId', type: 'String!' }]
      },
      {
        name: 'productNames',
        description: 'Get only product names',
        type: '[ProductName]'
      },
      {
        name: 'productPrices',
        description: 'Get only product prices',
        type: '[ProductPrice]'
      },
      {
        name: 'productDescriptions',
        description: 'Get only product descriptions',
        type: '[ProductDescription]'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Customer server running on port ${PORT}`);
});