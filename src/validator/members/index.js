const InvariantError = require('../../exceptions/InvariantError');
const {
  MemberPayloadSchema,
  KtmImageHeadersSchema,
  MemberStatusPayloadSchema,
  PutMemberPayloadSchema,
  ForgotPasswordPayloadSchema,
} = require('./schema');

const MembersValidator = {
  validateMemberPayload: (payload) => {
    const validationResult = MemberPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateKtmImageHeaders: (payload) => {
    const validationResult = KtmImageHeadersSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutMemberPayload: (payload) => {
    const validationResult = PutMemberPayloadSchema.validate(payload);

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

  validateForgotPasswordPayload: (payload) => {
    const validationResult = ForgotPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

};

module.exports = MembersValidator;
