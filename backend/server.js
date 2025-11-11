const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const IP = process.env.IP;
const PORT = process.env.PORT;

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