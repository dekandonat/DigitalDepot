const request = require('supertest');
const express = require('express');
const orderRouter = require('../routes/orderRouter');
const Order = require('../models/order');

jest.mock('../models/order');
jest.mock('../util/tokenVerify', () => {
  return (req, res, next) => {
    req.user = { id: 1 };
    next();
  };
});

describe('Order Routes', () => {
  let app;
  const mockUserId = 1;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/orders', orderRouter);
    jest.clearAllMocks();
  });

  // TEST 1: GET order items by orderId
  test('GET /orders/items/:orderId should return order items', async () => {
    const mockItems = [
      {
        productName: 'Laptop',
        quantity: 1,
        price: 250000,
        prodId: 1,
      },
      {
        productName: 'Monitor',
        quantity: 2,
        price: 45000,
        prodId: 2,
      },
    ];

    Order.getOrderItems.mockResolvedValue(mockItems);

    const response = await request(app).get('/orders/items/1').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(Order.getOrderItems).toHaveBeenCalledWith('1');
  });

  // TEST 2: GET order items - empty list
  test('GET /orders/items/:orderId should return empty array if no items', async () => {
    Order.getOrderItems.mockResolvedValue([]);

    const response = await request(app).get('/orders/items/999').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data).toEqual([]);
  });

  // TEST 3: GET order items - invalid orderId
  test('GET /orders/items/:orderId should reject invalid orderId', async () => {
    const response = await request(app).get('/orders/items/abc').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid orderId');
  });

  // TEST 4: GET order items - negative orderId
  test('GET /orders/items/:orderId should reject negative orderId', async () => {
    const response = await request(app).get('/orders/items/-1').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid orderId');
  });

  // TEST 5: GET order items - zero orderId
  test('GET /orders/items/:orderId should reject zero orderId', async () => {
    const response = await request(app).get('/orders/items/0').expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 6: GET order items - database error
  test('GET /orders/items/:orderId should handle database error', async () => {
    Order.getOrderItems.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/orders/items/1').expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('server error');
  });

  // TEST 7: GET my orders
  test('GET /orders/my-orders should return user orders', async () => {
    const mockOrders = [
      {
        orderId: 1,
        userId: 1,
        shippingAddress: 'Budapest, Main St',
        paymentMethod: 'Utánvét',
        couponCode: null,
        createdAt: '2026-03-13',
      },
      {
        orderId: 2,
        userId: 1,
        shippingAddress: 'Budapest, Side St',
        paymentMethod: 'Card',
        couponCode: 'SAVE10',
        createdAt: '2026-03-12',
      },
    ];

    Order.fetchByUserId.mockResolvedValue(mockOrders);

    const response = await request(app).get('/orders/my-orders').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(Order.fetchByUserId).toHaveBeenCalledWith(mockUserId);
  });

  // TEST 8: GET my orders - empty list
  test('GET /orders/my-orders should return empty array if no orders', async () => {
    Order.fetchByUserId.mockResolvedValue([]);

    const response = await request(app).get('/orders/my-orders').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data).toEqual([]);
  });

  // TEST 9: GET my orders - database error
  test('GET /orders/my-orders should handle database error', async () => {
    Order.fetchByUserId.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/orders/my-orders').expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('server error');
  });

  // TEST 10: POST place order - success
  test('POST /orders/place-order should create order successfully', async () => {
    const mockSave = {
      result: 'success',
      orderId: 1,
    };

    Order.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSave),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        shippingAddress: 'Budapest, Main Street 1',
        paymentMethod: 'Utánvét',
        couponCode: null,
      })
      .expect(201);

    expect(response.body.result).toBe('success');
    expect(response.body.message).toContain('Order placed successfully');
  });

  // TEST 11: POST place order - with coupon code
  test('POST /orders/place-order should accept coupon code', async () => {
    const mockSave = {
      result: 'success',
      orderId: 2,
    };

    Order.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSave),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        shippingAddress: 'Budapest, Side Street 2',
        paymentMethod: 'Card',
        couponCode: 'SAVE10',
      })
      .expect(201);

    expect(response.body.result).toBe('success');
  });

  // TEST 12: POST place order - missing shipping address
  test('POST /orders/place-order should fail without shipping address', async () => {
    const mockSave = {
      result: 'fail',
      message: 'Missing shipping address',
    };

    Order.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSave),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        paymentMethod: 'Utánvét',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 13: POST place order - missing payment method
  test('POST /orders/place-order should fail without payment method', async () => {
    const mockSave = {
      result: 'fail',
      message: 'Missing payment method',
    };

    Order.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSave),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        shippingAddress: 'Budapest, Main St',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 14: POST place order - database error during save
  test('POST /orders/place-order should handle database error', async () => {
    Order.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Database error')),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        shippingAddress: 'Budapest, Main St',
        paymentMethod: 'Utánvét',
        couponCode: null,
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('server error');
  });

  // TEST 15: POST place order - save returns fail
  test('POST /orders/place-order should handle save failure', async () => {
    const mockSave = {
      result: 'fail',
      message: 'Cart is empty',
    };

    Order.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockSave),
    }));

    const response = await request(app)
      .post('/orders/place-order')
      .send({
        shippingAddress: 'Budapest, Main St',
        paymentMethod: 'Utánvét',
        couponCode: null,
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('Cart is empty');
  });
});
