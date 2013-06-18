var inspect = require('eyespect').inspector()
module.exports = function(backend) {
  before(function(done) {
    setTimeout(function() {
      console.log('setup compelete')
      backend = {foo: 'bar'}
      inspect(backend,'backend')
      done()
    }, 1000)
  })
}
