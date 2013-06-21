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

function getEmailFromResetToken(client, table, resetToken, cb) {
  client.query('SELECT email, confirmed, reset_token from ' + table + ' where reset_token = $1', [resetToken], function(err, reply) {
    var rows, record, user, resetToken
    if (err) {
      return cb({
        message: 'failed to reset password',
        error: err,
        stack: new Error().stack
      })
    }
    rows = reply.rows
    if (rows.length === 0) {
      return cb({
        message: 'failed to reset password',
        error: 'user with given reset_token not found',
        reason: 'invalid_token',
        stack: new Error().stack
      })
    }
    if (rows.length > 1) {
      return cb({
        message: 'failed to generate reset token',
        error: 'found multiple users with given reset_token when there should only 1',
        reason: 'multiple_reset_tokens_found',
        stack: new Error().stack
      })
    }

    record = rows[0]
    if (!record.confirmed) {
      return cb({
        message: 'failed to generate reset token',
        error: 'user not confirmed',
        reason: 'unconfirmed',
        stack: new Error().stack
      })
    }
    var email = record.email
    return cb(null, email)
  })
}
