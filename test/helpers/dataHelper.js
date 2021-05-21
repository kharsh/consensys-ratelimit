const data = require('./data.json')

const configLatestBlockReq = {
    method: 'post',
    url: 'https://ropsten.infura.io/v3/4aa1d15a8d1b46fdb11d2159b8d27769',
    data: {
      id: 0,
      jsonrpc: '2.0',
       method: "eth_getBlockByNumber",
       params:["latest", true]
    } 
}

const configBlockReq = {
    method: 'post',
    url: 'https://ropsten.infura.io/v3/4aa1d15a8d1b46fdb11d2159b8d27769',
    data: {
      id: 0,
      jsonrpc: '2.0',
       method: "eth_getBlockByNumber",
       params:[]
    }
}


class DataHelper {
    
    getLatestBlockNumberByPostReq() {
        return JSON.parse(JSON.stringify(configLatestBlockReq));
    }

    getBlockNumberPostReq(requestedBlockNumber) {
        var getBlockReq = this.getNewBlockNumberPostReq()
        getBlockReq.data.params.push(this.getBlockNumberInHex(requestedBlockNumber))
        getBlockReq.data.params.push(true) 
        return getBlockReq;      
    }

    getBlockNumberInHex(blockNumber) {
        return "0x"+blockNumber.toString(data.hex);
    }

    getNewBlockNumberPostReq() {
        return JSON.parse(JSON.stringify(configBlockReq));
    }

    getTime() {
        return new Date().getTime();
    }
}

module.exports = new DataHelper()