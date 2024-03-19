const routes = (handler) => [
  {
    method: 'POST',
    path: '/admin/categories',
    handler: handler.postCategoryHandler,
  },
  {
    method: 'GET',
    path: '/admin/categories',
    handler: handler.getAllCategoryHandler,
  },
  {
    method: 'PUT',
    path: '/admin/categories/{id}',
    handler: handler.putCategoryByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/admin/categories/{id}',
    handler: handler.deleteCategoryByIdHandler,
  },
];

module.exports = routes;
