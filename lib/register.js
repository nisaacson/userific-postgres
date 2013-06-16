var bcrypt = require('nodejs-bcrypt')
var hashPassword = require('./lib/hashPassword')
module.exports = function(client, table) {
  return function(userData, cb) {
    var email = userData.email
    var password = userData.password
    client.query('SELECT id from users where email')

    hashPassword(password, function(err, hash) {
      if (err) {
        return cb(err)
      }
      var addData = {
        email: email,
        password: hash
      }
      //let's pretend we have a user table with the 'id' as the auto-incrementing primary key
      client.query('INSERT INTO users(password_hash, email) VALUES($1, $2) RETURNING id', function(err, result) {
        if (err) {
          return cb({
            message: 'register failed, error saving new user into database',
            error: err,
            stack: new Error().stack
          })
        }
        var newlyCreatedUserId = result.rows[0].id;
        var user = {
          email: userData.email,
          _id: newlyCreatedUserId
        }
        return cb(null, user)
      })
    })
  }
};
