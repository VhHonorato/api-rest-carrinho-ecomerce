const express = require('express');
const roteador = express();
const {consultarEstoque} = require('./controladores/carrinho')

roteador.get("/produtos", consultarEstoque);


module.exports = roteador;