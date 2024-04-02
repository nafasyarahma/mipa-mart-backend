const InvariantError = require('../../exceptions/InvariantError');
const { ProductPayloadSchema, ImageHeadersSchema } = require('./schema');

const ProductsValidator = {
  validateProductPayload: (payload) => {
    const validationResult = ProductPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductsValidator;
