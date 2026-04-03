const db = require('../util/database');

module.exports = class News {
  static async FetchAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM news');
      return { result: 'success', data: rows };
    } catch (err) {
      console.log(err.message);
      return { result: 'fail', message: 'database error' };
    }
  }

  static async Upload(img, alt) {
    try {
      const [rows] = await db.execute(
        'INSERT INTO news(img, alt) VALUES (?, ?);',
        [img, alt]
      );
      if (rows.affectedRows == 1) {
        return { result: 'success' };
      } else {
        return { result: 'success', message: 'no rows affected' };
      }
    } catch (err) {
      console.log(err.message);
      return { result: 'fail', message: 'database error' };
    }
  }

  static async Delete(id) {
    try {
      const [rows] = await db.execute('DELETE from news WHERE news.id = ?', [
        id,
      ]);

      if (rows.affectedRows >= 1) {
        return { result: 'success' };
      } else {
        return { result: 'success', message: 'no rows affected' };
      }
    } catch (err) {
      console.log(err.message);
      return { result: 'fail', message: 'database error' };
    }
  }
};
