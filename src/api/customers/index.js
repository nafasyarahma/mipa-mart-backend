const CustomersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'customers',
  version: '1.0.0',
  register: async (server, {
    service, adminService, emailService, validator,
  }) => {
    const customersHandler = new CustomersHandler(service, adminService, emailService, validator);
    server.route(routes(customersHandler));
  },
};
