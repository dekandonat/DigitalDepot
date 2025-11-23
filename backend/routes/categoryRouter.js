const express = require('express');
const router = express.Router();

const db = require('../util/database');

router.get('/', async (req, res) => {
    try{
        const [rows] = await db.execute('SELECT * FROM categories');
        if(rows.length > 0){
            res.status(200).json({result: 'success', data: rows});
        }
        else{
            res.status(200).json({result: 'success', data: 'no categories found'});
        }
    }
    catch(err){
        res.status(500).json({result: 'fail', message: 'error during database querry'});
    }
});

router.get('/:categoryId', async(req, res) => {
    try{
        const categoryId = req.params.categoryId;
        const [rows] = await db.execute(`SELECT products.*, categories.categoryName FROM products JOIN categories ON products.categoryId = categories.categoryId WHERE categories.categoryId = ${categoryId}`);
        if(rows.length > 0){
            res.status(200).json({result: 'success', data: rows});
        }
        else{
            res.status(200).json({result: 'success', data: 'no categories found'});
        }
    }
    catch(err){
        res.status(500).json({result: 'fail', message: 'error during database querry'});
    }

});

module.exports = router;