module.exports = function fetchUserByConfirmToken(client, table, email, cb) {
  var query = 'select id, email, password, confirmed from ' + table + ' where email = $1'
  client.query(query, [email], function(err, reply) {
    if (err) {
      return cb({
        message: 'failed to fetch user by email',
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
