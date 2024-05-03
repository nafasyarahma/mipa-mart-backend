const InvariantError = require('../../exceptions/InvariantError');
const { CategoryPayloadSchema, PutCategoryPayloadSchema } = require('./schema');

const CategoriesValidator = {
  validateCategoryPayload: (payload) => {
    const validationResult = CategoryPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutCategoryPayload: (payload) => {
    const validationResult = PutCategoryPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CategoriesValidator;
