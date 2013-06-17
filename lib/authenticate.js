var bcrypt = require('bcrypt-nodejs')
module.exports = function(client, table) {
  return function(userData, cb) {
    var email = userData.email
    var rawPassword = userData.password
    client.query('select id, email, password from users where email = $1', [email], function(err, rows) {
      if (err) {
        return cb({
          message: 'failed to authenticate user, error fetching hashed password from database',
          error: err,
          stack: new Error().stack
        })
      }
      if (!rows || rows.length === 0) {
        return cb()
      }
      var record = rows[0]
      var hash = record.password
      comparePassword(rawPassword, hash, function(err, isMatch) {
        if (err) {
          return cb(err)
        }
        if (!isMatch) {
          return cb()
        }
        var user = {
          email: record.email,
          _id: record.id
        }
        cb(null, user)
      })
    })
  }
};

function comparePassword(rawPassword, hash, cb) {
  bcrypt.compare(rawPassword, hash, function(err, isMatch) {
    if (err) {
      return cb({
        message: 'failed to authenticate user, error checking hashed password',
        error: err,
        stack: new Error().stack
      })
    }
    return cb(null, isMatch)
  })
}
