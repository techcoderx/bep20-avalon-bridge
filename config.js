module.exports = {
    avalonSwapAccount: process.env.AVALON_SWAP_ACCOUNT || 'dtube.swap',
    avalonSwapKey: process.env.AVALON_SWAP_KEY || 'fff',
    blocksDisplay: process.env.BLOCKS_DISP || 10,
    ethContractAddress: process.env.CONTRACT_ADDRESS || '0xd3cceb42b544e91eee02eb585cc9a7b47247bfde',
    uniswapPoolAddress: process.env.UNISWAP_ADDRESS || '0xe9ee2d9e1e6eddbce9e5c1c1fc6c6f1e5051b9c6',
    wethTokenAddress: process.env.WETH_ADDRESS || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    topic: process.env.TOPIC || null,
    infuraKey: process.env.INFURA_KEY || 'fff',
    gasBoost: process.env.GAS_BOOST || 0,
    bscRPC: process.env.BSC_RPC || 'https://bscrpc.com',
    avalonAPI: process.env.AVALON_API || 'https://api.avalonblocks.com'
}