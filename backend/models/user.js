const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../util/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

let recoveryCodes = [];

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = class User {
  constructor(userName, password, email, role) {
    this.userName = userName;
    this.password = password;
    this.email = email;
    this.role = role;
  }

  static async resetPassword(email, code, password) {
    try {
      const [rows] = await db.execute(
        'SELECT users.userId FROM users WHERE email = ?',
        [email]
      );

      if (rows.length == 0) {
        return { result: 'fail', message: 'no such account' };
      }

      const userId = rows[0].userId;
      const recoveryCode = recoveryCodes.find((codes) => codes.id == userId);

      if (!recoveryCode) {
        return {
          result: 'fail',
          message: 'no code for account',
        };
      }

      if (recoveryCode.expiresAt > Date.now()) {
        if (recoveryCode.code == code) {
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
              'UPDATE users SET hashedPassword = ? WHERE userId = ?;',
              [hashedPassword, userId]
            );

            recoveryCodes = recoveryCodes.filter((code) => code.id != userId);
            return { result: 'success' };
          } catch (err) {
            console.log(err);
            return { result: 'fail', message: 'server error' };
          }
        } else {
          return { result: 'fail', message: 'code doesnt match' };
        }
      } else {
        return { result: 'fail', message: 'code expired' };
      }
    } catch (err) {
      console.log(err);
      return { result: 'fail', message: 'server error' };
    }
  }

  static async getCode(email) {
    try {
      //id keresése
      const [rows] = await db.execute(
        'SELECT users.userId FROM users WHERE email = ?',
        [email]
      );

      if (rows.length > 0) {
        //Kód generálása
        const code = Math.floor(100000 + Math.random() * 900000);

        //lejárt kódok törlése
        recoveryCodes = recoveryCodes.filter(
          (code) => code.expiresAt > Date.now()
        );

        //felhasználó régi kódjainak a törlése
        recoveryCodes = recoveryCodes.filter(
          (code) => code.id != rows[0].userId
        );

        recoveryCodes.push({
          id: rows[0].userId,
          code: code,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        //Email küldése
        await transporter.sendMail({
          from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Helyreállító Kód',
          text: `Ezt a kódot tudja használni a helyreállításhoz: ${code}`,
        });

        return { result: 'success' };
      } else {
        return { result: 'fail', message: 'no email found' };
      }
    } catch (err) {
      console.log(err);
      return { result: 'fail', message: 'server error' };
    }
  }

  async register() {
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
      await db.execute(
        `INSERT INTO users (userName, hashedPassword, email, verified, role) VALUES ('${this.userName}', '${this.password}', '${this.email}', FALSE, '${this.role}');`
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
    try {
      const [rows] = await db.execute(
        `SELECT * FROM users WHERE users.email LIKE ?`,
        [email]
      );

      if (rows.length == 0) {
        return { result: 'fail', data: 'no such user exists' };
      }

      const hashedPassword = rows[0].hashedPassword;
      const result = await bcrypt.compare(password, hashedPassword);

      if (result) {
        const userEmail = rows[0].email;
        const userName = rows[0].userName;
        const id = rows[0].userId;
        const role = rows[0].role;
        //Access Token generálás
        const accessToken = jwt.sign(
          {
            id: id,
            role: role,
          },
          process.env.SECRET,
          {
            expiresIn: '1m',
          }
        );
        //refresh token generálás
        await db.execute('DELETE FROM refreshTokens WHERE userId = ?', [
          rows[0].userId,
        ]);
        const refreshtoken = crypto.randomBytes(64).toString('hex');
        const hashedToken = crypto
          .createHash('sha256')
          .update(refreshtoken)
          .digest('hex');
        await db.execute(
          'INSERT INTO refreshTokens (tokenId, userId, createdAt ,expiresAt) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))',
          [hashedToken, rows[0].userId]
        );
        return {
          result: 'success',
          message: {
            email: userEmail,
            userName: userName,
            token: accessToken,
          },
          refreshToken: refreshtoken,
        };
      } else {
        return { result: 'fail', data: 'incorrect password' };
      }
    } catch (err) {
      return { result: 'fail', message: 'server error' };
    }
  }

  static async refresh(token) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      const [rows] = await db.execute(
        'SELECT * FROM refreshtokens WHERE tokenId = ?',
        [hashedToken]
      );

      if (rows.length == 0) {
        return { result: 'fail', message: 'no token found' };
      }

      if (new Date(rows[0].expiresAt) <= new Date()) {
        return { result: 'fail', message: 'expired token' };
      }

      const [userData] = await db.execute(
        'SELECT * FROM users WHERE userId = ?',
        [rows[0].userId]
      );

      const accessToken = jwt.sign(
        {
          id: userData[0].userId,
          role: userData[0].role,
        },
        process.env.SECRET,
        {
          expiresIn: '1m',
        }
      );

      await db.execute('DELETE FROM refreshTokens WHERE tokenId = ?', [
        hashedToken,
      ]);

      const refreshtoken = crypto.randomBytes(64).toString('hex');
      const hashedRefreshtoken = crypto
        .createHash('sha256')
        .update(refreshtoken)
        .digest('hex');
      await db.execute(
        'INSERT INTO refreshTokens (tokenId, userId, createdAt ,expiresAt) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))',
        [hashedRefreshtoken, rows[0].userId]
      );

      return {
        result: 'success',
        data: accessToken,
        refreshToken: refreshtoken,
      };
    } catch (err) {
      console.log('Hiba: ' + err.message);
      return { result: 'fail', message: 'server error' };
    }
  }
};
