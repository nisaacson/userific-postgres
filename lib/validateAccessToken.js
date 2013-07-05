/**
 * checkExistingTokens
 * @param  {Object}   client pg connection to the postgres database
 * @param  {String}   email  the token owner email
 * @param  {Function} cb     callback with an error if the user has the maximum number of alloted tokens
 */
module.exports = function(client) {
  return function(token, cb) {
    var sql = 'SELECT available from access_tokens where token = $1'
    client.query(sql, [token], function(err, data) {
      if (err) {
        return cb({
          message: 'failed to confirm access token is valid and available',
          error: err,
          token: token,
          stack: new Error().stack
        })
      }
      var rows = data.rows
      if (rows.length === 0) {
        return cb({
          message: 'failed to confirm access token is valid and available',
          reason: 'invalid_access_token',
          error: 'token not found',
          token: token,
          stack: new Error().stack
        })

      }
      var record = rows[0]
      if (!record.available) {
        return cb({
          message: 'failed to confirm access token is valid and available',
          reason: 'access_token_already_used',
          error: err,
          token: token,
          stack: new Error().stack
        })
      }
      return cb()
    })
  }
}
