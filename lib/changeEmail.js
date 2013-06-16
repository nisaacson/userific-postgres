module.exports = function(client, table) {
  var self = this
  return function(changeData, cb) {
    var currentEmail = changeData.currentEmail
    var newEmail = changeData.newEmail
    client.query('UPDATE TABLE users SET email = $1 where email = $2', [newEmail, currentEmail], function(err) {
      if (err) {
        return cb({
          message: 'failed to change email',
          error: err,
          stack: new Error().stack
        })
      }
      client.query('SELECT email, id from users where email = $1', [newEmail], function(err, rows) {
        if (err) {
          return cb({
            message: 'failed to change email',
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
  }
}
