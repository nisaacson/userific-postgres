module.exports = function(client) {
  return function(email, cb) {
    var prep = 'SELECT token, available from access_tokens where email = $1'
    client.query(prep, [email], function(err, reply) {
      if (err) {
        return cb({
          message: 'failed to get access tokens for email',
          error: err,
          stack: new Error().stack
        })
      }
      var rows = reply.rows
      if (rows.length === 0) {
        return cb(null, rows)
      }
      cb(null, rows)
    })
  }
}
