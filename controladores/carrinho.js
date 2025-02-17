const express = require('express');
const {lerArquivo, escreverNoArquivo} = require('../bibliotecaFS');
const {filtroEstoque} = require('../utilitarios');

const consultarEstoque = async (req, res) => {
    try {
        let data = await lerArquivo();
        const {categoria, precoInicial, precoFinal} = req.query;
        const {produtos} = data;
        if(categoria == undefined && precoFinal == undefined && precoInicial == undefined){
            const produtosComEstoque = await filtroEstoque(produtos)
            res.json(produtosComEstoque);       
                
        } else if(categoria == undefined){
            const produtosComEstoque = await filtroEstoque(produtos);
            const filtroProduto = produtosComEstoque.filter(produto => { 
            const filtroPreco = produto.preco >= Number(precoInicial) && produto.preco <= Number(precoFinal);            
            return((precoFinal && precoInicial ? filtroPreco: true));
        });
        res.json(filtroProduto);
        } else {
            const produtosComEstoque = await filtroEstoque(produtos);
            const filtroProduto = produtosComEstoque.filter(produto => {
            const filtroPreco = produto.preco >= Number(precoInicial) && produto.preco <= Number(precoFinal);
            const filtroCategoria = produto.categoria.toLowerCase() === categoria.toLowerCase();
            
            return((precoFinal && precoInicial ? filtroPreco: true) && (categoria ? filtroCategoria: true));
        })
        res.json(filtroProduto);

        }
    } catch (err) {
        res.json({ error: err.message });
    }

    


}

const consultarCarrinho = async (req, res) => {
    try {
        const data = await lerArquivo();
        const {produtos, subtotal, dataDeEntrega, valorDoFrete, totalAPagar } = data.carrinho;
        res.json({
            produtos,
            subtotal,
            dataDeEntrega,
            valorDoFrete,
            totalAPagar
        });
        
    } catch (error) {
        res.json({ error: err.message });
    }
}

module.exports = {consultarEstoque, consultarCarrinho};