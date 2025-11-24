const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie Theatre customer API',
      version: '1.0.0',
      description: 'API documentation for customer backend',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' }
    ],
  },
  // finds all route-files with swagger-comments
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
