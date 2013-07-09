var bcrypt = require('bcrypt-nodejs')
module.exports = function(client) {
  return function(userData, cb) {
    var self = this
    var email = userData.email
    var rawPassword = userData.password
    self.fetchUserByEmail(email, function(err, record) {
      if (err) {
        return cb(err)
      }
      if (!record) {
        return cb()
      }
      validateRecord(rawPassword, record, cb)
    })
  }
};

function validateRecord(rawPassword, record, cb) {
  var hash = record.password
  comparePassword(rawPassword, hash, function(err, isMatch) {
    if (err) {
      return cb(err)
    }
    if (!isMatch) {
      return cb()
    }
    if (!record.confirmed) {
      return cb({
        message: 'failed to authenticate user, user is not confirmed',
        error: 'user is not confirmed',
        reason: 'unconfirmed',
        stack: new Error().stack
      })
    }
    var user = {
      email: record.email,
      _id: record.id
    }
    cb(null, user)
  })
}



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
