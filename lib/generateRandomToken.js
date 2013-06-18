var crypto = require('crypto')
module.exports = function(length) {
  if (!length) {
    length = 32
  }
  return crypto.randomBytes(length).toString('hex');
}
