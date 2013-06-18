var should = require('should')
var UserificPostGRES = require('../')
var testSuite = require('userific-test')
var inspect = require('eyespect').inspector()
var assert = require('assert')
var backend
var config = {
  host: 'localhost',
  port: '5432',
  user: '',
  db: 'userific-test',
  table: 'users',
  pass: ''
}

describe('Userific Postgres', function() {
  var client
  backend = new UserificPostGRES(config)
  before(function(done) {
    backend.init(function(err, clientReply) {
      should.not.exist(err)
      should.exist(clientReply)
      client = clientReply
      done()
    })
  })
  beforeEach(function(done) {
    var query = 'DELETE FROM ' + config.table
    client.query(query, done)
  })
  var userData = {
    email: 'foo@example.com',
    password: 'barPassword'
  }
  testSuite(backend)

  // it('should register user', function(done) {
  //   backend.register(userData, function(err, user) {
  //     if (err) {
  //       inspect(err, 'error registering user')
  //     }
  //     should.not.exist(err, 'error registering user')
  //     assert.ok(!user.confirmed, 'user should not be confirmed after registration')
  //     backend.authenticate(userData, function(err, authenticatedUser) {
  //       should.exist(err, 'should not be able to authenticate unconfirmed user')
  //       should.not.exist(authenticatedUser)
  //       var confirmData = {
  //         confirmToken: user.confirmToken
  //       }
  //       backend.confirmEmail(confirmData, function(err, reply) {
  //         should.not.exist(err, 'error confirming email')
  //         inspect(reply, 'confirm email reply')
  //         backend.authenticate(userData, function(err, authenticatedUser) {
  //           should.not.exist(err, 'should be able to authenticate unconfirmed user')
  //           should.exist(authenticatedUser)
  //           inspect(authenticatedUser, 'authenticated user')

  //           done()
  //         })
  //       })
  //     })
  //   })
  // })
})
