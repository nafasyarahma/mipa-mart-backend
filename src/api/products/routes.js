const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/admin/products',
    handler: handler.postProductHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/admin/products',
    handler: handler.getAllProductsHandler,
  },
  {
    method: 'GET',
    path: '/admin/products/{id}',
    handler: handler.getProductByIdHandler,
  },
  {
    method: 'PUT',
    path: '/admin/products/{id}',
    handler: handler.putProductByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/admin/products/{id}',
    handler: handler.deleteProductByIdHandler,
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
