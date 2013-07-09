module.exports = function(client) {
  return function(email, cb) {
    var self = this
    self.fetchUserByEmail(email, function(err, user) {
      if (err) {
        return cb(err)
      }
      var userID = user.id
      var sql = 'SELECT roles.name from roles LEFT JOIN users_roles on users_roles.role_id = roles.id where users_roles.user_id = $1'
      client.query(sql, [userID], function(err, reply) {
        if (err) {
          return cb({
            message: 'failed to get roles for email',
            error: err,
            userID: userID,
            email: email,
            stack: new Error().stack
          })
        }
        var rows = reply.rows
        var roles = rows.map(function(row) {
          var name = row.name
          return name
        })
        cb(null, roles)
      })
    })
  }
}
