const InvariantError = require('../../exceptions/InvariantError');
const { CartPayloadSchema, QuantityPayloadSchema } = require('./schema');

const CartsValidator = {
  validateCartPayload: (payload) => {
    const validationResult = CartPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateQuantityPayload: (payload) => {
    const validationResult = QuantityPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CartsValidator;
