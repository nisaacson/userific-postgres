var hashPassword = require('./hashPassword')
module.exports = function(client, table) {
  var self = this
  return function(changeData, cb) {
    var email = changeData.email
    var newRawPassword = changeData.newPassword
    hashPassword(newRawPassword, function(err, newPassword) {
        client.query('UPDATE ' + table + ' SET password = $1 where email = $2', [newPassword, email], function(err) {
          if (err) {
            return cb({
              message: 'failed to change password',
              error: err,
              stack: new Error().stack
            })
          }
          client.query('SELECT email, id from ' + table + ' where password = $1', [newPassword], function(err, reply) {
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
