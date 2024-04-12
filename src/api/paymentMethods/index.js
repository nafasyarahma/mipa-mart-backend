const PaymentMethodsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'payment methods',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const paymentMethodsHandler = new PaymentMethodsHandler(service, validator);
    server.route(routes(paymentMethodsHandler));
  },
};
