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
    res.status(201).json({result: "success"});
});

app.get('/products/:prodId', async(req, res) => {
    const id = req.params.prodId;
    try{
        const data = await Products.fetch(id);
        if(data.length > 0){
            res.status(200).json({result: "success", data: data});
        }
        else{
            res.status(404).json({result: "fail", message: "no product with this id"});
        }
    }
    catch(err){
        res.status(500).json({result: "fail", message: err.message});
    }
});

app.get('/products', async(req, res) => {
    try{
        const data = await Products.fetchAll();
        if(data.length > 0){
            res.status(200).json({result: "success", data: data});
        }
        else{
            res.status(404).json({result: "fail", message: "no products"});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({result: "fail", message: err.message});
    }
});

app.listen(PORT, IP, ()=>{
    console.log(`Server running on: ${IP}:${PORT}`);
});