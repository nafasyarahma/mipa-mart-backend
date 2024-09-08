const autoBind = require('auto-bind');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class AuthenticationsHandler {
  constructor(
    authenticationsService,
    membersService,
    customersService,
    adminService,
    tokenManager,
    validator,
  ) {
    this._authenticationsService = authenticationsService;
    this._membersService = membersService;
    this._adminService = adminService;
    this._customersService = customersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    autoBind(this);
  }

  // Login
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;

    let id;
    let role;

    // check admin
    id = await this._adminService.verifyAdminCredential(username, password);
    if (id) {
      role = 'admin';
    }

    // check member
    if (!id) {
      id = await this._membersService.verifyMemberCredential(username, password);
      if (id) {
        await this._membersService.checkMemberEmailVerifStatus(username);
        await this._membersService.checkVerificationStatus(username);
        role = 'member';
      }
    }

    // check customer
    if (!id) {
      id = await this._customersService.verifyCustomerCredential(username, password);
      if (id) {
        await this._customersService.checkCustomerEmailVerifStatus(username);
        role = 'customer';
      }
    }

    if (!id) {
      throw new AuthenticationError('Username atau password yang Anda masukkan salah');
    }

    const accessToken = this._tokenManager.generateAccessToken({ id, role });
    const refreshToken = this._tokenManager.generateRefreshToken({ id, role });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Berhasil login!',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  // Memperbarui access token
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

  // Logout
  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Berhasil logout!',
    };
  }
}

module.exports = AuthenticationsHandler;
