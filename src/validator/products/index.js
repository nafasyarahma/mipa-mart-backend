const InvariantError = require('../../exceptions/InvariantError');
const { ProductPayloadSchema } = require('./schema');

const ProductValidator = {
  validateProductPayload: (payload) => {
    const validationResult = ProductPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductValidator;
