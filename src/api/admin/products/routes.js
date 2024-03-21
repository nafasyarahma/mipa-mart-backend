const routes = (handler) => [
  {
    method: 'POST',
    path: '/admin/products',
    handler: handler.postProductHandler,
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
];

module.exports = routes;
