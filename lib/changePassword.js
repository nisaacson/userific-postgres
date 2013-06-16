var hashPassword = require('./hashPassword')
module.exports = function(client, table) {
  var self = this
  return function(changeData, cb) {
    var currentPassword = changeData.currentPassword
    var newRawPassword = changeData.newPassword
    hashPassword(newRawPassword, function(err, newPassword) {
      client.query('UPDATE TABLE users SET password = $1 where password = $2', [newPassword, currentPassword], function(err) {
        if (err) {
          return cb({
            message: 'failed to change password',
            error: err,
            stack: new Error().stack
          })
        }
        client.query('SELECT email, id from users where password = $1', [newPassword], function(err, rows) {
          if (err) {
            return cb({
              message: 'failed to change password',
              error: err,
              stack: new Error().stack
            })
          }
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
