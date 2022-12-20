const fs = require('fs')
const config = require('./config.js')
headblocks = require('./headblocks.js')
console.log('Head Blocks',headblocks)

// track ETH/DTC Price on uniswap
// + ETH Gas Price
dtcEther = null
ethGasPrice = null
txFeeDtc = null
updateDtcEther = require('./uniswap-watcher.js')
updateGasPrice = require('./gas-price.js')
updateFee = function() {
    if (!dtcEther || !ethGasPrice) return
    let avgGasUsedPerTx = 51258
    let txFeeEth = ethGasPrice * avgGasUsedPerTx / Math.pow(10, 18)
    txFeeDtc = Math.ceil(100 * txFeeEth / dtcEther)
    console.log('Tx Fee: '+txFeeEth+' BNB or '+txFeeDtc/100+' DTUBE')
}

updateDtcEther(function(){
    updateGasPrice(function() {
        console.log('Finished initialization')

        // refreshing data every 60 secs
        setInterval(updateDtcEther, 59000)
        setInterval(updateGasPrice, 60000)

        // WDTC => DTC
        const ContractWatcher = require('./contract-watcher.js')
        WDTCWatcher = new ContractWatcher(config.ethContractAddress)
        WDTCWatcher.checkBlock(1+headblocks.eth)

        // DTC => WDTC
        const AvalonWatcher = require('./avalon-watcher.js')
        DTCWatcher = new AvalonWatcher(config.avalonSwapAccount)
        DTCWatcher.checkBlock(1+headblocks.avalon)
    })
})

// safe exit
process.on('SIGINT', function() {
    fs.writeFileSync('./headblocks.js', "module.exports={eth:"+headblocks.eth+",avalon:"+headblocks.avalon+"}")
    process.exit(0)
})
