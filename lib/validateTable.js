module.exports = function(client, table, cb) {
  var queryString = 'select column_name,data_type,character_maximum_length from INFORMATION_SCHEMA.COLUMNS where table_name = $1'
  client.query(queryString, [table], function(err, data) {
    if (err) {
      return cb({
        message: 'failed to validate table, error checking schema',
        error: err,
        query: queryString,
        stack: new Error().stack
      })
    }
    var rows = data.rows
    if (!rows || rows.length === 0) {
      return cb({
        message: 'failed to validate table',
        error: 'table does not exist',
        stack: new Error().stack
      })
    }
    var idColumnFound, emailColumnFound, passwordColumnFound
      idColumnFound = emailColumnFound = passwordColumnFound = false
      rows.forEach(function(record) {
        var name = record.column_name
        if (name === 'id' && record.data_type === 'uuid') {
          idColumnFound = true
          return
        }
        if (name === 'email' && record.data_type === 'text') {
          emailColumnFound = true
          return
        }
        if (name === 'password' && record.data_type === 'text') {
          passwordColumnFound = true
          return
        }
      })

      var errors = []
    if (!emailColumnFound) {
      errors.push({
        key: 'email',
        error: 'column with name "email" and type "text" not found'
      })
    }
    if (!passwordColumnFound) {
      errors.push({
        key: 'password',
        error: 'column with name "password" and type "text" not found'
      })
    }
    if (!idColumnFound) {
      errors.push({
        key: 'id',
        error: 'column with name "id" and type "uuid" not found'
      })
    }
    if (errors.length === 0) {
      return cb()
    }
    return cb({
      message: 'failed to validate table',
      error: errors,
      stack: new Error().stack
    })
  })
}
