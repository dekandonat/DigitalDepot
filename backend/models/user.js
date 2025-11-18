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
        `INSERT INTO users (userName, hashedPassword, email, verified) VALUES ('${this.userName}', '${this.password}', '${this.email}', FALSE);`
      );
      return {
        result: 'success',
        data: { username: this.userName, email: this.email },
      };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async login(email, password) {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE users.email LIKE "${email}"`
    );

    if (rows.length == 0) {
      return { result: 'fail', message: 'no such user exists' };
    }

    const hashedPassword = rows[0].hashedPassword;
    const result = await bcrypt.compare(password, hashedPassword);

    if (result) {
      const email = rows[0].email;
      const userName = rows[0].userName;
      const id = rows[0].userId;
      return {
        result: 'success',
        message: { email: email, userName: userName, id: id },
      };
    } else {
      return { result: 'fail', data: 'incorrect password' };
    }
  }
};
