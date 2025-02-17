const {lerArquivo, escreverNoArquivo} = require('./bibliotecaFS');
const filtroEstoque = async (produto) => {
    let data = await lerArquivo();
    const {produtos} = data;
    let produtosComEstoque = [];
    for(let i = 0; i < produtos.length; i++) {
        if(produtos[i].estoque > 0){
            await produtosComEstoque.push(produtos[i]);
        }
     }
     return produtosComEstoque;
};

module.exports = {filtroEstoque};
