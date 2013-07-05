var inspect = require('eyespect').inspector()
module.exports = function(client) {
  return function(email, token, cb) {
    client.query('INSERT INTO access_tokens(token, email, available) VALUES($1, $2, $3)', [token, email, true], function(err, result) {
      if (err) {
        return cb({
          message: 'failed to save access token for email',
          email: email,
          token: token,
          error: err,
          stack: new Error().stack
        })
      }
      cb()
    })
  }
}
