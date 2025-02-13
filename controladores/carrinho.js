const express = require('express');
const {lerArquivo, escreverNoArquivo} = require('../bibliotecaFS');

const consultarEstoque = async (req, res) => {
    try {
        let data = await lerArquivo();
        const {produtos} = data;
        let produtosComEstoque = [];
        console.log(produtos.length);
        for(let i = 0; i < produtos.length; i++) {
            if(produtos[i].estoque > 0){
                await produtosComEstoque.push(produtos[i]);
                console.log(produtosComEstoque);  
            }
        }
        res.json(produtosComEstoque);
    } catch (err) {
        res.json({ error: err.message });
    }

    


}

module.exports = {consultarEstoque};