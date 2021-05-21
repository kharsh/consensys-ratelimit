var assert = require('assert')
var chai = require('chai')
var assertChai = chai.assert;
const httpHelper = require('./helpers/httpHelper')


describe('rate limit', function() {
    it('should return the latest eth block by eth_getBlockByNumber POST request', async function() {
        latestBlockNumber = await httpHelper.getLatestEthBlockByNumber()
        assertChai.isNumber(latestBlockNumber, "Received a valid latest Eth block using eth_getBlockByNumber POST request")
    });
  
    it('Reach the limit rate for the project', async function() {
      await httpHelper.getNumberOfMostRecentEthBlocksInParallelReq(latestBlockNumber)
    });
    
    it('Validate rate limit responses', async function() {
      response = await httpHelper.getLimitRateResponse()
      console.log(response)
      assert.strictEqual(response.error.code, -32005, "Error code should be")
      assert.strictEqual(response.error.message, "project ID request rate exceeded")
      assert.strictEqual(response.data.see, "https://infura.io/docs/ethereum/jsonrpc/ratelimits", "go to see url must match")
      assertChai.isNotEmpty(response.data.current_rps, "Current rps value should not be empty")
      assertChai.isNotEmpty(response.data.allowed_rps, "Allowed rps value should not be empty")
      assertChai.isNotEmpty(response.data.backoff_seconds, "backoff_seconds value should not be empty")
      
      //Allowed RPS Response Make sure user can still send allowed number of requests per second
      allowed_rps_responses = await httpHelper.sendMaxNumberOfReqInAllowedRPS(parseInt(response.data.allowed_rps))
      allowed_rps_responses.forEach(function(response) {
        assert.strictEqual(response.status, "200", "Response should be valid in allowed RPS rate")
      })

      //Allowed RPS Response Make sure user can *NOT* send *ABOVE* allowed number of rps
      allowed_rps_responses = await httpHelper.sendMaxNumberOfReqInAllowedRPS(parseInt(response.data.allowed_rps + data.allowed_rps_plus))
      allowed_rps_responses.forEach(function(response) {
        assertChai.notEqual(response.status, "200", "Response should be unsuccessful")
      })

      //Backoff seconds response Make sure user can still send requests in suggested Backoff interval
      backoff_seconds_responses = await httpHelper.sendRequestsWithBackOffInterval(parseInt(response.data.backoff_seconds))
      backoff_seconds_responses.forEach(function(response) {
        assert.strictEqual(response.status, "200", "Response should be valid in allowed RPS rate")
      })

      //Backoff seconds response Make sure user can *NOT* send requests *ABOVE* suggested Backoff interval
      backoff_seconds_responses = await httpHelper.sendRequestsWithBackOffInterval(parseInt(response.data.backoff_seconds + data.backOff_interval_plus))
      backoff_seconds_responses.forEach(function(response) {
        assertChai.notEqual(response.status, "200", "Response should be unsuccessful")
      })
    })
})