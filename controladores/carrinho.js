const express = require('express');
const {lerArquivo, escreverNoArquivo} = require('../bibliotecaFS');
const {filtroEstoque, calcularCarrinho} = require('../utilitarios');
const { add } = require('date-fns/fp');

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
        const filtraProduto = await produtos.find((produtos) => produtos.id === Number(id));
       
        if(!filtraProduto){
            return res.status(400).json("Produto não encontrado");
        }
        if(filtraProduto.estoque < quantidade){
            return res.status(400).json("Estoque insuficiente");
        }
        const indiceProduto = carrinho.produtos.findIndex((produto) => produto.id == id);
      
        if(indiceProduto >= 0){
            data.carrinho.produtos[indiceProduto].quantidade += Number(quantidade);
            const indiceProdutoEstoque = data.produtos.findIndex((produto) => produto.id == id);
           
        } else {
            const addProduto = {
                id: id,
                quantidade: Number(quantidade),
                nome: filtraProduto.nome,
                preco: filtraProduto.preco,
                categoria: filtraProduto.categoria
        }
        carrinho.produtos.push(addProduto);
        

        };
        carrinho = calcularCarrinho(carrinho);
        const indiceProdutoEstoque = data.produtos.findIndex((produtos) => produtos.id == id);
        data.produtos[indiceProdutoEstoque].estoque -= Number(quantidade);
        await escreverNoArquivo({ produtos, carrinho: carrinho });
        res.json(carrinho);
    }catch (error) {
        
        res.json({ error: error.message });
    }
   

};

const editarCarrinho = async (req, res) => {
    try {
        let data = await lerArquivo();
        let {produtos, carrinho} = data;
        const {id} = req.params;
        const {quantidade} = req.query;
        const quantidadeNum = Number(quantidade);

        const indiceProdutoCarrinho = carrinho.produtos.findIndex((produto) => produto.id == id);

        if(indiceProdutoCarrinho < 0){
            return res.status(404).json({mensagem: "Produto não encontrado no carrinho."});
        };

        const produtoCarrinho = carrinho.produtos[indiceProdutoCarrinho];
        const indiceProdutoEstoque = produtos.findIndex((produto) => produto.id == id);
        const produtoEstoque = produtos[indiceProdutoEstoque];
      
        if(quantidadeNum < 0){ //Removendo do carrinho
            if( produtoCarrinho.quantidade + quantidadeNum < 0){
                return res.status(400).json({mensagem: "Quantidade retirada maior que a quantidade de itens no carrinho."});

            }
        }

        if (quantidadeNum > 0) { // Adicionando ao carrinho
            if (produtoEstoque.estoque < quantidadeNum) {
                return res.status(400).json({mensagem: "Produto com estoque insuficiente."});
            }
        }

        carrinho.produtos[indiceProdutoCarrinho].quantidade += quantidadeNum;
        produtos[indiceProdutoEstoque].estoque -= quantidadeNum;

        carrinho = calcularCarrinho(carrinho);
        await escreverNoArquivo(data);
        res.json(carrinho)
    
    }catch (error) {
        res.json({ error: error.message });
    }
}

const deletarDoCarrinho = async (req, res) =>{
    try {
        let data = await lerArquivo();
        let {produtos, carrinho} = data;
        const {idProduto} = req.params;
        const indiceProdutoCarrinho = carrinho.produtos.findIndex((produto) => produto.id == idProduto);
       
        if(indiceProdutoCarrinho < 0){
            return res.status(404).json({mensagem: "Produto não encontrado no carrinho."});
        }

        const produtoRemovido = carrinho.produtos[indiceProdutoCarrinho];
        const indiceProdutoEstoque = produtos.findIndex((produto) => produto.id == idProduto);
        if(indiceProdutoEstoque > -1){
            produtos[indiceProdutoEstoque].estoque += produtoRemovido.quantidade;
        }

        carrinho.produtos.splice(indiceProdutoCarrinho, 1);
        carrinho = calcularCarrinho(carrinho);
        await escreverNoArquivo(data);
        res.status(200).json(carrinho);
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    consultarEstoque,
    consultarCarrinho,
    adicionarAoCarrinho,
    editarCarrinho,
    deletarDoCarrinho
};