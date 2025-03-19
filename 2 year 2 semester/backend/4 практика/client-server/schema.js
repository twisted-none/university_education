const { gql } = require('apollo-server-express');

// Определение схемы GraphQL
const typeDefs = gql`
  # Тип для товара
  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String!
    categories: [String!]!
  }

  # Тип для категории
  type Category {
    id: String!
    name: String!
  }

  # Основной тип запроса
  type Query {
    # Получить все товары
    products: [Product!]!
    
    # Получить товар по ID
    product(id: ID!): Product
    
    # Получить товары по категории
    productsByCategory(categoryId: String!): [Product!]!
    
    # Получить все категории
    categories: [Category!]!
  }
`;

module.exports = typeDefs;