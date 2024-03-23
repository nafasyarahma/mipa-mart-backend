const MembersService = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'members',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const categoriesHandler = new MembersService(service, validator);
    server.route(routes(categoriesHandler));
  },
};
