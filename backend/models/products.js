let products = [
    {
    "prodName": "Wired Mouse",
    "prodId": 1,
    "prodDescription": "Ergonomic wired mouse with adjustable DPI.",
    "prodPrice": 25.99,
    "prodImg": "https://example.com/images/wireless-mouse.jpg"
  },
  {
    "prodName": "Mechanical Keyboard",
    "prodId": 2,
    "prodDescription": "RGB mechanical keyboard with tactile switches and customizable lighting.",
    "prodPrice": 79.99,
    "prodImg": "https://example.com/images/mechanical-keyboard.jpg"
  }
];

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