const { 
    GraphQLObjectType, 
    GraphQLSchema, 
    GraphQLString, 
    GraphQLList, 
    GraphQLFloat, 
    GraphQLID 
  } = require('graphql');
  const fs = require('fs');
  const path = require('path');
  
  // Path to data file
  const dataPath = path.join(__dirname, 'data/products.json');
  
  // Helper to read data
  const readData = () => {
    const rawData = fs.readFileSync(dataPath);
    return JSON.parse(rawData);
  };
  
  // Define Category Type
  const CategoryType = new GraphQLObjectType({
    name: 'Category',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString }
    })
  });
  
  // Define Product Type
  const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      price: { type: GraphQLFloat },
      description: { type: GraphQLString },
      categories: { 
        type: new GraphQLList(GraphQLString)
      },
      categoryDetails: {
        type: new GraphQLList(CategoryType),
        resolve(parent, args) {
          const data = readData();
          return parent.categories.map(categoryId => 
            data.categories.find(cat => cat.id === categoryId)
          );
        }
      }
    })
  });
  
  // Define Product Name Type (only name and id)
  const ProductNameType = new GraphQLObjectType({
    name: 'ProductName',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString }
    })
  });
  
  // Define Product Price Type (only price and id)
  const ProductPriceType = new GraphQLObjectType({
    name: 'ProductPrice',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      price: { type: GraphQLFloat }
    })
  });
  
  // Define Product Description Type (only description and id)
  const ProductDescriptionType = new GraphQLObjectType({
    name: 'ProductDescription',
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      description: { type: GraphQLString }
    })
  });
  
  // Root Query
  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      // Get all products
      products: {
        type: new GraphQLList(ProductType),
        resolve(parent, args) {
          const data = readData();
          return data.products;
        }
      },
      // Get product by ID
      product: {
        type: ProductType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          const data = readData();
          return data.products.find(product => product.id === args.id);
        }
      },
      // Get all categories
      categories: {
        type: new GraphQLList(CategoryType),
        resolve(parent, args) {
          const data = readData();
          return data.categories;
        }
      },
      // Get products by category
      productsByCategory: {
        type: new GraphQLList(ProductType),
        args: { categoryId: { type: GraphQLString } },
        resolve(parent, args) {
          const data = readData();
          return data.products.filter(product => 
            product.categories.includes(args.categoryId)
          );
        }
      },
      // Get only product names
      productNames: {
        type: new GraphQLList(ProductNameType),
        resolve(parent, args) {
          const data = readData();
          return data.products.map(product => ({
            id: product.id,
            name: product.name
          }));
        }
      },
      // Get only product prices
      productPrices: {
        type: new GraphQLList(ProductPriceType),
        resolve(parent, args) {
          const data = readData();
          return data.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price
          }));
        }
      },
      // Get only product descriptions
      productDescriptions: {
        type: new GraphQLList(ProductDescriptionType),
        resolve(parent, args) {
          const data = readData();
          return data.products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description
          }));
        }
      }
    }
  });
  
  module.exports = new GraphQLSchema({
    query: RootQuery
  });