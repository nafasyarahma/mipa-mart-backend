const routes = (handler) => [
  /* =============== CUSTOMER =============== */
  {
    method: 'POST',
    path: '/customer/register',
    handler: handler.postCustomerHandler,
  },
  {
    method: 'GET',
    path: '/customer/profile',
    handler: handler.getCustomerProfileHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/customer/profile',
    handler: handler.putCustomerProfileHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  /* ================ ADMIN ================ */
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
