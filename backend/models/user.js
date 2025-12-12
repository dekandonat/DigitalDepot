const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../util/database');

const users = [];

module.exports = class User {
  constructor(userName, password, email) {
    this.userName = userName;
    this.password = password;
    this.email = email;
  }

  async register() {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      await db.execute(
        `INSERT INTO users (userName, hashedPassword, email, verified, role) VALUES ('${this.userName}', '${this.password}', '${this.email}', FALSE, 'user');`
      );
      return {
        result: 'success',
        data: { username: this.userName, email: this.email },
      };
    } catch (err) {
      return { result: 'fail', data: err.message };
    }
  }

  static async login(email, password) {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE users.email LIKE "${email}"`
    );

    if (rows.length == 0) {
      return { result: 'fail', data: 'no such user exists' };
    }

    const hashedPassword = rows[0].hashedPassword;
    const result = await bcrypt.compare(password, hashedPassword);

    if (result) {
      try {
        const userEmail = rows[0].email;
        const userName = rows[0].userName;
        const id = rows[0].userId;
        const role = rows[0].role;
        const token = jwt.sign(
          {
            id: id,
            role: role,
          },
          process.env.SECRET,
          {
            expiresIn: '1h',
          }
        );
        return {
          result: 'success',
          message: { email: userEmail, userName: userName, token: token },
        };
      } catch (err) {
        return { result: 'fail', data: 'token generation failed' };
      }
    } else {
      return { result: 'fail', data: 'incorrect password' };
    }
  }
};
