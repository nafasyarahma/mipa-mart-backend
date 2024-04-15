const CartsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'carts',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const cartsHandler = new CartsHandler(service, validator);
    server.route(routes(cartsHandler));
  },
};
