const { PrismaClient } = require('@prisma/client');
const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ProductsService {
  constructor() {
    this._prisma = new PrismaClient();

    autoBind(this);
  }

  async addProduct({
    name, description, price, status, categoryId,
  }) {
    const id = `product-${nanoid(16)}`;

    const result = await this._prisma.product.create({
      data: {
        id,
        name,
        description,
        price,
        status,
        category_id: categoryId,
      },
    });

    if (!result.id) {
      throw new InvariantError('Kategori gagal ditambahkan');
    }
    return result.id;
  }

  // Mendapatkan semua produk
  async getAllProducts() {
    const result = await this._prisma.product.findMany();
    return result;
  }

  // Mendapatkan detail produk
  async getProductById(id) {
    await this.checkProductId(id);
    const result = await this._prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundError('Gagal mendapatkan data');
    }
    return result;
  }

  // Mengedit Produk berdasarkan id
  async editProductById(id, {
    name, description, price, status,
  }) {
    await this.checkProductId(id);
    const result = await this._prisma.product.update({
      where: {
        id,
      },
      data: {
        name, description, price, status,
      },
    });

    if (!result) {
      throw new InvariantError('Gagal memperbarui produk');
    }
    return result;
  }

  async deleteProductById(id) {
    await this.checkProductId(id);

    await this._prisma.product.delete({
      where: {
        id,
      },
    });
  }

  // Mengecek id produk di db
  async checkProductId(id) {
    const productId = await this._prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!productId || id === null) {
      throw new NotFoundError('Id produk tidak ditemukan');
    }
  }
}

module.exports = ProductsService;
