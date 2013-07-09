var hashPassword = require('./hashPassword')
module.exports = function(client) {
  return function(changeData, cb) {
    var self = this
    var email = changeData.email
    var newRawPassword = changeData.newPassword
    hashPassword(newRawPassword, function(err, newPassword) {
      client.query('UPDATE users SET password = $1 WHERE email = $2', [newPassword, email], function(err) {
        if (err) {
          return cb({
            message: 'failed to change password',
            error: err,
            stack: new Error().stack
          })
        }
        client.query('SELECT email, id FROM users WHERE password = $1', [newPassword], function(err, reply) {
          if (err) {
            return cb({
              message: 'failed to change password',
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
    })
  }
}
