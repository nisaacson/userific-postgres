var path = require('path')
module.exports = validateTable;
function validateTable(client, table, cb) {
  tableExists(client, table, function(err) {
    if (err) {
      return cb(err)
    }
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
      var columns = data.rows
      if (!columns || columns.length === 0) {
        return cb({
          message: 'failed to validate table',
          error: 'table has no columns',
          table: table,
          stack: new Error().stack
        })
      }
      return validateColumns(columns, cb)
    })
  })
}

function tableExists(client, table, cb) {
  var getTableQuery = 'SELECT * FROM information_schema.tables'
  client.query(getTableQuery, function(err, data) {
    if (err) {
      return cb({
        message: 'failed to validate table, error looking up table in information_schema.tables',
        error: '',
        stack: new Error().stack
      })
    }
    var exists = data.rows.some(function(row) {
      var testName = row.table_name
      if (row.table_name === table) {
        return true
      }
      return false
    })
    if (exists) {
      return cb()
    }
    var filePath = path.join(__dirname, '../share/users.sql')
    return cb({
      message: 'failed to validate table',
      error: 'table with given name does not exist. You can create a default users table using the users.sql file in the share folder of this module. This file is located at ' + filePath,
      table: table,
      stack: new Error().stack
    })
  })
}

function validateColumns(columns, cb) {
  var idColumnFound, emailColumnFound, passwordColumnFound, confirmTokenColumnFound, confirmedColumnFound, resetTokenColumnFound
    idColumnFound = emailColumnFound = passwordColumnFound = confirmTokenColumnFound = confirmedColumnFound = resetTokenColumnFound = false
    columns.forEach(function(record) {
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
      if (name === 'confirm_token' && record.data_type === 'text') {
        confirmTokenColumnFound = true
        return
      }
      if (name === 'confirmed' && record.data_type === 'boolean') {
        confirmedColumnFound = true
        return
      }
      if (name === 'reset_token' && record.data_type === 'text') {
        resetTokenColumnFound = true
        return
      }
    });

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
  if (!confirmTokenColumnFound) {
    errors.push({
      key: 'confirm_token',
      error: 'column with name "confirm_token" and type "text" not found'
    })
  }
   if (!confirmedColumnFound) {
    errors.push({
      key: 'confirmed',
      error: 'column with name "confirmed" and type "boolean" not found'
    })
  }
  if (!resetTokenColumnFound) {
    errors.push({
      key: 'reset_token',
      error: 'column with name "reset_token" and type "text" not found'
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
}
