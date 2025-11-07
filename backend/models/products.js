let products = [];

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

    static fetchAll(){
        return products;
    }
}