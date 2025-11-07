const express = require('express');

const app = express();

const IP = "localhost";
const PORT = 3000;

app.listen(PORT, IP, ()=>{
    console.log(`Server running on: ${IP}:${PORT}`);
})