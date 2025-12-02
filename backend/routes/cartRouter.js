const express = require('express');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const db = require('../util/database');

const router = express.Router();

const verifyAsync = promisify(jwt.verify);

router.get('/', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    
    if(!token){
        return res.status(404).json({result: 'fail', message: 'no token found'});
    }

    try{
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const userId = decodedToken.id;
        const [items] = await db.execute(`SELECT products.*, carts.quantity FROM products INNER JOIN carts ON products.prodId = carts.productId WHERE carts.userId = ${userId};`);
        const [total] = await db.execute(`SELECT SUM(products.productPrice * carts.quantity) AS total FROM products INNER JOIN carts ON products.prodId = carts.productId WHERE carts.userId = ${userId};`)
        res.status(200).json({result: 'success', data: {items, total}});
    }
    catch(err){
        console.log(err);
        res.status(500).json({result: 'fail', message: 'failed to validate token'});
    }
});

router.post('/add/:id/:quantity', async (req, res) => {
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader && authorizationHeader.split(' ')[1];
    const productId = req.params.id;
    const quantity = req.params.quantity;
    
    if(!token){
        return res.status(404).json({result: 'fail', message: 'no token found'});
    }

    try{
        const decodedToken = await verifyAsync(token, process.env.SECRET);
        const userId = decodedToken.id;
        await db.execute(`INSERT INTO carts (userId, productId, quantity) VALUES (${userId}, ${productId}, ${quantity}) ON DUPLICATE KEY UPDATE quantity = quantity + 1;`)
        res.status(201).json({result: 'success'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({result: 'fail', message: 'failed to validate token'});
    }
})

module.exports = router;