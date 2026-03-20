const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const userRouter = require('../routes/userRouter');
const User = require('../models/user');
const db = require('../util/database');

jest.mock('../models/user');
jest.mock('../util/database');
jest.mock('../util/tokenVerify', () => {
  return (req, res, next) => {
    req.user = { id: 1 };
    next();
  };
});

describe('User Router', () => {
  let app;
  const mockUserId = 1;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use((req, res, next) => {
      req.cookies = req.cookies || {};
      next();
    });
    app.use('/user', userRouter);
    jest.clearAllMocks();
  });

  // ========== AUTHENTICATION TESTS ==========

  // TEST 1: POST /user/register - success
  test('POST /user/register should register new user', async () => {
    const mockResult = {
      result: 'success',
      data: { username: 'newuser', email: 'new@example.com' },
    };
    User.mockImplementation(() => ({
      register: jest.fn().mockResolvedValue(mockResult),
    }));

    const response = await request(app)
      .post('/user/register')
      .send({
        userName: 'newuser',
        password: 'password123',
        email: 'new@example.com',
      })
      .expect(201);

    expect(response.body.result).toBe('success');
  });

  // TEST 2: POST /user/register - empty username
  test('POST /user/register should reject empty username', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        userName: '',
        password: 'password123',
        email: 'new@example.com',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid data');
  });

  // TEST 3: POST /user/register - empty password
  test('POST /user/register should reject empty password', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        userName: 'newuser',
        password: '',
        email: 'new@example.com',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid data');
  });

  // TEST 4: POST /user/register - empty email
  test('POST /user/register should reject empty email', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({
        userName: 'newuser',
        password: 'password123',
        email: '',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('invalid data');
  });

  // TEST 5: POST /user/register - email already in use
  test('POST /user/register should reject duplicate email', async () => {
    const mockResult = { result: 'fail', message: 'email already in use' };
    User.mockImplementation(() => ({
      register: jest.fn().mockResolvedValue(mockResult),
    }));

    const response = await request(app)
      .post('/user/register')
      .send({
        userName: 'newuser',
        password: 'password123',
        email: 'existing@example.com',
      })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 6: POST /user/login - success
  test('POST /user/login should login user successfully', async () => {
    const mockResult = {
      result: 'success',
      message: {
        email: 'test@example.com',
        userName: 'testuser',
        token: 'accessToken123',
      },
      refreshToken: 'refreshToken123',
    };
    User.login.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.message.email).toBe('test@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  // TEST 7: POST /user/login - user not found
  test('POST /user/login should fail if user not found', async () => {
    const mockResult = {
      result: 'fail',
      message: 'nem létezik ez a felhasználó',
    };
    User.login.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(401);

    expect(response.body.result).toBe('fail');
  });

  // TEST 8: POST /user/login - wrong password
  test('POST /user/login should fail with wrong password', async () => {
    const mockResult = {
      result: 'fail',
      message: 'helytelen jelszó',
    };
    User.login.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.result).toBe('fail');
  });

  // ========== PASSWORD RESET TESTS ==========

  // TEST 9: POST /user/reset-code - success
  test('POST /user/reset-code should send reset code', async () => {
    const mockResult = { result: 'success' };
    User.getCode.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/reset-code')
      .send({ email: 'test@example.com' })
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 10: POST /user/reset-code - no email
  test('POST /user/reset-code should reject missing email', async () => {
    const response = await request(app)
      .post('/user/reset-code')
      .send({})
      .expect(404);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('no email');
  });

  // TEST 11: POST /user/reset-code - user not found
  test('POST /user/reset-code should fail if user not found', async () => {
    const mockResult = { result: 'fail', message: 'no email found' };
    User.getCode.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/reset-code')
      .send({ email: 'nonexistent@example.com' })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // TEST 12: POST /user/reset-password
  test('POST /user/reset-password should reset password', async () => {
    const mockResult = { result: 'success' };
    User.resetPassword.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/reset-password')
      .send({
        email: 'test@example.com',
        code: '123456',
        password: 'newpassword',
      })
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 13: POST /user/reset-password - invalid code
  test('POST /user/reset-password should fail with invalid code', async () => {
    const mockResult = { result: 'fail', message: 'code doesnt match' };
    User.resetPassword.mockResolvedValue(mockResult);

    const response = await request(app)
      .post('/user/reset-password')
      .send({
        email: 'test@example.com',
        code: 'wrongcode',
        password: 'newpassword',
      })
      .expect(400);

    expect(response.body.result).toBe('fail');
  });

  // ========== PROFILE TESTS ==========

  // TEST 14: GET /user/profile
  test('GET /user/profile should return user profile', async () => {
    db.execute.mockResolvedValue([
      [
        {
          userName: 'testuser',
          email: 'test@example.com',
          bankAccountNumber: 'HU12345',
        },
      ],
    ]);

    const response = await request(app).get('/user/profile').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.data.userName).toBe('testuser');
  });

  // TEST 15: GET /user/profile - user not found
  test('GET /user/profile should fail if user not found', async () => {
    db.execute.mockResolvedValue([[]]);

    const response = await request(app).get('/user/profile').expect(404);

    expect(response.body.result).toBe('fail');
  });

  // TEST 16: PATCH /user/bank-account
  test('PATCH /user/bank-account should update bank account', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 1 }]);

    const response = await request(app)
      .patch('/user/bank-account')
      .send({ bankAccountNumber: 'HU99999' })
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 17: PATCH /user/bank-account - database error
  test('PATCH /user/bank-account should handle database error', async () => {
    db.execute.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .patch('/user/bank-account')
      .send({ bankAccountNumber: 'HU99999' })
      .expect(500);

    expect(response.body.result).toBe('fail');
  });

  // ========== MESSAGE TESTS ==========

  // TEST 18: GET /user/messages
  test('GET /user/messages should return user messages', async () => {
    const mockMessages = [
      { messageId: 1, sender: 1, recipientId: 2, content: 'Hello' },
    ];

    db.execute.mockResolvedValue([mockMessages]);

    const response = await request(app).get('/user/messages').expect(200);

    expect(response.body.result).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // TEST 19: POST /user/readmessages
  test('POST /user/readmessages should mark messages as read', async () => {
    db.execute.mockResolvedValue([{ affectedRows: 2 }]);

    const response = await request(app).post('/user/readmessages').expect(200);

    expect(response.body.result).toBe('success');
    expect(response.body.affectedRows).toBe(2);
  });

  // ========== REFRESH TOKEN TESTS ==========

  // TEST 20: GET /user/refresh - success
  test('GET /user/refresh should refresh access token', async () => {
    const mockResult = {
      result: 'success',
      data: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    };
    User.refresh.mockResolvedValue(mockResult);

    const response = await request(app)
      .get('/user/refresh')
      .set('Cookie', ['refresh_token=validRefreshToken'])
      .expect(200);

    expect(response.body.result).toBe('success');
  });

  // TEST 21: GET /user/refresh - no token
  test('GET /user/refresh should fail without refresh token', async () => {
    const response = await request(app).get('/user/refresh').expect(401);

    expect(response.body.result).toBe('fail');
    expect(response.body.message).toContain('no refresh token');
  });

  // TEST 22: GET /user/refresh - invalid token
  test('GET /user/refresh should fail with invalid token', async () => {
    const mockResult = { result: 'fail', message: 'token error' };
    User.refresh.mockResolvedValue(mockResult);

    const response = await request(app)
      .get('/user/refresh')
      .set('Cookie', ['refresh_token=invalidToken'])
      .expect(500);

    expect(response.body.result).toBe('fail');
  });
});
