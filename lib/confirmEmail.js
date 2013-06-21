var fetchUserByConfirmToken = require('./fetchUserByConfirmToken')
var fetchUserByEmail = require('./fetchUserByEmail')
module.exports = function(client, table) {
  var self = this
  return function(data, cb) {
    var confirmToken = data.confirmToken
    if (!confirmToken) {
      return cb({
        message: 'failed to confirm user',
        error: 'confirmToken must be supplied',
        reason: 'confirmToken not set',
        stack: new Error().stack
      })
    }
    fetchUserByConfirmToken(client, table, confirmToken, function(err, user) {
      if (err) {
        return cb(err)
      }
      if (!user) {
        return cb({
          message: 'failed to confirm user',
          error: 'user not found with given confirmToken',
          reason: 'invalid_token',
          stack: new Error().stack
        })
      }
      var email = user.email
      if (user.confirmed) {
        return cb({
          message: 'failed to confirm user',
          error: 'user with given confirmToken already confirmed',
          reason: 'already confirmed',
          stack: new Error().stack
        })
      }
      confirmUser(client, table, confirmToken, function(err) {
        if (err) {
          return cb(err)
        }
        fetchUserByEmail(client, table, email, function(err, user) {
          if (err) {
            return cb(err)
          }
          var output = {
            email: user.email,
            _id: user.id,
            confirmed: user.confirmed
          }
          cb(null, output)
        })
      })
    })
  }
};

function confirmUser(client, table, confirmToken, cb) {
  var query = 'UPDATE ' + table + ' SET confirmed = $1, confirm_token = $2 where confirm_token = $3';
  var values = ['true', null, confirmToken]
  client.query(query, values, function(err) {
    if (err) {
      return cb({
        message: 'failed to confirm user',
        error: err,
        query: query,
        stack: new Error().stack
      })
    }
    return cb()
  })
}
