const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieparser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const socket = require('./util/socket');

const verifyToken = require('./util/tokenVerify');
const verifyAdmin = require('./util/verifyAdmin');

dotenv.config();

const app = express();
const server = http.createServer(app);
const limiter = rateLimit({
  windowMs: 60 * 1000, //1 perc
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
const io = socket.init(server);

const productRouter = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');
const categoryRouter = require('./routes/categoryRouter');
const cartRouter = require('./routes/cartRouter');
const adminRouter = require('./routes/adminRouter');
const orderRouter = require('./routes/orderRouter');
const usedProductRouter = require('./routes/usedProductRouter');
const reviewRouter = require('./routes/reviewRouter');

const IP = process.env.IP;
const PORT = process.env.PORT;

app.use(limiter);
app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
  })
);

app.use('/products', productRouter);
app.use('/user', userRouter);
app.use('/category', categoryRouter);
app.use('/cart', verifyToken, cartRouter);
app.use('/order', orderRouter);
app.use('/adminRoute', verifyAdmin, adminRouter);
app.use('/used-products', verifyToken, usedProductRouter);
app.use('/reviews', reviewRouter);

server.listen(PORT, IP, () => {
  console.log(`Server running on: http://${IP}:${PORT}`);
});
