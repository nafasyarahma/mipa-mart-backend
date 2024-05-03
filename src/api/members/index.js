const MembersService = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'members',
  version: '1.0.0',
  register: async (server, {
    service, adminService, emailService, validator,
  }) => {
    const membersHandler =
    new MembersService(service, adminService, emailService, validator);
    server.route(routes(membersHandler));
  },
};
