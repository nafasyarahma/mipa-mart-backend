const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class CustomersService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  // -- MENAMBAHKAN / REGISTRASI CUSTOMER --
  async addCustomer({
    username, email, password, name, whatsappNumber, address,
  }) {
    await this.verifyNewUsername(username);
    const id = `customer-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._prisma.customer.create({
      data: {
        id, username, email, password: hashedPassword, name, no_wa: whatsappNumber, address,
      },
    });

    if (!result.id) {
      throw new InvariantError('Customer gagal ditambahkan');
    }

    return result.id;
  }

  /* ====================== ADMIN SCOPE ===================== */

  // -- MENDAPATKAN SEMUA CUSTOMER --
  async getAllCustomers() {
    const result = await this._prisma.customer.findMany();
    return result;
  }

  // -- MENDAPATKAN DETAIL CUSTOMER --
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

  // -- MENGEDIT DETAIL CUSTOMER --
  async editCustomerById(id, {
    username, email, password, name, whatsappNumber, address,
  }) {
    await this.checkCustomerId(id);

    // mengambil data dari db
    const currentData = await this._prisma.customer.findFirst({
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

  /* ====================== ADDITIONAL FUNCTION ===================== */

  // Memverifikasi username memastikan belum digunakan
  async verifyNewUsername(username) {
    const customerUsername = await this._prisma.customer.findUnique({
      where: {
        username,
      },
    });
    if (customerUsername) {
      throw new InvariantError('Username sudah digunakan. Harap ganti username Anda!');
    }

    const memberUsername = await this._prisma.member.findUnique({
      where: {
        username,
      },
    });
    if (memberUsername) {
      throw new InvariantError('Username sudah digunakan. Harap ganti username Anda!');
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
}

module.exports = CustomersService;
