const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const productRouter = require('./routes/productRouter');

const IP = process.env.IP;
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use('/products', productRouter);

app.listen(PORT, IP, () => {
  console.log(`Server running on: ${IP}:${PORT}`);
});
