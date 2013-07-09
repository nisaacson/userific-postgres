module.exports = function(client) {
  return function(changeData, cb) {
    var self = this
    var currentEmail = changeData.currentEmail
    var newEmail = changeData.newEmail
    client.query('UPDATE users SET email = $1 WHERE email = $2', [newEmail, currentEmail], function(err) {
      if (err) {
        return cb({
          message: 'failed to change email',
          error: err,
          stack: new Error().stack
        })
      }
      client.query('SELECT email, id FROM users WHERE email = $1', [newEmail], function(err, reply) {
        if (err) {
          return cb({
            message: 'failed to change email',
            error: err,
            stack: new Error().stack
          })
        }
        var rows = reply.rows
        var record = rows[0]
        var user = {
          email: record.email,
          _id: record.id
        }
        return cb(null, user)
      })
    })
  }
}
