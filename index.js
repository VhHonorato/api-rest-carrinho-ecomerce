const express = require('express');
const roteador = require('./rotas');
const app = express();

app.use(roteador);


app.listen(8000)