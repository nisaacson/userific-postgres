var inspect = require('eyespect').inspector()
var uuid = require('uuid')
var async = require('async')
/**
 * generateAccessTokensFormEmail
 *
 * Save the maximum number of access tokens (5) for a given email address
 * @param  {Object} client the pg client connection to the postgres database
 * @param  {string} email  the owner email for the access token
 * @return {Promise} a deferred promise
 */


module.exports = function(client) {
  return function(email, maxNumTokens, callback) {
    var self = this
    // save no more than 5 access tokens
    var numTokens = 0
    async.whilst(function() {
      return numTokens + 1 < maxNumTokens
    }, function(cb) {
      self.getAccessTokensForEmail(email, function(err, tokens) {
        if (err) {
          return cb(err)
        }
        numTokens = tokens.length
        if (numTokens > maxNumTokens) {
          return cb({
            message: 'failed to generate access tokens',
            error: 'maximum number of tokens reached',
            stack: new Error().stack
          })
        }
        var token = uuid.v4()
        self.saveAccessTokenForEmail(email, token, cb)
      })
    }, callback)
  }
}
