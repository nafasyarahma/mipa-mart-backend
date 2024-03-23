const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class MembersService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  // -- MENAMBAHKAN MEMBER --
  async addMember({
    username, email, password, name, major, whatsappNumber, address,
  }) {
    await this.verifyNewUsername(username);
    const id = `member-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._prisma.member.create({
      data: {
        id,
        username,
        email,
        password: hashedPassword,
        name,
        major,
        no_wa: whatsappNumber,
        address,
      },
    });
    if (!result.id) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.id;
  }

  // -- MENDAPATKAN SEMUA MEMBER --
  async getAllMembers() {
    const result = await this._prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        no_wa: true,
        verif_status: true,
      },
    });
    return result;
  }

  // -- MENDAPATKAN DETAIL MEMBER --
  async getMemberById(id) {
    await this.checkMemberId(id);
    const result = await this._prisma.member.findUnique({
      where: {
        id,
      },
    });
    if (!result) {
      throw new NotFoundError('Gagal mendapatkan data');
    }
    return result;
  }

  // -- MENGEDIT DETAIL MEMBER --
  async editMemberById(id, {
    username, email, password, name, major, whatsappNumber, address,
  }) {
    await this.checkMemberId(id);

    // mengambil data dari db
    const currentData = await this._prisma.member.findFirst({
      where: {
        id,
      },
      select: {
        username: true,
        password: true,
      },
    });

    const newData = {
      username,
      email,
      name,
      major,
      no_wa: whatsappNumber,
      address,
    };

    // jika username berbeda (diedit)
    if (username !== currentData.username) {
      // cek apakah sudah digunakan, jika belum update sesuai username baru
      await this.verifyNewUsername(username);
      newData.username = username;
    }

    const match = await bcrypt.compare(password, currentData.password);
    if (!match) {
      // jika password tidak match (diedit) hash pasword baru
      newData.password = await bcrypt.hash(password, 10);
    } else {
      // jika password match (tidak diedit) password tetap
      newData.password = currentData.password;
    }

    const result = await this._prisma.member.update({
      where: {
        id,
      },
      data: newData,
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui data member');
    }
    return result;
  }

  // -- MENGEDIT STATUS VERIFIKASI --
  async editMemberStatusById(id, { verifStatus }) {
    await this.checkMemberId(id);

    const result = await this._prisma.member.update({
      where: {
        id,
      },
      data: {
        verif_status: verifStatus,
      },
    });
    if (!result) {
      throw new InvariantError('Gagal memperbarui status');
    }
    return result;
  }

  // -- MENGHAPUS MEMBER --
  async deleteMemberById(id) {
    await this.checkMemberId(id);

    await this._prisma.member.delete({
      where: {
        id,
      },
    });
  }

  // Memverifikasi username memastikan belum digunakan
  async verifyNewUsername(username) {
    const result = await this._prisma.member.findUnique({
      where: {
        username,
      },
    });

    if (result) {
      throw new InvariantError('Username sudah digunakan. Harap ganti username Anda!');
    }
  }

  // Mengecek id di db
  async checkMemberId(id) {
    const memberId = await this._prisma.member.findUnique({
      where: {
        id,
      },
    });
    if (!memberId || id === null) {
      throw new NotFoundError('Id member tidak ditemukan');
    }
  }

  async verifyUserCredential(username, password) {
    const result = await this._prisma.member.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!result.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result;
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = MembersService;
