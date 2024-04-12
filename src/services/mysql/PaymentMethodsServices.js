/* eslint-disable no-underscore-dangle */
const { PrismaClient } = require('@prisma/client');
// const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PaymentMethodsService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  // -- MENAMBAHKAN METODE PEMBAYARAN --
  async addPaymentMethod({
    provider, accountNumber, name, memberId,
  }) {
    const id = `payment-${nanoid(16)}`;

    const result = await this._prisma.paymentMethod.create({
      data: {
        id, provider, no_account: accountNumber, name, member_id: memberId,
      },
    });

    if (!result.id) {
      throw new InvariantError('Gagal menambahkan metode pembayaran');
    }

    return result.id;
  }

  // -- MENDAPATKAN METODE BAYAR MEMBER --
  async getMemberPaymentMenthods(memberId) {
    const result = await this._prisma.paymentMethod.findMany({
      where: {
        member_id: memberId,
      },
    });
    return result;
  }

  // -- MENGEDIT DEATIL METODE PEMBAYARAN --
  async deletePaymentMethodById(id) {
    await this._prisma.paymentMethod.delete({
      where: {
        id,
      },
    });
  }

  // Memeriksa apakah metode pembayaran milik member yang sesuai
  async verifyPaymentMethodMember(id, memberId) {
    const result = await this._prisma.paymentMethod.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Metode pembayaran tidak ditemukan');
    }

    const paymentMethodMember = result.member_id;

    if (paymentMethodMember !== memberId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PaymentMethodsService;
