const InvariantError = require('../../exceptions/InvariantError');
const { CustomerPayloadSchema, PutCustomerPayloadSchema } = require('./schema');

const CustomersValidator = {
  validateCustomerPayload: (payload) => {
    const validationResult = CustomerPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutCustomerPayload: (payload) => {
    const validationResult = PutCustomerPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CustomersValidator;
