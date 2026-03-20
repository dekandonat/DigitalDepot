const db = require('../util/database');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = class UsedProduct {
  constructor(userId, productName, productDescription, conditionState, productImage) {
    this.userId = userId;
    this.productName = productName;
    this.productDescription = productDescription;
    this.conditionState = conditionState;
    this.productImage = productImage;
  }

  async save() {
    try {
      await db.execute(
        `INSERT INTO used_product_submissions (userId, productName, productDescription, conditionState, productImage, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [this.userId, this.productName, this.productDescription, this.conditionState, this.productImage]
      );

      return { result: 'success' };
    } catch (err) {
      return { result: 'fail', message: err.message };
    }
  }

  static async fetchAll() {
    try {
      const [rows] = await db.execute(
        `SELECT used_product_submissions.*, users.userName, users.email, users.bankAccountNumber 
         FROM used_product_submissions 
         JOIN users ON used_product_submissions.userId = users.userId 
         ORDER BY used_product_submissions.submissionDate DESC`
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async fetchByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM used_product_submissions WHERE userId = ? ORDER BY submissionDate DESC`,
        [userId]
      );
      return rows;
    } catch (err) {
      throw err;
    }
  }

  static async updateStatus(submissionId, status, offerPrice) {
    try {
        await db.execute(
            `UPDATE used_product_submissions SET status = ?, adminOfferPrice = ? WHERE submissionId = ?`,
            [status, offerPrice, submissionId]
        );

        if (status === 'accepted') {
            try {
                const [rows] = await db.execute(
                    `SELECT users.email, used_product_submissions.productName 
                     FROM used_product_submissions 
                     JOIN users ON used_product_submissions.userId = users.userId 
                     WHERE submissionId = ?`,
                    [submissionId]
                );

                if (rows.length > 0) {
                    const email = rows[0].email;
                    const productName = rows[0].productName;
                    
                    let htmlbody = `<h1>Ajánlat érkezett!</h1>
                                    <p>Tisztelt Ügyfelünk!</p>
                                    <p>Az Ön által beküldött <b>${productName}</b> termékre üzletünk <b>${offerPrice} Ft</b> összegű ajánlatot tesz.</p>
                                    <p>Kérjük, lépjen be a weboldalra, és a profilján belül fogadja el, vagy utasítsa el az ajánlatot.</p>`;

                    await transporter.sendMail({
                        from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: 'Ajánlat érkezett használt termékére',
                        html: htmlbody,
                    });
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        return { result: 'success' };
    } catch (err) {
        return { result: 'fail', message: err.message };
    }
  }

  static async userRespondToOffer(submissionId, decision) {
      try {
          const newStatus = decision == 'accept' ? 'offer_accepted' : 'offer_rejected';
          
          await db.execute(
              `UPDATE used_product_submissions SET status = ? WHERE submissionId = ?`,
              [newStatus, submissionId]
          );

          if (decision === 'accept') {
              try {
                  const [rows] = await db.execute(
                      `SELECT users.email, used_product_submissions.productName, used_product_submissions.adminOfferPrice 
                       FROM used_product_submissions 
                       JOIN users ON used_product_submissions.userId = users.userId 
                       WHERE submissionId = ?`,
                      [submissionId]
                  );

                  if (rows.length > 0) {
                      const email = rows[0].email;
                      const productName = rows[0].productName;
                      const offerPrice = rows[0].adminOfferPrice;
                      
                      let htmlbody = `<h1>Sikeres megegyezés!</h1>
                                      <p>Tisztelt Ügyfelünk!</p>
                                      <p>Ön sikeresen elfogadta a(z) <b>${productName}</b> termékre tett <b>${offerPrice} Ft</b> összegű ajánlatunkat.</p>
                                      <h3>A következő lépések:</h3>
                                      <ul>
                                        <li>Kérjük, csomagolja be a terméket biztonságosan, hogy a szállítás során ne sérülhessen meg.</li>
                                        <li>Hamarosan küldjük a futárunkat a csomagért az Ön által megadott címre.</li>
                                        <li>A termék beérkezése és fizikai állapotának ellenőrzése után a megegyezett összeget 1-3 munkanapon belül átutaljuk a profiljában megadott bankszámlaszámra.</li>
                                      </ul>
                                      <p>Köszönjük, hogy minket választott!</p>`;

                      await transporter.sendMail({
                          from: `"DigitalDepot" <${process.env.EMAIL_USER}>`,
                          to: email,
                          subject: 'Sikeres megegyezés - Teendők',
                          html: htmlbody,
                      });
                  }
              } catch (err) {
                  console.log(err.message);
              }
          }

          return { result: 'success' };
      } catch (err) {
          return { result: 'fail', message: err.message };
      }
  }

  static async publishToShop(submissionId, productData) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            `INSERT INTO products (productName, productDescription, productPrice, productImg, categoryId, conditionState) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                productData.productName,
                productData.productDescription,
                productData.productPrice,
                productData.productImg,
                productData.categoryId,
                productData.conditionState
            ]
        );

        await connection.execute(
            `UPDATE used_product_submissions SET status = 'listed' WHERE submissionId = ?`,
            [submissionId]
        );

        await connection.commit();
        return { result: 'success' };
    } catch (err) {
        await connection.rollback();
        return { result: 'fail', message: err.message };
    } finally {
        connection.release();
    }
  }
};