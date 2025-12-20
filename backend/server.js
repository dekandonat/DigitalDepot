const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const productRouter = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');
const categoryRouter = require('./routes/categoryRouter');
const cartRouter = require('./routes/cartRouter');
const adminRouter = require('./routes/adminRouter');

const IP = process.env.IP;
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use('/products', productRouter);
app.use('/user', userRouter);
app.use('/category', categoryRouter);
app.use('/cart', cartRouter);
app.use('/admin', adminRouter);

app.listen(PORT, IP, () => {
  console.log(`Server running on: ${IP}:${PORT}`);
});
