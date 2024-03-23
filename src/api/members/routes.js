const routes = (handler) => [
  // member
  {
    method: 'POST',
    path: '/member/register',
    handler: handler.postMemberHandler,
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
];

module.exports = routes;
