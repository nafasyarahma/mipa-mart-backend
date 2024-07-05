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
        maxBytes: 10485760,
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
    path: '/customer/orders/history',
    handler: handler.getCustomerOrderHistoryHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/customer/orders/{id}/complete',
    handler: handler.completeOrderHandler,
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
    method: 'PUT',
    path: '/member/orders/{id}/payment-status',
    handler: handler.changePaymentStatusHandler,
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
  {
    method: 'GET',
    path: '/member/orders/history',
    handler: handler.getMemberOrderHistoryHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
