const MembersService = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'members',
  version: '1.0.0',
  register: async (server, {
    service, adminService, storageService, validator,
  }) => {
    const membersHandler = new MembersService(service, storageService, adminService, validator);
    server.route(routes(membersHandler));
  },
};
