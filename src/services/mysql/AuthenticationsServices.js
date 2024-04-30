const { PrismaClient } = require('@prisma/client');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsServices {
  constructor() {
    this._prisma = new PrismaClient();
  }

  /* MENAMBAHKAN REFRESH TOKEN */
  async addRefreshToken(token) {
    await this._prisma.authentications.create({
      data: {
        token,
      },
    });
  }

  /* MEMVERIFIKASI KEBERADAAN TOKEN DI DB */
  async verifyRefreshToken(token) {
    const result = await this._prisma.authentications.findFirst({
      where: {
        token,
      },
    });

    if (!result) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /* MENGHAPUS REFRESH TOKEN */
  async deleteRefreshToken(token) {
    await this._prisma.authentications.deleteMany({
      where: {
        token,
      },
    });
  }
}

module.exports = AuthenticationsServices;
