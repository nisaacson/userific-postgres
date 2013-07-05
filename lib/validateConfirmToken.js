module.exports = function(client) {
  return function fetchUserByConfirmToken(confirmToken, cb) {
    var query = 'select id, email, password, confirm_token, confirmed from users where confirm_token = $1'
    client.query(query, [confirmToken], function(err, reply) {
      if (err) {
        return cb({
          message: 'failed to fetch user by confirmToken',
          query: query,
          error: err,
          stack: new Error().stack
        })
      }
      if (!reply.rows || reply.rows.length === 0) {
        return cb()
      }
      var rows = reply.rows
      var record = rows[0]
      return cb(null, record)
    })
  }
}
