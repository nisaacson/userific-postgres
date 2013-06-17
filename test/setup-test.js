var should = require('should')
var UserificPostGRES = require('../')
var inspect = require('eyespect').inspector()
var config = {
  host: 'localhost',
  port: '5432',
  user: '',
  db: 'userific-test',
  table: 'users',
  pass: ''
}
describe('Setup', function () {
  it('should create backend correctly', function (done) {
    var backend = new UserificPostGRES(config)
    backend.init(function (err) {
      should.not.exist(err)
      done()
    })
  })
})
