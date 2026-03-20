const request = require('supertest');
const express = require('express');
const categoryRouter = require('../routes/categoryRouter');
const db = require('../util/database');

jest.mock('../util/database');

describe('Category Router', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/categories', categoryRouter);
    jest.clearAllMocks();
  });

  // TEST 1: GET all categories
  test('GET /categories should return all categories', async () => {
    const mockCategories = [
      { categoryId: 1, categoryName: 'Computers' },
      { categoryId: 2, categoryName: 'Peripherals' },
      { categoryId: 3, categoryName: 'Software' },
    ];

    db.execute.mockResolvedValue([mockCategories]);

    const response = await request(app).get('/categories').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(3);
  });

  // TEST 2: GET single category
  test('GET /categories/:id should return single category', async () => {
    const mockCategory = [{ categoryId: 1, categoryName: 'Computers' }];

    db.execute.mockResolvedValue([mockCategory]);

    const response = await request(app).get('/categories/1').expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 3: Database error handling
  test('GET /categories should handle database error', async () => {
    db.execute.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/categories').expect(500);

    expect(response.body.result).toBe('fail');
  });
});
