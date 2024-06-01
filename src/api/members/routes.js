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
  {
    method: 'POST',
    path: '/member/email-verification',
    handler: handler.postMemberEmailVerification,
    options: {
      auth: 'mipamart_jwt',
    },
  },

  /* ================ ADMIN ================ */
  {
    method: 'GET',
    path: '/admin/members',
    handler: handler.getAllMembersHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'GET',
    path: '/admin/members/{id}',
    handler: handler.getMemberByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/admin/members/{id}',
    handler: handler.putMemberByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/admin/members/{id}/status',
    handler: handler.putMemberStatusByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/admin/members/{id}',
    handler: handler.deleteMemberByIdHandler,
    options: {
      auth: 'mipamart_jwt',
    },
  },
  // + autentikasi admin
  {
    method: 'GET',
    path: '/upload/images/ktm/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../../static/upload/images/ktm'),
      },
    },
  },

  /* ================ COMMON ================ */
  {
    method: 'GET',
    path: '/members/{id}',
    handler: handler.getMemberWithProductsHandler,
  },
  {
    method: 'GET',
    path: '/member/verify-email/{token}',
    handler: handler.verifyMemberEmailHandler,
  },
  {
    method: 'POST',
    path: '/member/forgot-password',
    handler: handler.memberForgotPasswordHandler,
  },
  {
    method: 'POST',
    path: '/member/reset-email/{token}',
    handler: handler.resetMemberPasswordHandler,
  },
];

module.exports = routes;
