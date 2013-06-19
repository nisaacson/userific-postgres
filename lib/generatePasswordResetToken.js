var hashPassword = require('./hashPassword')
var generateRandomToken = require('./generateRandomToken')
module.exports = function(client, table) {
  var self = this
  return function generatePasswordResetToken(data, cb) {
    var email = data.email
    client.query('SELECT id, confirmed, reset_token from ' + table + ' where email = $1', [email], function(err, reply) {
      var rows, record, user, resetToken
      if (err) {
        return cb({
          message: 'failed to generate resetToken',
          error: err,
          stack: new Error().stack
        })
      }
      if (reply.rows.length === 0) {
        return cb({
          message: 'failed to generate reset token',
          error: 'user with given email not found',
          reason: 'email_not_found',
          stack: new Error().stack
        })
      }
      rows = reply.rows
      record = rows[0]
      if (!record.confirmed) {
        return cb({
          message: 'failed to generate reset token',
          error: 'user not confirmed',
          reason: 'unconfirmed',
          stack: new Error().stack
        })
      }
      var id = record.id
      var output = {
        _id: id,
        email: email
      }
      resetToken = record.reset_token
      if (resetToken) {
        output.resetToken = resetToken
        return cb(null, output)
      }
      resetToken = generateRandomToken()
      client.query('UPDATE ' + table + ' SET reset_token = $1 where email = $2', [resetToken, email], function(err, reply) {
        if (err) {
          return cb({
            message: 'failed to generate resetToken',
            error: err,
            stack: new Error().stack
          })
        }
        output.resetToken = resetToken
        cb(null, output)
      })
    })
  }
}
