const routes = (handler) => [
  {
    method: 'POST',
    path: '/customer/carts',
    handler: handler.postItemToCartHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/customer/carts',
    handler: handler.getCartsHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/customer/carts/{id}',
    handler: handler.getCartByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/customer/carts/item/{id}',
    handler: handler.putQuantityHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/customer/carts/item/{id}',
    handler: handler.deleteItemFromCartHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
