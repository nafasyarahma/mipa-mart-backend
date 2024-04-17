const routes = (handler) => [
  {
    method: 'POST',
    path: '/member/payment-methods',
    handler: handler.postPaymentMethodHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/payment-methods',
    handler: handler.getMemberPaymentMethods,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/member/payment-methods/{id}',
    handler: handler.deletePaymentMethodByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  // CUSTOMER
  {
    method: 'GET',
    path: '/customer/order/payment-methods',
    handler: handler.getCartItemPaymentMethodsHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
