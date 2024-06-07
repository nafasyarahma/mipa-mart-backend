const routes = (handler) => [
  {
    method: 'POST',
    path: '/member/delivery-methods',
    handler: handler.postDeliveryMethodHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/delivery-methods',
    handler: handler.getMemberDeliveryMethodsHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/member/delivery-methods/{id}',
    handler: handler.getMemberDeliveryMethodByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/member/delivery-methods/{id}',
    handler: handler.putMemberDeliveryMethodByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/member/delivery-methods/{id}',
    handler: handler.deleteDeliveryMethodByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  // CUSTOMER
  {
    method: 'GET',
    path: '/customer/order/delivery-methods',
    handler: handler.getSellerDeliveryMethodsHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
