const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/products.json');

// Middleware to ensure products.json exists
const ensureDataFile = (req, res, next) => {
  if (!fs.existsSync(dataPath)) {
    const initialData = {
      products: [],
      categories: []
    };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
  next();
};

router.use(ensureDataFile);

// Helper functions
const readData = () => {
  const rawData = fs.readFileSync(dataPath);
  return JSON.parse(rawData);
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all products
router.get('/', (req, res) => {
  const data = readData();
  res.json(data.products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const data = readData();
  const product = data.products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Add one or more products
router.post('/', (req, res) => {
  const data = readData();
  const newProducts = Array.isArray(req.body) ? req.body : [req.body];
  
  // Generate new IDs if not provided
  newProducts.forEach(product => {
    if (!product.id) {
      // Generate unique ID (simple implementation)
      const maxId = data.products.reduce((max, p) => {
        const id = parseInt(p.id);
        return id > max ? id : max;
      }, 0);
      product.id = String(maxId + 1);
    }
  });
  
  data.products = [...data.products, ...newProducts];
  
  // Update categories if needed
  newProducts.forEach(product => {
    if (product.categories) {
      product.categories.forEach(category => {
        if (!data.categories.some(c => c.id === category)) {
          data.categories.push({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1)
          });
        }
      });
    }
  });
  
  writeData(data);
  res.status(201).json({ message: 'Product(s) added successfully' });
});

// Update product by ID
router.put('/:id', (req, res) => {
  const data = readData();
  const index = data.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Preserve the original ID
  const updatedProduct = {
    ...req.body,
    id: req.params.id
  };
  
  data.products[index] = updatedProduct;
  
  // Update categories if needed
  if (updatedProduct.categories) {
    updatedProduct.categories.forEach(category => {
      if (!data.categories.some(c => c.id === category)) {
        data.categories.push({
          id: category,
          name: category.charAt(0).toUpperCase() + category.slice(1)
        });
      }
    });
  }
  
  writeData(data);
  res.json({ message: 'Product updated successfully' });
});

// Delete product by ID
router.delete('/:id', (req, res) => {
  const data = readData();
  const index = data.products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  data.products.splice(index, 1);
  writeData(data);
  res.json({ message: 'Product deleted successfully' });
});

// Get all categories
router.get('/categories/all', (req, res) => {
  const data = readData();
  res.json(data.categories);
});

module.exports = router;