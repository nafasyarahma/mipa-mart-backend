const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class DeliveryMethodsService {
  constructor() {
    this._prisma = new PrismaClient();
  }

  // -- MENAMBAHKAN METODE PENGIRIMAN --
  async addDeliveryMethod({ method, description, memberId }) {
    const id = `deliv-${nanoid(16)}`;

    const result = await this._prisma.deliveryMethod.create({
      data: {
        id, method, description, member_id: memberId,
      },
    });

    if (!result.id) {
      throw new InvariantError('Gagal menambahkan metode pengiriman');
    }

    return result.id;
  }

  // -- MENDAPATKAN METODE PENGIRIMAN MEMBER --
  async getMemberDeliveryMenthods(memberId) {
    const result = await this._prisma.deliveryMethod.findMany({
      where: {
        member_id: memberId,
      },
    });
    return result;
  }

  // -- MENGEDIT DEATIL METODE PEMBAYARAN --
  async editDeliveryMethodById(id, { method, description }) {
    const result = await this._prisma.deliveryMethod.update({
      where: {
        id,
      },
      data: {
        method, description,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui metode pengiriman');
    }
  }

  // -- MENGHAPUS DEATIL METODE PENGIRIMAN --
  async deleteDeliveryMethodById(id) {
    await this._prisma.deliveryMethod.delete({
      where: {
        id,
      },
    });
  }

  // Memeriksa apakah metode pengiriman milik member yang sesuai
  async verifyDeliveryMethodMember(id, memberId) {
    const result = await this._prisma.deliveryMethod.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      throw new NotFoundError('Metode pengiriman tidak ditemukan');
    }

    const deliveryMethodMember = result.member_id;

    if (deliveryMethodMember !== memberId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = DeliveryMethodsService;
