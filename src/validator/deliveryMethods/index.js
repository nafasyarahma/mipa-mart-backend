const InvariantError = require('../../exceptions/InvariantError');
const { DeliveryMethodPayloadSchema, PutDeliveryMethodPayloadSchema } = require('./schema');

const DeliveryMethodsValidator = {
  validateDeliveryMethodPayload: (payload) => {
    const validationResult = DeliveryMethodPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutDeliveryMethodPayload: (payload) => {
    const validationResult = PutDeliveryMethodPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = DeliveryMethodsValidator;
