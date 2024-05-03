/* eslint-disable no-underscore-dangle */
const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PaymentMethodsService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  /* MENAMBAHKAN METODE PEMBAYARAN */
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

  /* MENDAPATKAN METODE BAYAR MEMBER */
  async getMemberPaymentMenthods(memberId) {
    const result = await this._prisma.paymentMethod.findMany({
      where: {
        member_id: memberId,
      },
    });
    return result;
  }

  /* MENGHAPUS DEATIL METODE PEMBAYARAN */
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
      throw new NotFoundError('Id tidak ditemukan');
    }

    const paymentMethodMember = result.member_id;

    if (paymentMethodMember !== memberId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // Mendapatkan metode bayar member sesuai item pada cart
  async getPaymentMethodOfCartItemMember(customerId) {
    const cartItem = await this._prisma.cartItem.findFirst({
      where: {
        customer_id: customerId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem || !cartItem.product) {
      throw new NotFoundError('Keranjang kosong');
    }

    // jika ada item, dapatkan data member_id dari produk pertama di keranjang
    const cartMemberId = cartItem.product.member_id;

    const paymentMethods = await this._prisma.paymentMethod.findMany({
      where: {
        member_id: cartMemberId,
      },
    });
    return paymentMethods;
  }

  // Memverifikasi bahwa hanya payment method member yang ada di cart yang bisa dipilih
  async verifyPaymentMethod({ customerId, paymentMethodId }) {
    const paymentMethod = await this._prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Metode pembayatan tidak ditemukan');
    }

    const paymentMethodMember = paymentMethod.member_id;

    const cartItem = await this._prisma.cartItem.findFirst({
      where: {
        customer_id: customerId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem || !cartItem.product) {
      throw new NotFoundError('Keranjang kosong');
    }

    // jika ada item, dapatkan data member_id dari produk pertama di keranjang
    const cartMemberId = cartItem.product.member_id;

    // jika pemilik metode bayar dari payload tidak sama dengan pemilik produk di cart
    if (paymentMethodMember !== cartMemberId) {
      throw new AuthorizationError('Anda tidak dapat memilih metode pembayaran ini');
    }
  }
}

module.exports = PaymentMethodsService;
