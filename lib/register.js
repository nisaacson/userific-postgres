var async = require('async')
var crypto = require('crypto')
var uuid = require('node-uuid')
var hashPassword = require('./hashPassword')
var generateRandomToken = require('./generateRandomToken')
module.exports = function(client, useAccessTokens) {
  var self
  return function(userData, callback) {
    self = this
    var email = userData.email
    var password = userData.password
    var accessToken = userData.accessToken
    var hash, user
      async.series([
        function(cb) {
          checkData(email, cb)
        },
        function(cb) {
          validateAccessTokenIfNeeded(userData.accessToken, cb)
        },
        function(cb) {
          hashPassword(password, function(err, reply) {
            if (err) {
              return cb(err)
            }
            hash = reply
            cb()
          })
        },
        function(cb) {
          var saveData = {
            email: email,
            hash: hash
          }
          saveUserToDatabase(saveData, function(err, reply) {
            if (err) {
              return cb(err)
            }
            user = reply
            cb()
          })
        },
        function(cb) {
          markAccessTokenUsed(accessToken, cb)
        }
      ], function(err) {
        callback(err, user)
      })
  }

  function validateAccessTokenIfNeeded(accessToken, cb) {
    if (!useAccessTokens) {
      return cb()
    }
    self.validateAccessToken(accessToken, cb)
  }

  function markAccessTokenUsed(accessToken, cb) {
    if (!useAccessTokens) {
      return cb()
    }
    var sql = 'UPDATE access_tokens SET available = $1 where token= $2'
    client.query(sql, [false, accessToken], function(err) {
      if (err) {
        return cb({
          message: 'register failed',
          reason: 'failed to mark access token as used',
          error: err,
          stack: new Error().stack
        })
      }
      cb()
    })
  }

  function checkData(email, cb) {
    self.fetchUserByEmail(email, function(err, user) {
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

  function saveUserToDatabase(data, cb) {
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
}
