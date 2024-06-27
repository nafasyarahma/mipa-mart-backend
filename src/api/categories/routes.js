const routes = (handler) => [
  // admin
  {
    method: 'POST',
    path: '/admin/categories',
    handler: handler.postCategoryHandler,
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

  // public
  {
    method: 'GET',
    path: '/categories',
    handler: handler.getAllCategoryHandler,
  },
  {
    method: 'GET',
    path: '/categories/{id}',
    handler: handler.getCategoryByIdHandler,
  },
];

module.exports = routes;
