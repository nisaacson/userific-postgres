var register = require('register')
var authenticate = require('./lib/authenticate')
var changeEmail = require('./lib/changeEmail')
var changePassword = require('./lib/changePassword')
var pg = require('pg');
var Userific = require('Userific')
var inherits = require('util').inherits
var inspect = require('eyespect').inspector();

function UserificPostGRES(config) {
  UserificPostGRES.super_.call(this)
  var conString = buildConnectionString(config)
  inspect(conString,'postgre connection string')
  var client = new pg.Client(conString);
  this.init = function(cb) {
    client.connect(function(err) {
      if (err) {
        return cb({
          message: 'failed to setup userific postgres backend, error connecting to database',
          error: err,
          stack: new Error().stack
        })
      }
      client.query('SELECT NOW() AS "theTime"', function(err, result) {
        console.log(result.rows[0].theTime);
        cb()
        //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      })
    })
  }
  var table = config.table

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
