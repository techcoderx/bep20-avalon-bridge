const fs = require('fs')
const config = require('./config')
const bep20abi = JSON.parse(fs.readFileSync('build/contracts/WDTC.json', 'utf-8')).abi
const { projectId, mnemonic, privateKeys } = require('./secrets.json')
const reserveAddr = '0xd2be0fb21eeced4ce59a39f190e61291ca8c33cc'
const javalon = require('javalon')
javalon.init({api: config.avalonAPI})
const Web3 = require('web3')
let web3 = new Web3(config.bscRPC)
let reserveAddress = web3.eth.accounts.privateKeyToAccount(privateKeys[0])
web3.eth.accounts.wallet.add(reserveAddress)

let delay = 2800
let txQueue = []
let isTransactioning = false
setInterval(function() {
    if (!isTransactioning && txQueue && txQueue.length > 0) {
        try {
            isTransactioning = true
            console.log('=== BEGIN SEND-TX ===')
            let payload = new web3.eth.Contract(bep20abi).methods.transfer(txQueue[0].destination,txQueue[0].amount).encodeABI()
            web3.eth.getTransactionCount(reserveAddr, 'latest').then(async (nonce) => {
                let ethTx = { 
                    from: reserveAddr,
                    to: txQueue[0].contract,
                    value: 0,
                    gasLimit: 150000,
                    gasPrice: ethGasPrice,
                    nonce: nonce,
                    data: payload
                }

                // execution attempt before submission
                try {
                    await web3.eth.call(ethTx)
                } catch (e) {
                    console.log('Transaction execution fail')
                    txQueue.splice(0,1)
                    isTransactioning = false
                    console.log('=== END SEND-TX ===')
                    return
                }
                let signedTx = await web3.eth.accounts.signTransaction(ethTx,privateKeys[0])
                web3.eth.sendSignedTransaction(signedTx.rawTransaction, (e,hash) => {
                    console.log(e,hash)
                    txQueue.splice(0,1)
                    isTransactioning = false
                    console.log('=== END SEND-TX ===')
                })
            })
        } catch (error) {
            throw error
        }
    }
}, 5000)

class AvalonWatcher {
    constructor(address) {
        console.log('Watching '+address+'@avalon')
        this.address = address
    }

    checkBlock(number) {
        javalon.getBlock(number, function(err, block) {
            // if (err) console.log(err)
            if (err || !block || block.error) {
                setTimeout(function() {DTCWatcher.checkBlock(number)}, delay)
                return
            }

            headblocks.avalon = number
            fs.writeFileSync('./headblocks.js', "module.exports={eth:"+headblocks.eth+",avalon:"+headblocks.avalon+"}")            

            let secondsAgo = Math.round((new Date().getTime() - block.timestamp)/1000)
            let transactions = block.txs;
            if (number%config.blocksDisplay === 0)
                console.log('Avalon Block #'+number+' '+secondsAgo+'s ago');
            if (block.txs != null && block.txs.length > 0) {
                for (let i = 0; i < block.txs.length; i++) {
                    let tx = block.txs[i]
                    if (tx.type === 3 && tx.data.receiver === DTCWatcher.address) {
                        let amount = tx.data.amount
                        let memo = tx.data.memo
                        console.log('transfer', tx.sender, amount, memo)
                        if (!memo) {
                            console.log('Error, tx without memo')
                            continue
                        }
                        let memoParsed = memo.split('@')
                        if (memoParsed.length !== 2) {
                            console.log('Error, memo invalid')
                            continue
                        }
                        let destinationNetwork = memoParsed[1].toLowerCase()
                        let destinationAddress = memoParsed[0]

                        if (destinationNetwork !== 'bsc') {
                            console.log('Error, network is not BSC')
                            continue
                        }

                        // take fees
                        if (amount <= txFeeDtc) {
                            console.log('Error, amount is <= fee')
                            continue
                        }
                        amount -= txFeeDtc
                        let cmd = {
                            contract: config.ethContractAddress,
                            destination: destinationAddress,
                            amount: amount
                        }
                        txQueue.push(cmd)
                    }
                }
            }
            setTimeout(function() {DTCWatcher.checkBlock(1+number)}, 1)
        })
    }
}

module.exports = AvalonWatcher
