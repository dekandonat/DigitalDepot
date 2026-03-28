const request = require('supertest');
const express = require('express');
const adminRouter = require('../routes/adminRouter');
const User = require('../models/user');
const Order = require('../models/order');
const Products = require('../models/products');
const db = require('../util/database');

jest.mock('../models/user');
jest.mock('../models/order');
jest.mock('../models/products');
jest.mock('../models/news');
jest.mock('../util/database');

// Mock upload middleware
jest.mock('../util/upload', () => ({
  uploadMiddleware: (req, res, next) => {
    req.file = { filename: 'test.jpg' };
    next();
  },
  uploadNewsMiddleware: (req, res, next) => {
    req.file = { filename: 'test.jpg' };
    next();
  },
}));

// Mock validateImage middleware
jest.mock('../util/validateImage', () => (req, res, next) => {
  next();
});

jest.mock('../util/tokenVerify', () => {
  return (req, res, next) => {
    req.user = { id: 1, role: 'owner' };
    next();
  };
});

describe('Admin Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock the verifyAdmin middleware
    app.use((req, res, next) => {
      req.user = { id: 1, role: 'owner' };
      next();
    });

    app.use('/admin', adminRouter);
    jest.clearAllMocks();
  });

  // ========== USER MANAGEMENT TESTS ==========

  // TEST 1: POST /admin/register - success
  test('POST /admin/register should create admin user', async () => {
    const mockResult = {
      result: 'success',
      data: { username: 'newadmin', email: 'admin@example.com' },
    };
    User.mockImplementation(() => ({
      register: jest.fn().mockResolvedValue(mockResult),
    }));

    const response = await request(app)
      .post('/admin/register')
      .send({
        userName: 'newadmin',
        password: 'password123',
        email: 'admin@example.com',
      })
      .expect(201);

    expect(response.body.result).toBe('success');
  });

  // TEST 2: POST /admin/register - missing fields
  test('POST /admin/register should reject missing fields', async () => {
    const response = await request(app)
      .post('/admin/register')
      .send({
        userName: 'newadmin',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('hiányzó adat');
  });

  // TEST 3: POST /admin/register - non-owner
  test('POST /admin/register should reject non-owner', async () => {
    const appNonOwner = express();
    appNonOwner.use(express.json());
    appNonOwner.use((req, res, next) => {
      req.user = { id: 1, role: 'user' };
      next();
    });
    appNonOwner.use('/admin', adminRouter);

    const response = await request(appNonOwner)
      .post('/admin/register')
      .send({
        userName: 'newadmin',
        password: 'password123',
        email: 'admin@example.com',
      })
      .expect(403);

    expect(response.body.result).toBe('fail');
  });

  // TEST 4: GET /admin/users
  test('GET /admin/users should return all users', async () => {
    const mockUsers = [
      {
        userId: 1,
        userName: 'user1',
        email: 'user1@example.com',
        role: 'user',
      },
      {
        userId: 2,
        userName: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      },
    ];

    User.fetchAllUsers.mockResolvedValue(mockUsers);

    const response = await request(app).get('/admin/users').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  // TEST 5: GET /admin/users - non-owner
  test('GET /admin/users should reject non-owner', async () => {
    const appNonOwner = express();
    appNonOwner.use(express.json());
    appNonOwner.use((req, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    });
    appNonOwner.use('/admin', adminRouter);

    const response = await request(appNonOwner).get('/admin/users').expect(403);

    expect(response.body.result).toBe('fail');
  });

  // TEST 6: PATCH /admin/users/:userId/role
  test('PATCH /admin/users/:userId/role should update user role', async () => {
    const mockResult = { result: 'success' };
    User.updateRole.mockResolvedValue(mockResult);

    const response = await request(app)
      .patch('/admin/users/5/role')
      .send({ role: 'admin' })
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(User.updateRole).toHaveBeenCalledWith(5, 'admin');
  });

  // TEST 7: PATCH /admin/users/:userId/role - invalid role
  test('PATCH /admin/users/:userId/role should reject invalid role', async () => {
    const response = await request(app)
      .patch('/admin/users/5/role')
      .send({ role: 'superadmin' })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('érvénytelen role');
  });

  // TEST 8: PATCH /admin/users/:userId/role - invalid userId
  test('PATCH /admin/users/:userId/role should reject invalid userId', async () => {
    const response = await request(app)
      .patch('/admin/users/abc/role')
      .send({ role: 'admin' })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 9: DELETE /admin/users/:userId
  test('DELETE /admin/users/:userId should delete user', async () => {
    const mockResult = { result: 'success' };
    User.deleteUser.mockResolvedValue(mockResult);

    const response = await request(app).delete('/admin/users/5').expect(200);

    expect(response.body.result).toBe('success');
    expect(User.deleteUser).toHaveBeenCalledWith(5);
  });

  // TEST 10: DELETE /admin/users/:userId - invalid id
  test('DELETE /admin/users/:userId should reject invalid id', async () => {
    const response = await request(app).delete('/admin/users/abc').expect(400);

    expect(response.body.result).toBe('fail');
  });

  // ========== ORDER MANAGEMENT TESTS ==========

  // TEST 11: GET /admin/orders
  test('GET /admin/orders should return all orders', async () => {
    const mockOrders = [
      {
        orderId: 1,
        userId: 1,
        totalPrice: 340000,
        orderDate: '2026-03-13',
        status: 'pending',
      },
      {
        orderId: 2,
        userId: 2,
        totalPrice: 150000,
        orderDate: '2026-03-12',
        status: 'shipped',
      },
    ];

    db.execute.mockResolvedValue([mockOrders]);

    const response = await request(app).get('/admin/orders').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
  });

  // TEST 12: GET /admin/orders/:orderId
  test('GET /admin/orders/:orderId should return order items', async () => {
    const mockItems = [
      { productName: 'Laptop', quantity: 1, price: 250000 },
      { productName: 'Monitor', quantity: 2, price: 45000 },
    ];

    Order.getOrderItems.mockResolvedValue(mockItems);

    const response = await request(app).get('/admin/orders/1').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // TEST 13: GET /admin/orders/:orderId - invalid id
  test('GET /admin/orders/:orderId should reject invalid id', async () => {
    const response = await request(app).get('/admin/orders/abc').expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 14: DELETE /admin/orders/:orderId
  test('DELETE /admin/orders/:orderId should delete order', async () => {
    const mockResult = { result: 'success' };
    Order.delete.mockResolvedValue(mockResult);

    const response = await request(app).delete('/admin/orders/1').expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 15: PATCH /admin/orders/:orderId/status
  test('PATCH /admin/orders/:orderId/status should update order status', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const response = await request(app)
      .patch('/admin/orders/1/status')
      .send({ status: 'shipped' })
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // ========== PRODUCT MANAGEMENT TESTS ==========

  // TEST 16: PATCH /admin/products/addInventory
  test('PATCH /admin/products/addInventory should add inventory', async () => {
    const mockResult = { result: 'success' };
    Products.addInventory.mockResolvedValue(mockResult);

    const response = await request(app)
      .patch('/admin/products/addInventory')
      .send({ id: 1, quantity: 10 })
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 17: PATCH /admin/products/:prodId
  test('PATCH /admin/products/:prodId should update product', async () => {
    const mockResult = { result: 'success' };
    Products.update.mockResolvedValue(mockResult);

    const response = await request(app)
      .patch('/admin/products/1')
      .send({
        prodName: 'Updated Laptop',
        prodDescription: 'High performance laptop',
        prodPrice: 300000,
        conditionState: 'new',
      })
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(Products.update).toHaveBeenCalledWith(
      1,
      'Updated Laptop',
      'High performance laptop',
      300000,
      'new'
    );
  });

  // TEST 18: PATCH /admin/products/:prodId - missing fields
  test('PATCH /admin/products/:prodId should reject missing fields', async () => {
    const response = await request(app)
      .patch('/admin/products/1')
      .send({
        prodName: 'Updated Laptop',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 19: PATCH /admin/products/:prodId - invalid price
  test('PATCH /admin/products/:prodId should reject invalid price', async () => {
    const response = await request(app)
      .patch('/admin/products/1')
      .send({
        prodName: 'Updated Laptop',
        prodDescription: 'High performance',
        prodPrice: -100,
        conditionState: 'new',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 20: PATCH /admin/products/:prodId - invalid id
  test('PATCH /admin/products/:prodId should reject invalid id', async () => {
    const response = await request(app)
      .patch('/admin/products/abc')
      .send({
        prodName: 'Updated Laptop',
        prodDescription: 'High performance',
        prodPrice: 300000,
        conditionState: 'new',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // ========== MESSAGE MANAGEMENT TESTS ==========

  // TEST 21: GET /admin/messages
  test('GET /admin/messages should return grouped messages', async () => {
    const mockMessages = [
      {
        id: 1,
        sender: 1,
        recipientId: 2,
        message: 'Hello',
        sentAt: '2026-03-13',
        unread: 0,
      },
    ];

    db.execute.mockResolvedValue([mockMessages]);

    const response = await request(app).get('/admin/messages').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // TEST 22: PATCH /admin/readmessages/:userId
  test('PATCH /admin/readmessages/:userId should mark messages as read', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 2 }]);

    const response = await request(app)
      .patch('/admin/readmessages/5')
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.affectedRows).toBe(2);
  });

  // TEST 23: PATCH /admin/readmessages/:userId - invalid id
  test('PATCH /admin/readmessages/:userId should reject invalid id', async () => {
    const response = await request(app)
      .patch('/admin/readmessages/abc')
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 24: DELETE /admin/messages/:id
  test('DELETE /admin/messages/:id should delete user messages', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 5 }]);

    const response = await request(app).delete('/admin/messages/5').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.affectedRows).toBe(5);
  });

  // TEST 25: DELETE /admin/messages/:id - invalid id
  test('DELETE /admin/messages/:id should reject invalid id', async () => {
    const response = await request(app)
      .delete('/admin/messages/abc')
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // ========== CATEGORY MANAGEMENT TESTS ==========

  // TEST 26: POST /admin - create category
  test('POST /admin should create new category', async () => {
    db.execute.mockResolvedValue([{ insertId: 1 }]);

    const response = await request(app)
      .post('/admin')
      .send({
        categoryName: 'Computers',
        parentId: null,
      })
      .expect(201);

    expect(response.body.result).toBe('success');
    expect(response.body.insertId).toBe(1);
  });

  // TEST 27: POST /admin - create subcategory
  test('POST /admin should create subcategory with parentId', async () => {
    db.execute.mockResolvedValue([{ insertId: 2 }]);

    const response = await request(app)
      .post('/admin')
      .send({
        categoryName: 'Laptops',
        parentId: 1,
      })
      .expect(201);

    expect(response.body.result).toBe('success');
  });

  // TEST 28: POST /admin - missing category name
  test('POST /admin should reject missing categoryName', async () => {
    const response = await request(app)
      .post('/admin')
      .send({
        parentId: null,
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });
});
