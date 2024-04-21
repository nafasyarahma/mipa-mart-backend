const OrdersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'orders',
  version: '1.0.0',
  register: async (server, {
    service, paymentMethodsService, deliveryMethodsService, validator,
  }) => {
    const ordersHandler =
    new OrdersHandler(service, paymentMethodsService, deliveryMethodsService, validator);
    server.route(routes(ordersHandler));
  },
};
