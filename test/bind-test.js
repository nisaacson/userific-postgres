var uuid = require('uuid')
var inspect = require('eyespect').inspector()
var UserificPostGRES = require('../')
var config = {
  host: 'localhost',
  port: '5432',
  user: '',
  db: 'userific-test',
  table: 'users',
  pass: '',
  useAccessTokens: true
}
var should = require('should')
var registeredUserEmail = 'buzz@example.com'
var client, backend;
describe('Bind', function() {
  this.timeout('20s')
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
    var query = 'DELETE FROM users'
    client.query(query, function(err) {
      should.not.exist(err)
      var query = 'DELETE FROM access_tokens'
      client.query(query, function(err) {
        should.not.exist(err)
        var userID = uuid.v4()
        var hash = 'fooPasswordHash'
        client.query('INSERT INTO users (id, email, password, confirmed) VALUES ($1, $2, $3, $4)', [userID, registeredUserEmail, hash, false], done)
      })
    })
  })
  var userData = {
    email: 'foo@example.com',
    password: 'barPassword'
  }

  it('should bind correctly', function(done) {
    var logRegister = function(backendRegister) {
      var self = this
      return function(data, cb) {
        backendRegister.call(self, data, function(err, user) {
          cb(err, user)
        })
      }
    }

    var backendRegister = backend.register
    var newRegister = logRegister.call(backend, backendRegister)
    backend.register = newRegister

    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(registeredUserEmail, accessToken, function(err) {
      userData.accessToken = accessToken
      should.not.exist(err)
      backend.register(userData, function(err, user) {
        should.not.exist(err)
        should.exist(user)
        done()
      })
    })
  })
})
