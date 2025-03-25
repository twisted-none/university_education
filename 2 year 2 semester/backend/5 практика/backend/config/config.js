require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h'
};