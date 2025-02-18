const express = require('express');
const {lerArquivo, escreverNoArquivo} = require('../bibliotecaFS');
const {filtroEstoque, calcularCarrinho} = require('../utilitarios');

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
};

const adicionarAoCarrinho = async (req, res) => {
    try {
        let data = await lerArquivo();
        let {produtos, carrinho } = data
        const {id, quantidade} = req.query;
        console.log(id);
        const filtraProduto = await produtos.find((produtos) => produtos.id === Number(id));
        if(!filtraProduto){
            return res.status(400).json("Produto não encontrado");
        }
        if(filtraProduto.estoque < quantidade){
            res.status(400).json("Estoque insuficiente");
        }
        const indiceProduto = carrinho.produtos.findIndex((produtos) => produtos.id === Number(id));
        if(indiceProduto >= 0){
            carrinho.produtos[indiceProduto].quantidade += quantidade; 
        } else {
            const addProduto = {
                id: id,
                quantidade: quantidade,
                nome: filtraProduto.nome,
                preco: filtraProduto.preco,
                categoria: filtraProduto.categoria
        }
        carrinho.produtos.push(addProduto);
        
        };
        carrinho = calcularCarrinho(carrinho);
        await escreverNoArquivo(carrinho);
        res.json(carrinho);
    }catch (error) {
        console.log(req.route);
        res.json({ error: error.message });
    }
   

}

module.exports = {
    consultarEstoque,
    consultarCarrinho,
    adicionarAoCarrinho
};