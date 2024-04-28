const autoBind = require('auto-bind');

class MembersHandler {
  constructor(service, storageService, adminService, emailService, validator) {
    this._service = service;
    this._adminService = adminService;
    this._storageService = storageService;
    this._emailService = emailService;
    this._validator = validator;

    autoBind(this);
  }

  /* ================================ MEMBER SCOPE ================================ */

  async postMemberHandler(request, h) {
    this._validator.validateMemberPayload(request.payload);
    const {
      username, email, password, name, npm, major, ktmImage, whatsappNumber, address, bio,
    } = request.payload;

    const filename = await this._storageService.writeFile(ktmImage, ktmImage.hapi);
    const ktmUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/ktm/${filename}`;

    const memberId = await this._service.addMember({
      username, email, password, name, npm, major, ktmUrl, whatsappNumber, address, bio,
    });

    const response = h.response({
      status: 'success',
      message: 'Member berhasil ditambahkan',
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

    const member = await this._service.editMemberById(credentialId, request.payload);

    return {
      status: 'success',
      message: 'Data Member berhasil diperbarui',
      data: {
        member,
      },
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

  async verifyMemberEmailHandler(request) {
    const { token } = request.params;

    const jwtPayload = this._emailService.verifyEmail(token);
    const { id } = jwtPayload;

    await this._service.changeEmailVerifStatus(id);

    return {
      status: 'success',
      message: 'Email berhasil diverifikasi',
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
    this._validator.validateMemberPayload(request.payload);

    const { role: credentialRole } = request.auth.credentials;
    await this._adminService.verifyRoleAdminScope(credentialRole);

    const { id } = request.params;

    const member = await this._service.editMemberById(id, request.payload);

    return {
      status: 'success',
      message: 'Data Member berhasil diperbarui',
      data: {
        member,
      },
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
      message: 'Status verifikasi member berhasil diperbarui',
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

  async memberForgotPasswordHandler(request) {
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

  async resetMemberEmailHandler(request) {
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
