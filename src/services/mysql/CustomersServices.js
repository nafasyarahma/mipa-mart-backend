const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class CustomersService {
  constructor(emailService) {
    this._prisma = new PrismaClient();
    this._emailService = emailService;
  }

  /* MENAMBAHKAN / RESGISTRASI CUSTOMER */
  async addCustomer({
    username, email, password, name, whatsappNumber, address,
  }) {
    await this.verifyNewUsername(username);
    await this.verifyNewEmail(email);

    const id = `customer-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._prisma.customer.create({
      data: {
        id,
        username,
        email,
        password: hashedPassword,
        name,
        no_wa: whatsappNumber,
        address,
      },
    });

    if (result.id) {
      this._emailService.sendEmailVerification(id, email);
      return result.id;
    }
    throw new InvariantError('Customer gagal ditambahkan');
  }

  /* MENDAPATKAN SEMUA CUSTOMER */
  async getAllCustomers() {
    const result = await this._prisma.customer.findMany();
    return result;
  }

  /* MENDAPATKAN DETAIL CUSTOMER */
  async getCustomerById(id) {
    await this.checkCustomerId(id);
    const result = await this._prisma.customer.findUnique({
      where: {
        id,
      },
    });
    if (!result) {
      throw new NotFoundError('Gagal mendapatkan data');
    }
    return result;
  }

  /* MENGEDIT DETAIL CUSTOMER */
  async editCustomerById(id, {
    email, password, name, whatsappNumber, address,
  }) {
    await this.checkCustomerId(id);

    // mengambil data dari db
    const currentData = await this._prisma.customer.findFirst({
      where: {
        id,
      },
      select: {
        email: true,
        username: true,
        password: true,
        email_verified: true,
      },
    });

    const newData = {
      email,
      name,
      no_wa: whatsappNumber,
      address,
      email_verified: true,
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

    const result = await this._prisma.customer.update({
      where: {
        id,
      },
      data: newData,
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui data customer');
    }
    return result;
  }

  async deleteCustomerById(id) {
    await this.checkCustomerId(id);

    await this._prisma.customer.delete({
      where: {
        id,
      },
    });
  }

  // Memverifikasi username memastikan belum digunakan
  async verifyNewUsername(username) {
    const customerUsername = await this._prisma.customer.findUnique({
      where: {
        username,
      },
    });

    const memberUsername = await this._prisma.member.findUnique({
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
    const customerEmail = await this._prisma.customer.findUnique({
      where: {
        email,
      },
    });
    if (customerEmail) {
      throw new InvariantError('Email sudah digunakan. Harap ganti email Anda!');
    }
  }

  // Mengecek id di db
  async checkCustomerId(id) {
    const customerId = await this._prisma.customer.findUnique({
      where: {
        id,
      },
    });
    if (!customerId || id === null) {
      throw new NotFoundError('Id customer tidak ditemukan');
    }
  }

  // Mengecek email di db
  async checkCustomerEmail(email) {
    const customerEmail = await this._prisma.customer.findUnique({
      where: {
        email,
      },
    });

    if (!customerEmail) {
      throw new NotFoundError('Email Tidak Ditemukan');
    }
  }

  // Memverifikasi kredensial customer (kesesuaian uname/pw)
  async verifyCustomerCredential(username, password) {
    const result = await this._prisma.customer.findFirst({
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

  // Mengubah status verifikasi email menjadi true
  async changeEmailVerifStatus(id) {
    await this.checkCustomerId(id);
    const result = await this._prisma.customer.update({
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
  async resetCustomerPassword(email, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new InvariantError('Password dan confirm password tidak cocok');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._prisma.customer.update({
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

module.exports = CustomersService;
