var crypto = require('crypto')
var uuid = require('node-uuid')
var hashPassword = require('./hashPassword')
module.exports = function(client, table) {
  return function(userData, cb) {
    var email = userData.email
    var password = userData.password
    hashPassword(password, function(err, hash) {
      if (err) {
        return cb(err)
      }
      var id = uuid.v4()
      var confirmToken = crypto.randomBytes(32).toString('hex');
      //let's pretend we have a user table with the 'id' as the auto-incrementing primary key
      client.query('INSERT INTO users(id, email, password, confirm_token) VALUES($1, $2, $3, $4) RETURNING id, confirm_token', [id, email, hash, confirmToken], function(err, result) {
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
          confirmToken: confirmToken,
          _id: newlyCreatedUserId
        }
        return cb(null, user)
      })
    })
  }
};
