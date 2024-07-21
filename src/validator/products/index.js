const InvariantError = require('../../exceptions/InvariantError');
const {
  ProductPayloadSchema,
  ImageHeadersSchema,
  ProductStatusPayloadSchema,
  ProductReviewPayloadSchema,
} = require('./schema');

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

  validateProductStatusPayload: (payload) => {
    const validationResult = ProductStatusPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateProductReviewPayload: (payload) => {
    const validationResult = ProductReviewPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ProductsValidator;
