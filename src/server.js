/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./exceptions/ClientError');

// categories
const categories = require('./api/categories');
const CategoriesService = require('./services/mysql/CategoriesServices');
const CategoriesValidator = require('./validator/categories/index');

// products
const products = require('./api/products');
const ProductsService = require('./services/mysql/ProductsServices');
const ProductsValidator = require('./validator/products/index');

// members
const members = require('./api/members');
const MembersService = require('./services/mysql/MembersServices');
const MembersValidator = require('./validator/members/index');

const StorageService = require('./services/storage/storageService');

const init = async () => {
  const categoriesService = new CategoriesService();
  const productsService = new ProductsService();
  const membersService = new MembersService();
  const storageService = new StorageService(path.resolve(__dirname, '../static/upload/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Inert,
    },
  ]);

  await server.register([
    {
      plugin: categories,
      options: {
        service: categoriesService,
        validator: CategoriesValidator,
      },
    },
    {
      plugin: products,
      options: {
        service: productsService,
        validator: ProductsValidator,
      },
    },
    {
      plugin: members,
      options: {
        service: membersService,
        storageService,
        validator: MembersValidator,
      },
    },
  ]);

  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      return '<h1>Selamat Datang di API MIPA Mart<h1>';
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // penanganan client error secara internal
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native
      if (!response.isServer) {
        return h.continue;
      }

      // melihat detail error
      const errorMessage = response.message || 'Terjadi kegagalan pada server kami';
      // penanganan error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: errorMessage,
      });
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
