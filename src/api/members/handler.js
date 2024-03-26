const autoBind = require('auto-bind');

class MembersHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postMemberHandler(request, h) {
    this._validator.validateMemberPayload(request.payload);
    const {
      username, email, password, name, npm, major, ktmImage, whatsappNumber, address, bio,
    } = request.payload;

    const filename = await this._storageService.writeFile(ktmImage, ktmImage.hapi);
    const ktmUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

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

  async getAllMembersHandler() {
    const members = await this._service.getAllMembers();

    return {
      status: 'success',
      data: {
        members,
      },
    };
  }

  async getMemberByIdHandler(request) {
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
    const { id } = request.params;

    await this._service.editMemberStatusById(id, request.payload);

    return {
      status: 'success',
      message: 'Status verifikasi member berhasil diperbarui',
    };
  }

  async deleteMemberByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteMemberById(id);

    return {
      status: 'success',
      message: 'Member berhasil dihapus',
    };
  }
}

module.exports = MembersHandler;
