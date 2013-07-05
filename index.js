var register = require('./lib/register')
var authenticate = require('./lib/authenticate')
var changeEmail = require('./lib/changeEmail')

var changePassword = require('./lib/changePassword')
var confirmEmail = require('./lib/confirmEmail')
var generatePasswordResetToken = require('./lib/generatePasswordResetToken')
var resetPassword = require('./lib/resetPassword')
var fetchUserByEmail = require('./lib/fetchUserByEmail')
var validateAccessToken = require('./lib/validateAccessToken')
var validateConfirmToken = require('./lib/validateConfirmToken')
var validateResetToken = require('./lib/validateResetToken')
var grantAccessTokensForEmail = require('./lib/grantAccessTokensForEmail')
var saveAccessTokenForEmail = require('./lib/saveAccessTokenForEmail')
var getAccessTokensForEmail = require('./lib/getAccessTokensForEmail')

var validateTable = require('./lib/validateTable')
var pg = require('pg');
var Userific = require('userific')
var inherits = require('util').inherits;

function UserificPostGRES(config) {
  UserificPostGRES.super_.call(this)
  var conString = buildConnectionString(config)
  var client = new pg.Client(conString);
  var table = config.table
  this.init = function(cb) {
    client.connect(function(err) {
      if (err) {
        return cb({
          message: 'failed to setup userific postgres backend, error connecting to database',
          error: err,
          stack: new Error().stack
        })
      }
      cb(null, client)
    })
  }
  this.register = register(client, config.useAccessTokens)
  this.authenticate = authenticate(client)
  this.changeEmail = changeEmail(client)
  this.changePassword = changePassword(client)
  this.generatePasswordResetToken = generatePasswordResetToken(client)
  this.resetPassword = resetPassword(client)
  this.confirmEmail = confirmEmail(client)
  this.fetchUserByEmail = fetchUserByEmail(client)
  this.validateAccessToken = validateAccessToken(client)
  this.validateConfirmToken = validateConfirmToken(client)
  this.validateResetToken = validateResetToken(client)
  this.grantAccessTokensForEmail = grantAccessTokensForEmail(client)
  this.getAccessTokensForEmail = getAccessTokensForEmail(client)
  this.saveAccessTokenForEmail = saveAccessTokenForEmail(client)
}

function buildConnectionString(config) {
  var conString = 'tcp://'
  if (config.user && config.pass) {
    conString += config.user + ':' + config.pass + '@'
  }
  conString += config.host + ':' + config.port + '/' + config.db
  return conString
}
inherits(UserificPostGRES, Userific)
module.exports = UserificPostGRES
