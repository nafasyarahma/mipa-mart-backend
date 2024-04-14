const DeliveryMethodsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'delivery methods',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const deliveryMethodsHandler = new DeliveryMethodsHandler(service, validator);
    server.route(routes(deliveryMethodsHandler));
  },
};
