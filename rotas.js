const express = require('express');
const roteador = express();
const {consultarEstoque, consultarCarrinho, adicionarAoCarrinho, editarCarrinho} = require('./controladores/carrinho')

roteador.get("/produtos", consultarEstoque);
roteador.get("/carrinho", consultarCarrinho);
roteador.post("/carrinho/produtos", adicionarAoCarrinho);
roteador.patch("/carrinho/produtos/:id", editarCarrinho);

module.exports = roteador;