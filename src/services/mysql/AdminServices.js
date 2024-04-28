/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class AdminService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  async verifyAdminCredential(username, password) {
    const result = await this._prisma.admin.findFirst({
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

  async verifyRoleAdminScope(role) {
    if (role !== 'admin') {
      throw new AuthorizationError('Anda bukan admin');
    }
  }
}

module.exports = AdminService;
