const InvariantError = require('../../exceptions/InvariantError');
const { OrderPayloadSchema, OrderStatusPayloadSchema } = require('./schema');

const OrdersValidator = {
  validateOrderPayload: (payload) => {
    const validationResult = OrderPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateOrderStatusPayload: (payload) => {
    const validationResult = OrderStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = OrdersValidator;
