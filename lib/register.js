var crypto = require('crypto')
var uuid = require('node-uuid')
var hashPassword = require('./hashPassword')
var generateRandomToken = require('./generateRandomToken')
var fetchUserByEmail = require('./fetchUserByEmail')
var inspect = require('eyespect').inspector()
module.exports = function(client, table) {
  return function(userData, cb) {
    var email = userData.email
    var password = userData.password
    checkData(client, table, email, function(err) {
      if (err) {
        return cb(err)
      }
      hashPassword(password, function(err, hash) {
        if (err) {
          return cb(err)
        }
        var saveData = {
          email: email,
          hash: hash
        }
        saveUserToDatabase(client, table, saveData, cb)
      })
    })
  }
};

function checkData(client, table, email, cb) {
  fetchUserByEmail(client, table, email, function(err, user) {
    if (user) {
      return cb({
        message: 'register failed',
        error: 'user with given email address already registered',
        reason: 'email_taken',
        stack: new Error().stack
      })
    }
    cb()
  })
}

function saveUserToDatabase(client, table, data, cb) {
  var email = data.email
  var hash = data.hash
  var id = uuid.v4()
  var confirmToken = generateRandomToken()
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
      email: email,
      confirmToken: confirmToken,
      _id: newlyCreatedUserId
    }
    return cb(null, user)
  })
}
