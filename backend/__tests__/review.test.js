const request = require('supertest');
const express = require('express');
const reviewRouter = require('../routes/reviewRouter');
const Review = require('../models/review');

jest.mock('../models/review');
jest.mock('../util/tokenVerify', () => {
  return (req, res, next) => {
    req.user = { id: 1 };
    next();
  };
});

describe('Review Router', () => {
  let app;
  const mockUserId = 1;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/reviews', reviewRouter);
    jest.clearAllMocks();
  });

  // TEST 1: GET reviews for product
  test('GET /reviews/:productId should return product reviews', async () => {
    const mockReviews = [
      {
        reviewId: 1,
        userName: 'user1',
        rating: 5,
        comment: 'Great product!',
        createdAt: '2026-03-13',
      },
      {
        reviewId: 2,
        userName: 'user2',
        rating: 4,
        comment: 'Good quality',
        createdAt: '2026-03-12',
      },
    ];

    Review.fetchByProductId.mockResolvedValue(mockReviews);

    const response = await request(app).get('/reviews/1').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(Review.fetchByProductId).toHaveBeenCalledWith(1);
  });

  // TEST 2: GET reviews - empty list
  test('GET /reviews/:productId should return empty array if no reviews', async () => {
    Review.fetchByProductId.mockResolvedValue([]);

    const response = await request(app).get('/reviews/999').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data).toEqual([]);
  });

  // TEST 3: GET reviews - invalid product id
  test('GET /reviews/:productId should reject invalid product id', async () => {
    const response = await request(app).get('/reviews/abc').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('id must be a number');
  });

  // TEST 4: GET reviews - negative product id
  test('GET /reviews/:productId should reject negative product id', async () => {
    const response = await request(app).get('/reviews/-1').expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('id must be a number');
  });

  // TEST 5: GET reviews - zero product id
  test('GET /reviews/:productId should reject zero product id', async () => {
    const response = await request(app).get('/reviews/0').expect(400);

    expect(response.body.result).toBe('fail');
  });

  // TEST 6: GET reviews - database error
  test('GET /reviews/:productId should handle database error', async () => {
    Review.fetchByProductId.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/reviews/1').expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('Database error');
  });

  // TEST 7: POST create review - success
  test('POST /reviews should create new review', async () => {
    const mockResult = { result: 'success', reviewId: 1 };
    Review.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockResult),
    }));

    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 1,
        rating: 5,
        comment: 'Excellent product!',
      })
      .expect(201);

    expect(response.body.result).toBe('success');
    expect(response.body.reviewId).toBe(1);
  });

  // TEST 8: POST - missing productId
  test('POST /reviews should reject missing productId', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        rating: 5,
        comment: 'Great!',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('missing fields');
  });

  // TEST 9: POST - missing rating
  test('POST /reviews should reject missing rating', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 1,
        comment: 'Great!',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('missing fields');
  });

  // TEST 10: POST - missing comment
  test('POST /reviews should reject missing comment', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 1,
        rating: 5,
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('missing fields');
  });

  // TEST 11: POST - invalid product id
  test('POST /reviews should reject invalid product id', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 'abc',
        rating: 5,
        comment: 'Great!',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('id must be a number');
  });

  // TEST 12: POST - negative product id
  test('POST /reviews should reject negative product id', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        productId: -1,
        rating: 5,
        comment: 'Great!',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('id must be a number');
  });

  // TEST 13: POST - save failure
  test('POST /reviews should handle save failure', async () => {
    const mockResult = { result: 'fail', message: 'Cannot save review' };
    Review.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockResult),
    }));

    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 1,
        rating: 5,
        comment: 'Great!',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 14: POST - database error
  test('POST /reviews should handle database error', async () => {
    Review.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Database error')),
    }));

    const response = await request(app)
      .post('/reviews')
      .send({
        productId: 1,
        rating: 5,
        comment: 'Great!',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('server error');
  });
});
