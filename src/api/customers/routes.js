const routes = (handler) => [
  {
    method: 'POST',
    path: '/customers/register',
    handler: handler.postCustomerHandler,
  },
  {
    method: 'GET',
    path: '/admin/customers',
    handler: handler.getAllCustomersHandler,
  },
  {
    method: 'GET',
    path: '/admin/customers/{id}',
    handler: handler.getCustomerByIdHandler,
  },
  {
    method: 'PUT',
    path: '/admin/customers/{id}',
    handler: handler.putCustomerByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/admin/customers/{id}',
    handler: handler.deleteCustomerByIdHandler,
  },
];

module.exports = routes;
