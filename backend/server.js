const express = require('express');
const cors = require("cors");

const app = express();

const IP = "localhost";
const PORT = 3000;

const Products = require('./models/products');

app.use(express.json());
app.use(cors());

app.post('/products', (req, res) => {
    const product = new Products(req.body.prodName, req.body.prodId , req.body.prodDescription, req.body.prodPrice, req.body.prodImg);
    product.save();
    res.status(201).json({message: "product saved!"});
});

app.get('/products/:prodId', (req, res) => {
    const id = req.params.prodId;
    const product = Products.fetchAll().find(prod => prod.prodId == id);

    if(!product){
        return res.status(404).json({message: "Nincs ilyen termék!"});
    }

    res.json(product);
});

app.get('/products', (req, res) => {
    res.json(Products.fetchAll());
});

app.listen(PORT, IP, ()=>{
    console.log(`Server running on: ${IP}:${PORT}`);
});