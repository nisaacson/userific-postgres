var SqlString = require('./lib/SqlString')
var register = require('./lib/register')
var authenticate = require('./lib/authenticate')
var changeEmail = require('./lib/changeEmail')

var changePassword = require('./lib/changePassword')


var validateTable = require('./lib/validateTable')
var pg = require('pg');
var Userific = require('Userific')
var inherits = require('util').inherits;

function UserificPostGRES(config) {
  UserificPostGRES.super_.call(this)
  var conString = buildConnectionString(config)
  var client = new pg.Client(conString);
  var table = config.table
  // table = SqlString.escape(table).replace(/'/g)
  this.init = function(cb) {
    client.connect(function(err) {
      if (err) {
        return cb({
          message: 'failed to setup userific postgres backend, error connecting to database',
          error: err,
          stack: new Error().stack
        })
      }
      validateTable(client, table, cb)
    })
  }
  this.register = register(client, table)
  this.authenticate = authenticate(client, table)
  this.changeEmail = changeEmail(client, table)
  this.changePassword = changePassword(client, table)
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