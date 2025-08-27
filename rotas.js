const express = require('express');
const roteador = express();
const {consultarEstoque, consultarCarrinho, adicionarAoCarrinho, editarCarrinho, deletarDoCarrinho} = require('./controladores/carrinho')

roteador.get("/produtos", consultarEstoque);
roteador.get("/carrinho", consultarCarrinho);
roteador.post("/carrinho/produtos", adicionarAoCarrinho);
roteador.patch("/carrinho/produtos/:id", editarCarrinho);
roteador.delete("/carrinho/produtos/:idProduto", deletarDoCarrinho);

module.exports = roteador;