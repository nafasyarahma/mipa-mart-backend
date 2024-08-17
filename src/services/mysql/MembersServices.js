const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class MembersService {
  constructor(storageService, emailService) {
    this._prisma = new PrismaClient();
    this._storageService = storageService;
    this._emailService = emailService;
  }

  /* MENAMBAHKAN MEMBER / REGISTRASI */
  async addMember({
    username, email, password, name, npm, major, ktmImage, whatsappNumber, address, bio,
  }) {
    await this.verifyNewUsername(username);
    await this.verifyNewEmail(email);
    await this.verifyMemberNpm(npm);

    const id = `member-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const filename = await this._storageService.writeFile(ktmImage, ktmImage.hapi);
    const ktmUrl = `${process.env.BE_URL}/upload/images/ktm/${filename}`;

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

    if (result.id) {
      this._emailService.sendEmailVerification(id, email);
      return result.id;
    }
    throw new InvariantError('Member gagal ditambahkan');
  }

  /* MENDAPATKAN SEMUA MEMBER */
  async getAllMembers() {
    const result = await this._prisma.member.findMany();
    return result;
  }

  /* MENDAPATKAN DETAIL MEMBER */
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

  /* MENDAPATKAN DETAIL MEMBER BESERTA PRODUK */
  async getMemberWithProducts(id) {
    await this.checkMemberId(id);
    const memberData = await this._prisma.member.findUnique({
      where: {
        id,
      },
      include: {
        Product: true,
      },
    });
    if (!memberData) {
      throw new NotFoundError('Gagal mendapatkan data');
    }

    const selectedMemberData = {
      name: memberData.name,
      no_wa: memberData.no_wa,
      address: memberData.address,
      bio: memberData.bio,
      products: memberData.Product,
    };
    return selectedMemberData;
  }

  /* MENGEDIT DETAIL MEMBER */
  async editMemberById(id, {
    email, password, name, whatsappNumber, address, bio,
  }) {
    await this.checkMemberId(id);

    // mengambil data dari db
    const currentData = await this._prisma.member.findFirst({
      where: {
        id,
      },
      select: {
        email: true,
        username: true,
        password: true,
      },
    });

    const newData = {
      email,
      name,
      no_wa: whatsappNumber,
      address,
      bio,
    };

    // jika email berbeda (diedit)
    if (email !== currentData.email) {
      await this.verifyNewEmail(email);
      await this._emailService.sendEmailVerification(id, email);
      newData.email_verified = false;
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
  }

  /* MENGEDIT STATUS VERIFIKASI */
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

  /* MENGHAPUS MEMBER */
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
    const memberUsername = await this._prisma.member.findUnique({
      where: {
        username,
      },
    });

    const customerUsername = await this._prisma.customer.findUnique({
      where: {
        username,
      },
    });

    if (customerUsername || memberUsername) {
      throw new InvariantError('Username sudah digunakan. Harap ganti username Anda!');
    }
  }

  // Memverifikasi email memastikan belum digunakan
  async verifyNewEmail(email) {
    const memberEmail = await this._prisma.member.findUnique({
      where: {
        email,
      },
    });
    if (memberEmail) {
      throw new InvariantError('Email sudah digunakan. Harap ganti email Anda!');
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

  // Mengecek email di db
  async checkMemberEmail(email) {
    const result = await this._prisma.member.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
      },
    });

    if (!result) {
      throw new NotFoundError('Email Tidak Ditemukan');
    }
    return result;
  }

  // Mengecek npm di db
  async verifyMemberNpm(npm) {
    const memberNpm = await this._prisma.member.findUnique({
      where: {
        npm,
      },
    });

    if (memberNpm) {
      throw new InvariantError('Mahasiswa dengan NPM ini sudah terdaftar');
    }
  }

  // Memverifikasi kredensial (uname/pw)
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

    if (result) {
      const { id, password: hashedPassword } = result;
      const match = await bcrypt.compare(password, hashedPassword);

      if (!match) {
        throw new AuthenticationError('Username atau password yang Anda masukkan salah');
      }
      return id;
    }
    return null;
  }

  // Mengecek status verifikasi member
  async checkVerificationStatus(username) {
    const member = await this._prisma.member.findFirst({
      where: {
        username,
      },
    });

    if (member) {
      if (member.verif_status === 'pending') {
        throw new AuthenticationError('Akun anda sedang dalam proses verifikasi. Mohon tunggu hingga status disetujui');
      } else if (member.verif_status === 'rejected') {
        throw new AuthenticationError('Permintaan registrasi akun Anda ditolak. Silahkan registrasi ulang dengan data yang benar atau hubungi Admin');
      }
    }
    return null;
  }

  // Mengubah status verifikasi email menjadi true
  async changeEmailVerifStatus(id) {
    await this.checkMemberId(id);
    const result = await this._prisma.member.update({
      where: {
        id,
      },
      data: {
        email_verified: true,
      },
    });
    if (!result) {
      throw new InvariantError('Gagal mengubah status verifikasi email');
    }
  }

  // Mengubah data password dengan password baru
  async resetMemberPassword(email, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new InvariantError('Password dan confirm password tidak cocok');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._prisma.member.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
      },
    });
    if (!result) {
      throw new InvariantError('Gagal memperbarui password');
    }
  }
}

module.exports = MembersService;
