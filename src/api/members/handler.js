const autoBind = require('auto-bind');

class MembersHandler {
  constructor(service, adminService, emailService, validator) {
    this._service = service;
    this._adminService = adminService;
    this._emailService = emailService;
    this._validator = validator;

    autoBind(this);
  }

  /* ================================ MEMBER SCOPE ================================ */

  async postMemberHandler(request, h) {
    this._validator.validateMemberPayload(request.payload);
    const { ktmImage } = request.payload;
    this._validator.validateKtmImageHeaders(ktmImage.hapi.headers);

    const memberId = await this._service.addMember(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Registrasi berhasil! Kami telah mengirimkan pesan verifikasi ke alamat email Anda. Silakan periksa kotak masuk Anda.',
      data: {
        memberId,
      },
    });
    response.code(201);
    return response;
  }

  async getMemberProfileHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const member = await this._service.getMemberById(credentialId);

    return {
      status: 'success',
      data: {
        member,
      },
    };
  }

  async putMemberProfileHandler(request) {
    this._validator.validatePutMemberPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;

    await this._service.editMemberById(credentialId, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui profil. Jika Anda mengubah email, periksa kotak masuk dan harap verifikasi segera email terbaru Anda!',
    };
  }

  async postMemberEmailVerification(request) {
    const { id: credentialId } = request.auth.credentials;
    const member = await this._service.getMemberById(credentialId);
    const { email } = member.email;

    await this._emailService.sendEmailVerification(credentialId, email);

    return {
      status: 'success',
      message: 'Email verifikasi berhasil dikirimkan',
    };
  }

  /* ================================ ADMIN SCOPE ================================ */

  async getAllMembersHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const members = await this._service.getAllMembers();

    return {
      status: 'success',
      data: {
        members,
      },
    };
  }

  async getMemberByIdHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);
    const { id } = request.params;

    const member = await this._service.getMemberById(id);

    return {
      status: 'success',
      data: {
        member,
      },
    };
  }

  async putMemberByIdHandler(request) {
    this._validator.validatePutMemberPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    await this._service.editMemberById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui data member. Jika email diubah maka pesan verifikasi akan dikirimkan ke email member',
    };
  }

  async putMemberStatusByIdHandler(request) {
    this._validator.validateMemberStatusPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    await this._service.editMemberStatusById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui status verifikasi member',
    };
  }

  async deleteMemberByIdHandler(request) {
    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    await this._service.deleteMemberById(id);

    return {
      status: 'success',
      message: 'Member berhasil dihapus',
    };
  }

  /* ================================ COMMON ================================ */

  async getMemberWithProductsHandler(request) {
    const { id } = request.params;

    const member = await this._service.getMemberWithProducts(id);

    return {
      status: 'success',
      data: {
        member,
      },
    };
  }

  async verifyMemberEmailHandler(request) {
    const { token } = request.params;

    const jwtPayload = this._emailService.verifyEmail(token);
    const { id } = jwtPayload;

    await this._service.changeEmailVerifStatus(id);

    return ('Email berhasil diverifikasi');
  }

  async memberForgotPasswordHandler(request) {
    await this._service.validateForgotPasswordPayload(request.payload);
    const { email } = request.payload;

    const memberData = await this._service.checkMemberEmail(email);
    const checkedEmail = memberData.email;
    const { id } = memberData;

    await this._emailService.sendResetPasswordEmail(id, checkedEmail);

    return {
      status: 'success',
      message: 'Berhasil mengirimkan email. Periksa kotak masuk untuk mendapatkan link reset password',
    };
  }

  async resetMemberPasswordHandler(request) {
    const { token } = request.params;
    const { password, confirmPassword } = request.payload;

    const jwtPayload = this._emailService.verifyEmail(token);
    const { email } = jwtPayload;

    await this._service.resetMemberPassword(email, password, confirmPassword);

    return {
      status: 'success',
      message: 'Berhasil memperbarui password',
    };
  }
}

module.exports = MembersHandler;
