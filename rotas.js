const express = require('express');
const roteador = express();
const {consultarEstoque, consultarCarrinho} = require('./controladores/carrinho')

roteador.get("/produtos", consultarEstoque);
roteador.get("/carrinho", consultarCarrinho);


module.exports = roteador;