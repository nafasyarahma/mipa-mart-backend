const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class MembersService {
  constructor(storageService) {
    this._prisma = new PrismaClient();

    this._storageService = storageService;
  }

  // -- MENAMBAHKAN MEMBER --
  async addMember({
    username, email, password, name, npm, major, ktmUrl, whatsappNumber, address, bio,
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
        npm,
        major,
        ktm_image: ktmUrl,
        no_wa: whatsappNumber,
        address,
        bio,
      },
    });
    if (!result.id) {
      throw new InvariantError('Member gagal ditambahkan');
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
        ktm_image: true,
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

  // Tambah image
  async addKTMImage(ktmUrl) {
    const result = await this._prisma.member.create({
      data: {
        ktm_image: ktmUrl,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal mengupload gambar');
    }
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

  async verifyMemberCredential(username, password) {
    const result = await this._prisma.member.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!result) {
      throw new AuthenticationError('Username atau password yang Anda masukkan salah');
    }

    const { id, password: hashedPassword } = result;
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Username atau password yang Anda masukkan salah');
    }

    return id;
  }

  // Mengecek status verifikasi member
  async checkVerificationStatus(username) {
    const member = await this._prisma.member.findFirst({
      where: {
        username,
      },
    });

    if (!member) {
      throw new NotFoundError('Username member tidak ditemukan');
    }

    if (member.verif_status === 'pending') {
      throw new AuthorizationError('Akun anda sedang dalam proses verifikasi. Mohon tunggu hingga status disetujui');
    } else if (member.verif_status === 'rejected') {
      throw new AuthorizationError('Permintaan registrasi akun Anda ditolak. Silahkan registrasi ulang dengan data yang benar atau hubungi Admin');
    }
  }
}

module.exports = MembersService;
