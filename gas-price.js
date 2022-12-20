const config = require('./config')
const Web3 = require('web3')
const web3 = new Web3(config.bscRPC)

module.exports = function(cb) {
    web3.eth.getGasPrice(function(err, res) {
        if (err) {
	    console.log(err)
	    return
	}
        if (cb) cb()
        if (res != ethGasPrice) {
            ethGasPrice = res
            console.log('Gas Price: '+Math.round(ethGasPrice/1000000000)+' Gwei')
            updateFee()
        }
    })
}
