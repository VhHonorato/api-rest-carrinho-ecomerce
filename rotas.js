const express = require('express');
const roteador = express();
const {consultarEstoque, consultarCarrinho, adicionarAoCarrinho} = require('./controladores/carrinho')

roteador.get("/produtos", consultarEstoque);
roteador.get("/carrinho", consultarCarrinho);
roteador.post("/carrinho/produtos", adicionarAoCarrinho)

module.exports = roteador;