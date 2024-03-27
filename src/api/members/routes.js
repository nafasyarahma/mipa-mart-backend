const path = require('path');

const routes = (handler) => [
  // member
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

  // admin
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
];

module.exports = routes;
