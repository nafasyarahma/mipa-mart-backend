const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/customer/orders',
    handler: handler.postOrdersHandler,
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
    path: '/customer/orders',
    handler: handler.getCustomerOrderListHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/customer/orders/{id}',
    handler: handler.getCustomerOrderDetailHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/upload/images/payment/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../../static/upload/images/payment'),
      },
    },
  },
  /* ================= MEMBER ================= */
  {
    method: 'GET',
    path: '/member/orders',
    handler: handler.getMemberOrderListHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/member/orders/{id}/status',
    handler: handler.changeOrderStatusHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/orders/{id}',
    handler: handler.getMemberOrderDetailHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
