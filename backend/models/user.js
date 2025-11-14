const bcrypt = require('bcrypt');

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
      console.log(this);
      users.push(this);
      return {
        result: 'success',
        data: { username: this.userName, email: this.email },
      };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }
};
