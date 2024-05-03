/* eslint-disable no-underscore-dangle */
const { PrismaClient } = require('@prisma/client');
const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CategoriesService {
  constructor() {
    this._prisma = new PrismaClient();

    autoBind(this);
  }

  /* MENAMBAHKAN KATEGORI */
  async addCategory({ name, description }) {
    const id = `category-${nanoid(16)}`;

    await this.checkCategoryName(name);

    const result = await this._prisma.category.create({
      data: {
        id,
        name,
        description,
      },
    });

    if (!result.id) {
      throw new InvariantError('Kategori gagal ditambahkan');
    }
    return result.id;
  }

  /* MENDAPATKAN SEMUA KATEGORI */
  async getAllCategories() {
    const result = await this._prisma.category.findMany();
    return result;
  }

  /* MENGEDIT KATEGORI BERDASARKAN ID */
  async editCategoryById(id, { description }) {
    await this.checkCategoryId(id);

    const result = await this._prisma.category.update({
      where: {
        id,
      },
      data: {
        description,
      },
    });

    if (!result) {
      throw new InvariantError('Kategori gagal diperbarui');
    }
  }

  /* MENGHAPUS KATEGORI */
  async deleteCategoryById(id) {
    await this.checkCategoryId(id);

    await this._prisma.category.delete({
      where: {
        id,
      },
    });
  }

  // Mengecek nama kategori apakah ada di database
  async checkCategoryName(name) {
    const result = await this._prisma.$queryRaw`SELECT * FROM categories WHERE name = ${name}`;

    if (result.length > 0) {
      throw new InvariantError('Gagal menambahkan kategori. Kategori sudah ada');
    }
  }

  // Mengecek id di database
  async checkCategoryId(id) {
    const categoryId = await this._prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!categoryId) {
      throw new NotFoundError('Id kategori tidak ditemukan');
    }
  }
}

module.exports = CategoriesService;
