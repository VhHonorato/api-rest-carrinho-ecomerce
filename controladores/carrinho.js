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
        // console.log(carrinho.produtos);
        console.log(indiceProduto);
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
        console.log(indiceProdutoEstoque);
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
        let positivoOunegativo = Math.sign(Number(quantidade));
        const produtoCarrinho = await carrinho.produtos.find((produto) => produto.id == id);
        const produtoEstoque = await produtos.find((produto) => produto.id == id);

        if(!produtoCarrinho){
            return res.status(400).json({mensage: "Produto não encontrado no carrinho."});
        };
      
        if(positivoOunegativo === -1){
            
            if( produtoCarrinho.quantidade < 1){
                return res.status(400).json({mensage: "Quantidade retirada maior que a quantidade de itens no carrinho."});

            }else{
                const indiceProdutoCarrinho = carrinho.produtos.findIndex((produto) => produto.id == id);
                carrinho.produtos[indiceProdutoCarrinho].quantidade += Number(quantidade);
                const indiceProdutoEstoque = carrinho.produtos.findIndex((produto) => produto.id == id);
                produtos[indiceProdutoEstoque].estoque -= Number(quantidade);

            }
        }
        if(positivoOunegativo === 1){
            if(produtoEstoque.estoque < 1 || produtoEstoque.estoque < Number(quantidade)){
                return res.status(400).json({mensage: "Produto com estoque insuficiente."});

        }else{
            const indiceProdutoCarrinho = carrinho.produtos.findIndex((produto) => produto.id == id);
            carrinho.produtos[indiceProdutoCarrinho].quantidade += Number(quantidade);
            const indiceProdutoEstoque = carrinho.produtos.findIndex((produto) => produto.id == id);
            produtos[indiceProdutoEstoque].estoque -= Number(quantidade);
        }
    }
        carrinho = calcularCarrinho(carrinho);
        await escreverNoArquivo(data);
        res.json(carrinho)

    } catch (error) {
        res.json({ error: error.message });
    }
}
const deletarDoCarrinho = async (req, res) =>{
    let data = await lerArquivo();
    let {produtos, carrinho} = data;
    const {idProduto} = req.params;
    const produtoCarrinho = await carrinho.produtos.find((produto) => produto.id == idProduto);
    const produtoEstoque = await produtos.find((produto) => produto.id == idProduto);
    if(!produtoCarrinho){
        return res.status(400).json({mensage: "Produto não encontrado no carrinho."});
    };

    if( produtoCarrinho.quantidade < 1){
        return res.status(400).json({mensage: "Quantidade retirada maior que a quantidade de itens no carrinho."});

    }else{
        const indiceProdutoCarrinho = carrinho.produtos.findIndex((produto) => produto.id == idProduto);
        const indiceProdutoEstoque = produtos.findIndex((produto) => produto.id == idProduto);
        produtos[indiceProdutoEstoque].estoque += carrinho.produtos[indiceProdutoCarrinho].quantidade;
        
        carrinho.produtos.splice(indiceProdutoCarrinho, 1);
        if(carrinho.produtos.length > 0){
            carrinho = calcularCarrinho(carrinho);

        }else{
            carrinho.subtotal = 0;
            carrinho.dataDeEntrega = null;
            carrinho.valorDoFrete = 0;
            carrinho.totalAPagar = 0;
            
            await escreverNoArquivo(data);
            return res.status(400).json({mensage: "Removido todos os itens do carrinho."})
        }
        

    }
    carrinho = calcularCarrinho(carrinho);
    await escreverNoArquivo(data);
    res.json(carrinho);
}

module.exports = {
    consultarEstoque,
    consultarCarrinho,
    adicionarAoCarrinho,
    editarCarrinho,
    deletarDoCarrinho
};