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
var registeredUserEmail = 'buzz@example.com'
var client
describe('Userific Postgres', function() {
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

  it('should save access token for email', function(done) {
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(registeredUserEmail, accessToken, function(err, reply) {
      should.not.exist(err)
      done()
    })
  })

  it('should get access tokens for email', function(done) {
    backend.getAccessTokensForEmail(registeredUserEmail, function(err, tokens) {
      should.not.exist(err)
      tokens.length.should.eql(0)
      var accessToken = uuid.v4()
      backend.saveAccessTokenForEmail(registeredUserEmail, accessToken, function(err, reply) {
        should.not.exist(err)
        backend.getAccessTokensForEmail(registeredUserEmail, function(err, tokens) {
          should.not.exist(err)
          tokens.length.should.eql(1)
          done()
        })
      })
    })
  })

  it('should grant access tokens correctly', function(done) {
    var accessToken = uuid.v4()
    var maxNumTokens = 3
    backend.grantAccessTokensForEmail(registeredUserEmail, maxNumTokens, function(err) {
      should.not.exist(err)
      backend.getAccessTokensForEmail(registeredUserEmail, function(err, tokens) {
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
    testRegister(userData, done)
  })

  it('should not register user with the same access token twice', function(done) {
    var accessToken = uuid.v4()
    backend.saveAccessTokenForEmail(registeredUserEmail, accessToken, function(err) {
      var email = 'bar@example.com'
      var password = 'barPassword'
      var userData = {
        email: email,
        password: password,
        accessToken: accessToken
      }
      backend.register(userData, function(err, reply) {
        should.not.exist(err, 'register error')
        should.exist(reply)
        reply.email.should.eql(userData.email)
        userData.email = 'bar2@example.com'
        backend.register(userData, function(err, reply) {
          should.exist(err)
          err.reason.should.eql('access_token_already_used')
          done()
        })
      })
    })
  })

  it('should confirm email correctly', function(done) {
    testRegister(userData, function(err, user) {
      should.not.exist(err)
      var email = user.email
      testConfirmEmail(email, done)
    })
  })
  it('should authenticate correctly', function(done) {
    var email = userData.email
    testRegister(userData, function(err, user) {
      testConfirmEmail(email, function(err, user) {
        testAuthenticate(userData, done)
      })
    })
  })

  it('should change email correctly', function(done) {
    var email = userData.email
    testRegister(userData, function(err, user) {
      testConfirmEmail(email, function(err, user) {
        testAuthenticate(userData, function(err, user) {
          should.not.exist(err)
          var newEmail = 'fizzbuzz@example.com'
          newEmail.should.not.eql(user.email)
          var changeData = {
            currentEmail: user.email,
            newEmail: newEmail
          }
          backend.changeEmail(changeData, function(err, reply) {
            if (err) {
              inspect(err, 'error changing email')
            }
            should.not.exist(err, 'error changing email')
            var authData = {
              email: newEmail,
              password: userData.password
            }
            testAuthenticate(authData, done)
          })
        })
      })
    })
  })

  it('should reset password correctly', function(done) {
    var email = userData.email
    testRegister(userData, function(err, user) {
      testConfirmEmail(email, function(err, user) {
        testAuthenticate(userData, function(err, user) {
          var generateData = {
            email: email
          }
          backend.generatePasswordResetToken(generateData, function(err, reply) {
            if (err) {
              inspect(err, 'error generating password reset token')
            }
            should.not.exist(err, 'error generating password reset token')
            var resetToken = reply.resetToken
            should.exist(resetToken)
            var resetData = {
              resetToken: resetToken
            }
            backend.resetPassword(resetData, function(err, newRawPassword) {
              if (err) {
                inspect(err, 'error resetting password')
              }
              should.not.exist(err, 'error resetting password')
              should.exist(newRawPassword, 'new raw password not returned')
              var authData = {
                email: email,
                password: newRawPassword
              }
              testAuthenticate(authData, done)
            })
          })
        })
      })
    })
  })

  it('should change password correctly', function(done) {
    var email = userData.email
    testRegister(userData, function(err, user) {
      testConfirmEmail(email, function(err, user) {
        testAuthenticate(userData, function(err, user) {
          var newPassword = 'barPassword2'
          var currentPassword = userData.password
          newPassword.should.not.eql(currentPassword)
          var changeData = {
            email: email,
            currentPassword: currentPassword,
            newPassword: newPassword
          }

          backend.changePassword(changeData, function(err, reply) {
            if (err) {
              inspect(err, 'error changing password')
            }
            should.not.exist(err, 'error changing password')
            var authData = {
              email: email,
              password: newPassword
            }
            testAuthenticate(authData, function(err, user) {
              should.not.exist(err)
              // should not be able to authenticate with old password
              var oldAuthData = {
                email: email,
                password: currentPassword
              }
              backend.authenticate(userData, function(err, reply) {
                should.not.exist(err)
                should.not.exist(reply, 'no user should be returned authenticate function')
                done()
              })
            })
          })
        })
      })
    })
  })

  it('should grant role for email ', function(done) {
    testRegister(userData, function(err, user) {
      var role = 'admin'
      var email = user.email
      backend.grantRoleForEmail(role, email, function(err, reply) {
        should.not.exist(err)
        backend.getRolesForEmail(email, function(err, roles) {
          should.not.exist(err)
          roles.length.should.eql(1)
          roles[0].should.eql(role)
          done()
        })
      })
    })
  })
});

function testConfirmEmail(email, cb) {
  getConfirmTokenForEmail(email, function(err, confirmToken) {
    if (err) {
      return cb(err)
    }
    should.exist(confirmToken)
    var confirmData = {
      email: email,
      confirmToken: confirmToken
    }
    backend.confirmEmail(confirmData, function(err, reply) {
      if (err) {
        inspect(err, 'error confirming email')
      }
      should.not.exist(err, 'error confirming email')
      reply.confirmed.should.eql(true)
      reply.email.should.eql(email)
      cb();
    })
  })
}

function testRegister(userData, cb) {
  var accessToken = uuid.v4()
  backend.saveAccessTokenForEmail(registeredUserEmail, accessToken, function(err) {
    userData.accessToken = accessToken
    should.not.exist(err)
    backend.register(userData, function(err, reply) {
      should.not.exist(err)
      should.exist(reply)
      reply.email.should.eql(userData.email)
      cb(null, reply)
    })
  })
}

function testAuthenticate(userData, cb) {
  backend.authenticate(userData, function(err, reply) {
    should.not.exist(err)
    should.exist(reply, 'no user returned from authenticate function')
    reply.email.should.eql(userData.email)
    should.exist(reply._id, '_id should be set on user reply')
    cb(null, reply)
  })
}

function getConfirmTokenForEmail(email, cb) {
  var query = 'SELECT confirm_token from users where email = $1'
  client.query(query, [email], function(err, reply) {
    should.not.exist(err, 'error getting confirm code')
    var rows = reply.rows
    rows.length.should.eql(1)
    var record = rows[0]
    var confirmToken = record.confirm_token
    should.exist(confirmToken, 'confirmToken not found')
    return cb(null, confirmToken)
  })
}
