const request = require('supertest');
const express = require('express');

// Mock Products BEFORE importing router
jest.mock('../models/products');
const Products = require('../models/products');

// Mock multer
jest.mock('../util/multer', () => ({
  single: jest.fn(() => (req, res, next) => {
    req.file = { filename: 'test.jpg' };
    next();
  }),
}));

const productRouter = require('../routes/productRouter');

describe('Product Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/products', productRouter);
    jest.clearAllMocks();
  });

  // TEST 1: GET all products
  test('GET /products should return all products', async () => {
    Products.fetchAll.mockResolvedValue([
      { prodId: 1, productName: 'Laptop', productPrice: 250000 },
    ]);

    const response = await request(app).get('/products').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // TEST 2: GET all products empty
  test('GET /products should return empty array', async () => {
    Products.fetchAll.mockResolvedValue([]);

    const response = await request(app).get('/products').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data).toEqual([]);
  });

  // TEST 3: GET product by id
  test('GET /products/:prodId should return product', async () => {
    Products.fetch.mockResolvedValue([{ prodId: 1, productName: 'Laptop' }]);

    const response = await request(app).get('/products/1').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data.prodId).toBe(1);
  });

  // TEST 4: GET product - invalid id
  test('GET /products/:prodId should reject invalid id', async () => {
    const response = await request(app).get('/products/abc').expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 5: GET product - not found
  test('GET /products/:prodId should return 404 if not found', async () => {
    Products.fetch.mockResolvedValue([]);

    const response = await request(app).get('/products/999').expect(404);

    expect(response.body.result).toBe('fail');
  });

  // TEST 6: SEARCH products
  test('GET /products/search/:string should search', async () => {
    Products.find.mockResolvedValue([
      { prodId: 1, productName: 'Gaming Laptop' },
    ]);

    const response = await request(app)
      .get('/products/search/laptop')
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data.length).toBe(1);
  });

  // TEST 7: SEARCH - no results
  test('GET /products/search/:string should return empty', async () => {
    Products.find.mockResolvedValue([]);

    const response = await request(app).get('/products/search/xyz').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data).toEqual([]);
  });

  // TEST 8: POST create product success
  test('POST /products should create product', async () => {
    Products.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ result: 'success' }),
    }));

    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: '1000',
        categoryId: '1',
      })
      .expect(201);

    expect(response.body.result).toBe('success');
  });

  // TEST 9: POST - invalid price
  test('POST /products should reject invalid price', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: 'abc',
        categoryId: '1',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 10: POST - invalid category
  test('POST /products should reject invalid category', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: '1000',
        categoryId: 'abc',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 11: POST - negative price
  test('POST /products should reject negative price', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: '-100',
        categoryId: '1',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 12: POST - empty name
  test('POST /products should reject empty name', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: '',
        prodDescription: 'Good laptop',
        prodPrice: '1000',
        categoryId: '1',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 13: POST - empty description
  test('POST /products should reject empty description', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: '',
        prodPrice: '1000',
        categoryId: '1',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 14: POST - negative category
  test('POST /products should reject negative category', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: '1000',
        categoryId: '-1',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 15: POST - save failure
  test('POST /products should handle save failure', async () => {
    Products.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ result: 'fail' }),
    }));

    const response = await request(app)
      .post('/products')
      .send({
        prodName: 'Laptop',
        prodDescription: 'Good laptop',
        prodPrice: '1000',
        categoryId: '1',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 16: GET all - database error
  test('GET /products should handle error', async () => {
    Products.fetchAll.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/products').expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 17: GET single - database error
  test('GET /products/:prodId should handle error', async () => {
    Products.fetch.mockRejectedValue(new Error('DB error'));

    const response = await request(app).get('/products/1').expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 18: SEARCH - database error
  test('GET /products/search/:string should handle error', async () => {
    Products.find.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .get('/products/search/test')
      .expect(500);

    expect(response.body.result).toBe('fail');
  });
});
