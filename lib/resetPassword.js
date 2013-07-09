var generateRandomToken = require('./generateRandomToken')
var fetchUserByEmail = require('./fetchUserByEmail')
var hashPassword = require('./hashPassword')
module.exports = function(client) {
  var self = this
  return function resetPassword(data, cb) {
    var resetToken = data.resetToken
    fetchEmailByResetToken(resetToken, function(err, email) {
      if (err) {
        return cb(err)
      }
      var newPassword = generateRandomToken(16)
      saveNewPassword(newPassword, email, cb)
    })
  }

  function fetchEmailByResetToken(token, cb) {
    var query = 'select id, email, from users where reset_token = $1'
    client.query(query, [token], function(err, reply) {
      if (err) {
        return cb({
          message: 'failed to fetch user by confirmToken',
          query: query,
          error: err,
          stack: new Error().stack
        })
      }
      if (!reply.rows || reply.rows.length === 0) {
        return cb()
      }
      var rows = reply.rows
      var record = rows[0]
      return cb(null, record)
    })
  }

  function saveNewPassword(newRawPassword, email, cb) {
    hashPassword(newRawPassword, function(err, hash) {
      if (err) {
        return cb({
          message: 'failed to reset password, error hashing new password',
          error: err,
          stack: new Error().stack
        })
      }
      client.query('UPDATE users SET reset_token = $1, password = $2 where email = $3', [null, hash, email], function(err) {
        if (err) {
          return cb({
            message: 'failed to reset password',
            error: err,
            stack: new Error().stack
          })
        }
        return cb(null, newRawPassword)
      })
    })
  }
}
