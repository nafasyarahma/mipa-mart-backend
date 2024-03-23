const InvariantError = require('../../exceptions/InvariantError');
const { MemberPayloadSchema, MemberStatusPayloadSchema } = require('./schema');

const MembersValidator = {
  validateMemberPayload: (payload) => {
    const validationResult = MemberPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateMemberStatusPayload: (payload) => {
    const validationResult = MemberStatusPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

};

module.exports = MembersValidator;
