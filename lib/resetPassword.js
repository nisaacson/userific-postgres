var generateRandomToken = require('./generateRandomToken')
var fetchUserByEmail = require('./fetchUserByEmail')
var hashPassword = require('./hashPassword')
module.exports = function(client, table) {
  var self = this
  return function(data, cb) {
    var resetToken = data.resetToken
    getEmailFromResetToken(client, table, resetToken, function(err, email) {
      if (err) {
        return cb(err)
      }
      var newPassword = generateRandomToken(16)
      saveNewPassword(client, table, newPassword, email, cb)
    })
  }
};

function saveNewPassword(client, table, newRawPassword, email, cb) {
  hashPassword(newRawPassword, function(err, hash) {
    if (err) {
      return cb({
        message: 'failed to reset password, error hashing new password',
        error: err,
        stack: new Error().stack
      })
    }
    client.query('UPDATE ' + table + ' SET reset_token = $1, password = $2 where email = $3', [null, hash, email], function(err) {
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
