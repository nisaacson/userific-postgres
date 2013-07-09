var should = require('should')
var UserificPostGRES = require('../')
var testSuite = require('userific-test')
var inspect = require('eyespect').inspector()
var assert = require('assert')
var uuid = require('uuid')
var backend
var config = {
  host: 'localhost',
  port: '5432',
  user: '',
  db: 'userific-test',
  table: 'users',
  pass: '',
  useAccessTokens: true
}

describe('Userific Postgres', function() {
  this.timeout('20s')
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
    var query = 'DELETE FROM users'
    client.query(query, function(err) {
      should.not.exist(err)
      var query = 'DELETE FROM access_tokens'
      client.query(query, function(err) {
        should.not.exist(err)
        var userID = uuid.v4()
        var hash = 'fooPasswordHash'
        var email = userData.email
        client.query('INSERT INTO users (id, email, password, confirmed) VALUES ($1, $2, $3, $4)', [userID, email, hash, false], done)
      })
    })
  })
  var userData = {
    email: 'foo@example.com',
    password: 'barPassword'
  }

  it('should save access token for email', function(done) {
    var email = userData.email
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(email, accessToken, function(err, reply) {
      should.not.exist(err)
      done()
    })
  })

  it('should get access tokens for email', function(done) {
    var email = userData.email
    backend.getAccessTokensForEmail(email, function(err, tokens) {
      should.not.exist(err)
      tokens.length.should.eql(0)
      var email = userData.email
      var accessToken = uuid.v4()
      backend.saveAccessTokenForEmail(email, accessToken, function(err, reply) {
        should.not.exist(err)
        backend.getAccessTokensForEmail(email, function(err, tokens) {
          should.not.exist(err)
          tokens.length.should.eql(1)
          done()
        })
      })
    })
  })

  it('should grant access tokens correctly', function(done) {
    var email = userData.email
    var accessToken = uuid.v4()
    var maxNumTokens = 3
    backend.grantAccessTokensForEmail(email, maxNumTokens, function(err) {
      should.not.exist(err)
      backend.getAccessTokensForEmail(email, function(err, tokens) {
        should.not.exist(err)
        tokens.length.should.eql(maxNumTokens)
        done()
      })
    })
  })

  it('should not register user without valid access token ', function(done) {
    var email = 'bar@example.com'
    var password = 'barPassword'
    var accessToken = uuid.v4()
    var userData = {
      email: email,
      password: password,
      accessToken: accessToken
    }
    backend.register(userData, function(err, reply) {
      err.reason.should.eql('invalid_access_token')
      done()
    })
  })

  it('should register user with valid access token ', function(done) {
    var existingEmail = userData.email
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(existingEmail, accessToken, function(err) {
      var email = 'bar@example.com'
      var password = 'barPassword'
      var userData = {
        email: email,
        password: password,
        accessToken: accessToken
      }
      backend.register(userData, function(err, reply) {
        should.not.exist(err, 'register error')

        // user should not have any access tokens until they confirm their email
        backend.getAccessTokensForEmail(email, function(err, tokens) {
          should.not.exist(err)
          tokens.length.should.eql(0)
          done()
        })
      })
    })
  })

  it('should not register user with the same access token twice', function(done) {
    var existingEmail = userData.email
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(existingEmail, accessToken, function(err) {
      var email = 'bar@example.com'
      var password = 'barPassword'
      var userData = {
        email: email,
        password: password,
        accessToken: accessToken
      }
      backend.register(userData, function(err, reply) {
        should.not.exist(err, 'register error')
        userData.email = 'bar2@example.com'
        backend.register(userData, function(err, reply) {
          should.exist(err)
          err.reason.should.eql('access_token_already_used')
          done()
        })
      })
    })
  })

  it('should grant role for email ', function(done) {
    var existingEmail = userData.email
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(existingEmail, accessToken, function(err) {
      var email = 'bar@example.com'
      var password = 'barPassword'
      var userData = {
        email: email,
        password: password,
        accessToken: accessToken
      }
      backend.register(userData, function(err, reply) {
        var role = 'admin'
        backend.grantRoleForEmail(role, email, function(err, reply) {
          should.not.exist(err)
          backend.getRolesForEmail(email, function (err, roles) {
            should.not.exist(err)
            roles.length.should.eql(1)
            roles[0].should.eql(role)
            done()
          })
        })
      })
    })
  })
})
