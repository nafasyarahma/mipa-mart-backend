const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/member/products',
    handler: handler.postProductHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 10485760,
      },
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/products',
    handler: handler.getMemberProductsHandler,
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
        maxBytes: 10485760,
      },
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/member/products/{id}/status',
    handler: handler.putProductStatusByIdHandler,
    options: {
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

  /* ================= CUSTOMER ================= */
  {
    method: 'POST',
    path: '/products/{id}/reviews',
    handler: handler.postProductReview,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  /* ================= KATALOG ================= */
  {
    method: 'GET',
    path: '/products',
    handler: handler.getAllProductsHandler,
  },
  {
    method: 'GET',
    path: '/products/{id}',
    handler: handler.getProductByIdHandler,
  },
  {
    method: 'GET',
    path: '/products/{id}/reviews',
    handler: handler.getProductReviewsHandler,
  },
];

module.exports = routes;
