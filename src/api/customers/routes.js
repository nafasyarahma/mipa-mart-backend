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
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/admin/customers/{id}',
    handler: handler.getCustomerByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/admin/customers/{id}',
    handler: handler.putCustomerByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/admin/customers/{id}',
    handler: handler.deleteCustomerByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  {
    method: 'GET',
    path: '/verify-email/{token}',
    handler: handler.verifyCustomerEmailHandler,
  },
];

module.exports = routes;
