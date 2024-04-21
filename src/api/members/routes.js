const path = require('path');

const routes = (handler) => [
  /* =============== MEMBER =============== */
  {
    method: 'POST',
    path: '/member/register',
    handler: handler.postMemberHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/member/profile',
    handler: handler.getMemberProfileHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/member/profile',
    handler: handler.putMemberProfileHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  /* ================ ADMIN ================ */
  {
    method: 'GET',
    path: '/admin/members',
    handler: handler.getAllMembersHandler,
  },
  {
    method: 'GET',
    path: '/admin/members/{id}',
    handler: handler.getMemberByIdHandler,
  },
  {
    method: 'PUT',
    path: '/admin/members/{id}',
    handler: handler.putMemberByIdHandler,
  },
  {
    method: 'PUT',
    path: '/admin/members/{id}/status',
    handler: handler.putMemberStatusByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/admin/members/{id}',
    handler: handler.deleteMemberByIdHandler,
  },
  {
    method: 'GET',
    path: '/upload/images/ktm/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../../static/upload/images/ktm'),
      },
    },
  },
  {
    method: 'GET',
    path: '/members/{id}',
    handler: handler.getMemberWithProductsHandler,
  },
];

module.exports = routes;
