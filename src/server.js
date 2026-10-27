
require('dotenv').config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../openapi.json');

const linksRouter = require('./routes/links');
const redirectRouter = require('./routes/redirect');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API de links temporários funcionando.'
  });
});

app.use('/links', linksRouter);
app.use('/l', redirectRouter);

const PORT = process.env.PORT || 3033;

const openApiDocument = {
  ...swaggerDocument,
  servers: [
    {
      url: (process.env.BASE_URL || `http://localhost:${PORT}`)
        .replace(/\/+$/, ''),
      description: 'Servidor da API'
    }
  ]
};

app.get('/openapi.json', (req, res) => {
  res.json(openApiDocument);
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

app.listen(PORT, () => {
  console.log(`API executando na porta ${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI: http://localhost:${PORT}/openapi.json`);
});
