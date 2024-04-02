const path = require('path');

const routes = (handler) => [
  // -- MEMBER --
  {
    method: 'POST',
    path: '/member/products',
    handler: handler.postProductHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 100485760,
      },
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/products',
    handler: handler.getProductsHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/products/{id}',
    handler: handler.getProductByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/member/products/{id}',
    handler: handler.putProductByIdHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 100485760,
      },
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/member/products/{id}',
    handler: handler.deleteProductByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/upload/images/product/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../../static/upload/images/product'),
      },
    },
  },
];

module.exports = routes;
