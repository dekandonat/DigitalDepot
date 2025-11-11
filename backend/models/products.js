const db = require('../util/database');

module.exports = class Products{
    constructor(prodName, prodId, prodDescription, prodPrice, prodImg){
        this.prodName = prodName;
        this.prodId = prodId;
        this.prodDescription = prodDescription;
        this.prodPrice = prodPrice;
        this.prodImg = prodImg;
    }

    save(){ 
        products.push(this);
        console.log(products);
    }

    static async fetchAll(){
        try{
            const [rows] = await db.execute('SELECT * FROM products');
            console.log(rows);
            return rows;
        }
        catch(err){
            throw err;
        }
    }

    static async fetch(id){
        try{
            const [rows] = await db.execute(`SELECT * FROM products WHERE prodId = ${id}`);
            console.log(rows);
            return rows;
        }
        catch(err){
            throw err;
        }
    }
}