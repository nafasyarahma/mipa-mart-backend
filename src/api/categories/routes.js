const routes = (handler) => [
  {
    method: 'POST',
    path: '/admin/categories',
    handler: handler.postCategoryHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/admin/categories',
    handler: handler.getAllCategoryHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/admin/categories/{id}',
    handler: handler.putCategoryByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/admin/categories/{id}',
    handler: handler.deleteCategoryByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
];

module.exports = routes;
