module.exports = function(client, table) {
  var self = this
  return function(changeData, cb) {
    var email = changeData.email
    var currentPassword = changeData.currentPassword
    var newPassword = changeData.newPassword
    return cb('resetPassword not implemented')
  }
}
