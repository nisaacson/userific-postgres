var should = require('should')
var UserificPostGRES = require('../')
var inspect = require('eyespect').inspector()
var config = {
  host: 'localhost',
  port: '1234',
  user: 'fooUser',
  db: 'userific-test',
  table: 'users',
  pass: 'barPassword'
}
describe('Setup', function () {
  it('should create backend correctly', function (done) {
    var backend = new UserificPostGRES(config)
    backend.init(function (err) {
      should.not.exist(err)
      inspect('backend init done')
      done()
    })
  })
})
