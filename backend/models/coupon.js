const db = require('../util/database');

module.exports = class Coupon {
  static async add(code, price) {
    try {
      const [rows] = await db.execute(
        'SELECT code FROM coupons WHERE code = ?',
        [code]
      );
      if (rows.length > 0) {
        return { result: 'fail', message: 'ez a kód már létezik' };
      }

      const [rows2] = await db.execute(
        'INSERT INTO coupons(code, value, usedAt, orderId) VALUES(?, ?, NULL, NULL);',
        [code, price]
      );

      return { result: 'success' };
    } catch (err) {
      return { result: 'fail' };
    }
  }

  static async check(code) {
    try {
      const [rows] = await db.execute(
        'SELECT value FROM coupons WHERE code = ? AND coupons.usedAt IS NULL;',
        [code]
      );

      if (rows.length > 1) {
        return { result: 'fail', message: 'érvénytelen kód' };
      }

      return { result: 'success', data: rows[0] };
    } catch (err) {
      return { result: 'fail', message: 'Szerver hiba' };
    }
  }
};
