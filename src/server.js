/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
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

// storage
const StorageService = require('./services/storage/storageService');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/mysql/AuthenticationsServices');
const TokenManager = require('./tokenize/TokenManager');
const AuthentcationsValidator = require('./validator/authentications/index');

// payment methods
const paymentMethods = require('./api/paymentMethods');
const PaymentMethodsService = require('./services/mysql/PaymentMethodsServices');
const PaymentMethodsValidator = require('./validator/paymentMethods/index');

// delivery methods
const deliveryMethods = require('./api/deliveryMethods');
const DeliveryMethodsService = require('./services/mysql/DeliveryMethodsServices');
const DeliveryMethodsValidator = require('./validator/deliveryMethods/index');

// customers
const customers = require('./api/customers');
const CustomersService = require('./services/mysql/CustomersServices');
const CustomersValidator = require('./validator/customers/index');

// carts
const carts = require('./api/carts');
const CartsService = require('./services/mysql/CartsServices');
const CartsValidator = require('./validator/carts/index');

// orders
const orders = require('./api/orders');
const OrdersService = require('./services/mysql/OrdersService');
const OrdersValidator = require('./validator/orders/index');

// admin
const AdminService = require('./services/mysql/AdminServices');

const init = async () => {
  const categoriesService = new CategoriesService();
  const membersService = new MembersService();
  const storageService = new StorageService(path.resolve(__dirname, '../static/upload/images/ktm'));
  const productImagesStorageService = new StorageService(path.resolve(__dirname, '../static/upload/images/product'));
  const productsService = new ProductsService(productImagesStorageService);
  const paymentMethodsService = new PaymentMethodsService();
  const deliveryMethodsService = new DeliveryMethodsService();
  const authenticationsService = new AuthenticationsService();
  const customersService = new CustomersService();
  const cartsService = new CartsService();
  const paymentImagesStorageService = new StorageService(path.resolve(__dirname, '../static/upload/images/payment'));
  const ordersService = new OrdersService(paymentImagesStorageService);
  const adminService = new AdminService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register([
    {
      plugin: Inert,
    },
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('mipamart_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        role: artifacts.decoded.payload.role,
      },
    }),
  });

  await server.register([
    {
      plugin: categories,
      options: {
        service: categoriesService,
        adminService,
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
        adminService,
        validator: MembersValidator,
      },
    },
    {
      plugin: paymentMethods,
      options: {
        service: paymentMethodsService,
        validator: PaymentMethodsValidator,
      },
    },
    {
      plugin: deliveryMethods,
      options: {
        service: deliveryMethodsService,
        validator: DeliveryMethodsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        membersService,
        customersService,
        adminService,
        tokenManager: TokenManager,
        validator: AuthentcationsValidator,
      },
    },
    {
      plugin: customers,
      options: {
        service: customersService,
        adminService,
        validator: CustomersValidator,
      },
    },
    {
      plugin: carts,
      options: {
        service: cartsService,
        validator: CartsValidator,
      },
    },
    {
      plugin: orders,
      options: {
        service: ordersService,
        paymentMethodsService,
        deliveryMethodsService,
        validator: OrdersValidator,
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
