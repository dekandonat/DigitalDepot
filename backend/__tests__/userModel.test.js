const User = require('../models/user');
const db = require('../util/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('../util/database');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('../models/user').recoveryCodes = [];
  });

  // ========== CONSTRUCTOR TESTS ==========

  // TEST 1: User constructor
  test('should create a user object with valid data', () => {
    const user = new User(
      'testuser',
      'password123',
      'test@example.com',
      'user'
    );

    expect(user.userName).toBe('testuser');
    expect(user.password).toBe('password123');
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('user');
  });

  // ========== REGISTRATION TESTS ==========

  // TEST 2: Register user - success
  test('should register a new user successfully', async () => {
    db.execute
      .mockResolvedValueOnce([[]]) // No existing email
      .mockResolvedValueOnce([{ insertId: 1 }]); // Insert result

    bcrypt.hash.mockResolvedValue('hashedPassword123');

    const user = new User('newuser', 'password123', 'new@example.com', 'user');
    const result = await user.register();

    expect(result.result).toBe('success');
    expect(result.data.username).toBe('newuser');
    expect(result.data.email).toBe('new@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
  });

  // TEST 3: Register - email already exists
  test('should fail if email already in use', async () => {
    db.execute.mockResolvedValueOnce([[{ email: 'existing@example.com' }]]);

    const user = new User(
      'newuser',
      'password123',
      'existing@example.com',
      'user'
    );
    const result = await user.register();

    expect(result.result).toBe('fail');
  });

  // TEST 4: Register - database error during check
  test('should handle database errors during email check', async () => {
    db.execute.mockRejectedValueOnce(new Error('Database error'));

    const user = new User('newuser', 'password123', 'new@example.com', 'user');
    const result = await user.register();

    expect(result.result).toBe('fail');
  });

  // TEST 5: Register - database error during insert
  test('should handle database errors during insert', async () => {
    db.execute
      .mockResolvedValueOnce([[]]) // Email check passes
      .mockRejectedValueOnce(new Error('Insert failed'));

    bcrypt.hash.mockResolvedValue('hashedPassword123');

    const user = new User('newuser', 'password123', 'new@example.com', 'user');
    const result = await user.register();

    expect(result.result).toBe('fail');
  });

  // ========== LOGIN TESTS ==========

  // TEST 6: Login - successful with tokens
  test('should login user and return access and refresh tokens', async () => {
    db.execute
      .mockResolvedValueOnce([
        [
          {
            userId: 1,
            email: 'test@example.com',
            userName: 'testuser',
            hashedPassword: 'hashedPassword123',
            role: 'user',
          },
        ],
      ])
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete old tokens
      .mockResolvedValueOnce([{ insertId: 1 }]); // Insert new token

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('accessToken123');

    const result = await User.login('test@example.com', 'password123');

    expect(result.result).toBe('success');
    expect(result.message.email).toBe('test@example.com');
    expect(result.message.userName).toBe('testuser');
    expect(result.message.token).toBe('accessToken123');
    expect(result.refreshToken).toBeDefined();
    expect(jwt.sign).toHaveBeenCalled();
  });

  // TEST 7: Login - user not found
  test('should fail if user does not exist', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const result = await User.login('nonexistent@example.com', 'password123');

    expect(result.result).toBe('fail');
  });

  // TEST 8: Login - wrong password
  test('should fail with incorrect password', async () => {
    db.execute.mockResolvedValueOnce([
      [
        {
          userId: 1,
          email: 'test@example.com',
          userName: 'testuser',
          hashedPassword: 'hashedPassword123',
          role: 'user',
        },
      ],
    ]);

    bcrypt.compare.mockResolvedValue(false);

    const result = await User.login('test@example.com', 'wrongpassword');

    expect(result.result).toBe('fail');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongpassword',
      'hashedPassword123'
    );
  });

  // TEST 9: Login - database error
  test('should handle database errors during login', async () => {
    db.execute.mockRejectedValueOnce(new Error('Database connection failed'));

    const result = await User.login('test@example.com', 'password123');

    expect(result.result).toBe('fail');
  });

  // TEST 10: Login - bcrypt error
  test('should handle bcrypt errors', async () => {
    db.execute.mockResolvedValueOnce([
      [
        {
          userId: 1,
          email: 'test@example.com',
          userName: 'testuser',
          hashedPassword: 'hashedPassword123',
          role: 'user',
        },
      ],
    ]);

    bcrypt.compare.mockRejectedValueOnce(new Error('Bcrypt error'));

    const result = await User.login('test@example.com', 'password123');

    expect(result.result).toBe('fail');
  });

  // ========== FETCH ALL USERS TESTS ==========

  // TEST 11: Fetch all users
  test('should fetch all users', async () => {
    const mockUsers = [
      {
        userId: 1,
        userName: 'user1',
        email: 'user1@example.com',
        role: 'user',
      },
      {
        userId: 2,
        userName: 'admin1',
        email: 'admin@example.com',
        role: 'admin',
      },
    ];

    db.execute.mockResolvedValueOnce([mockUsers]);

    const users = await User.fetchAllUsers();

    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
    expect(users[0].userName).toBe('user1');
    expect(users[1].role).toBe('admin');
  });

  // TEST 12: Fetch all users - empty
  test('should return empty array if no users', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const users = await User.fetchAllUsers();

    expect(users).toEqual([]);
  });

  // TEST 13: Fetch all users - database error
  test('should throw error on database failure', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    await expect(User.fetchAllUsers()).rejects.toThrow('DB Error');
  });

  // ========== UPDATE ROLE TESTS ==========

  // TEST 14: Update user role
  test('should update user role successfully', async () => {
    db.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await User.updateRole(1, 'admin');

    expect(result.result).toBe('success');
    expect(db.execute).toHaveBeenCalledWith(
      'UPDATE users SET role = ? WHERE userId = ?',
      ['admin', 1]
    );
  });

  // TEST 15: Update role - database error
  test('should handle database error on role update', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    const result = await User.updateRole(1, 'admin');

    expect(result.result).toBe('fail');
  });

  // ========== DELETE USER TESTS ==========

  // TEST 16: Delete user successfully
  test('should delete user and cascade delete related data', async () => {
    db.execute
      .mockResolvedValueOnce([{ affectedRows: 3 }]) // carts
      .mockResolvedValueOnce([{ affectedRows: 5 }]) // reviews
      .mockResolvedValueOnce([{ affectedRows: 2 }]) // used_product_submissions
      .mockResolvedValueOnce([{ affectedRows: 4 }]) // order_items
      .mockResolvedValueOnce([{ affectedRows: 2 }]) // orders
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // refreshtokens
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // users

    const result = await User.deleteUser(1);

    expect(result.result).toBe('success');
    expect(db.execute).toHaveBeenCalledTimes(7);
  });

  // TEST 17: Delete user - cascade order
  test('should delete in correct cascade order', async () => {
    const callOrder = [];
    db.execute.mockImplementation((sql) => {
      callOrder.push(sql);
      return Promise.resolve([{ affectedRows: 1 }]);
    });

    await User.deleteUser(1);

    // Verify carts deleted before user
    expect(callOrder[0]).toContain('carts');
    // Verify users deleted last
    expect(callOrder[6]).toContain('users WHERE');
  });

  // TEST 18: Delete user - database error
  test('should handle database error during delete', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    const result = await User.deleteUser(1);

    expect(result.result).toBe('fail');
  });

  // ========== RECOVERY CODE TESTS ==========

  // TEST 19: Get recovery code - success
  test('should generate recovery code for existing user', async () => {
    db.execute.mockResolvedValueOnce([[{ userId: 1 }]]);

    const result = await User.getCode('test@example.com');

    expect(result.result).toBe('success');
  });

  // TEST 21: Get recovery code - database error
  test('should handle database error on get code', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    const result = await User.getCode('test@example.com');

    expect(result.result).toBe('fail');
  });

  // ========== PASSWORD RESET TESTS ==========

  // TEST 22: Reset password - code not found in memory
  test('should fail if recovery code not found', async () => {
    db.execute.mockResolvedValueOnce([[{ userId: 1 }]]);

    const result = await User.resetPassword(
      'test@example.com',
      '000000',
      'newpassword'
    );

    expect(result.result).toBe('fail');
  });

  // TEST 23: Reset password - user not found
  test('should fail if user not found', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const result = await User.resetPassword(
      'nonexistent@example.com',
      '123456',
      'newpassword'
    );

    expect(result.result).toBe('fail');
  });

  // TEST 24: Reset password - database error
  test('should handle database error on reset', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    const result = await User.resetPassword(
      'test@example.com',
      '123456',
      'newpassword'
    );

    expect(result.result).toBe('fail');
  });

  // ========== REFRESH TOKEN TESTS ==========

  // TEST 25: Refresh token - success
  test('should refresh token successfully', async () => {
    db.execute
      .mockResolvedValueOnce([
        [
          {
            tokenId: 'hashedToken123',
            userId: 1,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
        ],
      ])
      .mockResolvedValueOnce([[{ userId: 1, role: 'user' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ insertId: 1 }]);

    jwt.sign.mockReturnValue('newAccessToken');

    const result = await User.refresh('validRefreshToken');

    expect(result.result).toBe('success');
    expect(result.data).toBe('newAccessToken');
    expect(result.refreshToken).toBeDefined();
  });

  // TEST 26: Refresh token - not found
  test('should fail if refresh token not found', async () => {
    db.execute.mockResolvedValueOnce([[]]);

    const result = await User.refresh('invalidToken');

    expect(result.result).toBe('fail');
  });

  // TEST 27: Refresh token - expired
  test('should fail if token is expired', async () => {
    db.execute.mockResolvedValueOnce([
      [
        {
          tokenId: 'expiredToken',
          userId: 1,
          expiresAt: new Date(Date.now() - 1000).toISOString(), // Past date
        },
      ],
    ]);

    const result = await User.refresh('expiredToken');

    expect(result.result).toBe('fail');
  });

  // TEST 28: Refresh token - database error
  test('should handle database error on refresh', async () => {
    db.execute.mockRejectedValueOnce(new Error('DB Error'));

    const result = await User.refresh('token123');

    expect(result.result).toBe('fail');
  });
});
