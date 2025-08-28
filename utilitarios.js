const {lerArquivo, escreverNoArquivo} = require('./bibliotecaFS');
const {addBusinessDays} = require("date-fns");
const filtroEstoque = async (produto) => {
    const data = await lerArquivo();
    const {produtos} = data;
    return produtos.filter((produto) => produto.estoque > 0);
}

const calcularCarrinho = (carrinho) => {
    const dataDeEntrega = addBusinessDays(new Date(), 15);
    carrinho.dataDeEntrega = dataDeEntrega;
    carrinho.subtotal = carrinho.produtos.map((produto) => produto.preco * produto.quantidade).reduce((acc,current) => acc + current);
    carrinho.valorDoFrete = carrinho.subtotal > 20000 ? 0 : 5000;
    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
    return carrinho;
}
module.exports = {filtroEstoque, calcularCarrinho};
