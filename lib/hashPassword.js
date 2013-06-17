var bcrypt = require('bcrypt-nodejs')
var SALT_WORK_FACTOR = 10

module.exports = function hashPassword(rawPassword, cb) {
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return cb({
        message: 'failed to register user, error hashing raw password',
        error: err,
        stack: new Error().stack
      })
    }
    var progressCallback = function(err, progress) {}
    bcrypt.hash(rawPassword, salt, progressCallback, function(err, hash) {
      if (err) {
        return cb({
          message: 'failed to register user, error hashing raw password',
          error: err,
          stack: new Error().stack
        })
      }
      return cb(null, hash)
    })
  })
}
