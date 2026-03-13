const request = require('supertest');
const express = require('express');
const cartRouter = require('../routes/cartRouter');
const db = require('../util/database');
const jwt = require('jsonwebtoken');

jest.mock('../util/database');
jest.mock('jsonwebtoken');

describe('Cart Routes', () => {
  let app;
  const mockUserId = 1;
  const mockToken = 'validToken';

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Middleware to attach user from token
    app.use((req, res, next) => {
      req.user = { id: mockUserId };
      next();
    });

    app.use('/cart', cartRouter);
    jest.clearAllMocks();
  });

  // TEST 1: GET /cart - fetch cart items
  test('GET /cart should return cart items and total', async () => {
    const mockItems = [
      { prodId: 1, productName: 'Laptop', productPrice: 250000, quantity: 1 },
      { prodId: 2, productName: 'Monitor', productPrice: 45000, quantity: 2 },
    ];
    const mockTotal = [{ total: 340000 }];

    db.execute
      .mockResolvedValueOnce([mockItems])
      .mockResolvedValueOnce([mockTotal]);

    const response = await request(app).get('/cart').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.total).toEqual(mockTotal);
  });

  // TEST 2: GET /cart - empty cart
  test('GET /cart should return empty cart', async () => {
    db.execute
      .mockResolvedValueOnce([[]]) // Empty items array
      .mockResolvedValueOnce([[{ total: null }]]);

    const response = await request(app).get('/cart').expect(200);

    console.log('Response body:', JSON.stringify(response.body, null, 2));

    expect(response.body.result).toBe('success');
    expect(response.body.data.items).toEqual([]);
  });

  // TEST 3: GET /cart - database error
  test('GET /cart should handle database error', async () => {
    db.execute.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/cart').expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('server error');
  });

  // TEST 4: POST /cart/add - add item to cart
  test('POST /cart/add/:id/:quantity should add item to cart', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const response = await request(app).post('/cart/add/1/5').expect(201);

    expect(response.body.result).toBe('success');
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO carts'),
      [mockUserId, 1, 5, 5]
    );
  });

  // TEST 5: POST /cart/add - invalid product ID
  test('POST /cart/add/:id/:quantity should reject invalid product ID', async () => {
    const response = await request(app).post('/cart/add/abc/5').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid id');
  });

  // TEST 6: POST /cart/add - negative product ID
  test('POST /cart/add/:id/:quantity should reject negative product ID', async () => {
    const response = await request(app).post('/cart/add/-1/5').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid id');
  });

  // TEST 7: POST /cart/add - invalid quantity
  test('POST /cart/add/:id/:quantity should reject invalid quantity', async () => {
    const response = await request(app).post('/cart/add/1/abc').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('quantity must be a number');
  });

  // TEST 8: POST /cart/add - negative quantity
  test('POST /cart/add/:id/:quantity should reject negative quantity', async () => {
    const response = await request(app).post('/cart/add/1/-5').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('quantity must be a number');
  });

  // TEST 9: POST /cart/add - zero quantity
  test('POST /cart/add/:id/:quantity should reject zero quantity', async () => {
    const response = await request(app).post('/cart/add/1/0').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('quantity must be a number');
  });

  // TEST 10: POST /cart/add - duplicate key (update quantity)
  test('POST /cart/add/:id/:quantity should update quantity on duplicate', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const response = await request(app).post('/cart/add/1/3').expect(201);

    expect(response.body.result).toBe('success');
    // Should use ON DUPLICATE KEY UPDATE
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('ON DUPLICATE KEY UPDATE'),
      [mockUserId, 1, 3, 3]
    );
  });

  // TEST 11: PATCH /cart/:id - update cart quantity (increase)
  test('PATCH /cart/:id should increase quantity', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const response = await request(app)
      .patch('/cart/1')
      .send({ amount: 2 })
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE carts SET quantity'),
      [2, mockUserId, '1']
    );
  });

  // TEST 12: PATCH /cart/:id - update cart quantity (decrease)
  test('PATCH /cart/:id should decrease quantity and delete if <= 0', async () => {
    db.execute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await request(app)
      .patch('/cart/1')
      .send({ amount: -5 })
      .expect(200);

    expect(response.body.result).toBe('success');
    // Should call DELETE for items with quantity <= 0
    expect(db.execute).toHaveBeenCalledTimes(2);
  });

  // TEST 13: PATCH /cart/:id - invalid product ID
  test('PATCH /cart/:id should reject invalid product ID', async () => {
    const response = await request(app)
      .patch('/cart/abc')
      .send({ amount: 2 })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid id');
  });

  // TEST 14: PATCH /cart/:id - invalid amount
  test('PATCH /cart/:id should reject non-integer amount', async () => {
    const response = await request(app)
      .patch('/cart/1')
      .send({ amount: 'abc' })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('quantity must be a number');
  });

  // TEST 15: PATCH /cart/:id - amount is 0 (nothing changes)
  test('PATCH /cart/:id should handle amount 0', async () => {
    const response = await request(app)
      .patch('/cart/1')
      .send({ amount: 0 })
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.message).toContain('nothing changed');
  });

  // TEST 16: PATCH /cart/:id - database error
  test('PATCH /cart/:id should handle database error', async () => {
    db.execute.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .patch('/cart/1')
      .send({ amount: 2 })
      .expect(500);

    expect(response.body.result).toBe('server error');
  });
});
