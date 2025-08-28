const {lerArquivo, escreverNoArquivo} = require('./bibliotecaFS');
const {addBusinessDays} = require("date-fns");
const filtroEstoque = async (produto) => {
    const data = await lerArquivo();
    const {produtos} = data;
    return produtos.filter((produto) => produto.estoque > 0);
}

const calcularCarrinho = (carrinho) => {
    if(!carrinho.produtos|| carrinho.produtos.length === 0){
        carrinho.dataDeEntrega = null;
        carrinho.subtotal = 0;
        carrinho.valorDoFrete = 0;
        carrinho.totalAPagar = 0;
        return carrinho;
    }

    const dataDeEntrega = addBusinessDays(new Date(), 15);
    carrinho.dataDeEntrega = dataDeEntrega;
    carrinho.subtotal = carrinho.produtos.reduce((acc,produto) => acc + (produto.preco * produto.quantidade), 0);
    carrinho.valorDoFrete = carrinho.subtotal > 20000 ? 0 : 5000;
    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
    return carrinho;
}
module.exports = {filtroEstoque, calcularCarrinho};
