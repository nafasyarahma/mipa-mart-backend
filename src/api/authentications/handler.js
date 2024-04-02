const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, membersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._membersService = membersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  // proses login disini
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password, role } = request.payload;
    await this._membersService.checkVerificationStatus(username);

    const id = await this._membersService.verifyMemberCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id, role });
    const refreshToken = this._tokenManager.generateRefreshToken({ id, role });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  // memperbarui access token
  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    // verifikasi refresh token di db
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    // verifikasi keaslian signatute token
    const { id, role } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id, role });
    return {
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  // logout
  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
