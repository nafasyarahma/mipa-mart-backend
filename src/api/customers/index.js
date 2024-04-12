const CustomersService = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'customers',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const customersHandler = new CustomersService(service, validator);
    server.route(routes(customersHandler));
  },
};
