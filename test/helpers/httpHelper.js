const axios = require('axios')
const axiosParallel = require('axios-parallel');
const { performance } = require('perf_hooks');
const { writeFileSync } = require('fs');
const dataHelper = require('./dataHelper')
const data = require('./data.json');

/*
This is a Helper function class, it has all the methods required to make http POST calls.
*/
class HttpHelper {
    async getNumberOfMostRecentEthBlocksInParallelReq(latestBlockNumber) {
        /*This method is used to achieve 100000 requests - whichrate limit which is,
        current rate limit for the project
        */
        console.log('Start...')
        const start = performance.now();
        var requests = []
        var requestBlockNumber = latestBlockNumber
        while(requestBlockNumber > (latestBlockNumber - parseInt(data.number_of_block_requests))) {
            requests.push(dataHelper.getBlockNumberPostReq(requestBlockNumber))
        } 
        try {
            const response = await axiosParallel(requests, parseInt(data.max_parallel_requests_per_cpu));
            //save all responses in file
            writeFileSync(data.responses_json_file, JSON.stringify(response), {
                encoding: data.encoding
            });

        }catch(error) {
            throw new Error(error)
        }
        const end = performance.now() - start;
        console.log(`Execution time: ${end}ms`);
    }

    async sendMaxNumberOfReqInAllowedRPS(maxRequests) {
        //Sends post requests to achieve allowed RPS
        var responses = []
        start = dataHelper.getTime()
        var rps = setInterval(async function() {
            if(dataHelper.getTime() - start > 60000) {
                clearInterval(rps)
            }
            responses.push(await axios(dataHelper.getLatestBlockNumberByPostReq()))
            return responses
        }, maxRequests * 1000);
            
        return responses
    }

    async sendRequestsWithBackOffInterval(backOffInterval) {
        //Sends post requests to achieve back off interval
        var responses = []
        var rps = setInterval(async function() {
            if(dataHelper.getTime() - start > 120000) {
                clearInterval(rps)
            }
            responses.push(await axios(dataHelper.getLatestBlockNumberByPostReq()))
            return responses
        }, backOffInterval * 1000);
        
        return responses;
    }

    async getLatestEthBlockByNumber() {
        //Get latest Eth block on Ropsten network
        var response = await axios(dataHelper.getLatestBlockNumberByPostReq())
        return(parseInt(response.data.result.number, data.hex))
    }

    async getLimitRateResponse() {
        //Once the limit rate is reached call this method to get limit rate response
        //as mentioned in documentation for error code -32005
        return await axios(dataHelper.getLatestBlockNumberByPostReq())
    }

    async getNumberOfMostRecentEthBlocks(latestBlockNumber) {
        /* From most recent eth block this method query all the blocks preceeding latest block */
        var numberOfValidResponses = 1
        var requestBlockNumber = latestBlockNumber
        while(requestBlockNumber > (latestBlockNumber - parseInt(data.number_of_block_requests))) {   
            await axios(dataHelper.getBlockNumberPostReq(requestBlockNumber)).then(response => {
                numberOfValidResponses = numberOfValidResponses + 1
                //console.log(response.data.result)
                console.log(response.status)
            }).catch(errors => {
              console.log("Errors - "+errors)
            })
            requestBlockNumber = requestBlockNumber - 1;
        } 
        console.log("Total number of requests "+numberOfValidResponses)
    }
}

module.exports = new HttpHelper()