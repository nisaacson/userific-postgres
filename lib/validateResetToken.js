module.exports = function(client) {
  return function(resetToken, cb) {
    client.query('SELECT email, confirmed, reset_token from users where reset_token = $1', [resetToken], function(err, reply) {
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
}
