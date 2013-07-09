var async = require('async')
module.exports = function(client) {
  return function(role, email, callback) {
    var self = this
    var userID, roleID;
    async.series([
      function(cb) {
        self.fetchUserByEmail(email, function(err, user) {
          if (err) {
            return cb(err)
          }
          userID = user.id
          if (!userID) {
            return cb({
              message: 'failed to grant role for email',
              error: 'userID not found for email',
              stack: new Error().stack
            })
          }
          cb()
        })
      },
      function(cb) {
        getRoleID(role, function(err, reply) {
          if (err) {
            return cb(err)
          }
          roleID = reply
          cb()
        })
      },
      function(cb) {
        addRoleID(roleID, userID, cb)
      }
    ], function(err) {
      if (err) {
        err.email = email
        err.role = role
      }
      return callback(err)
    })
  }

  function addRoleID(roleID, userID, cb) {
    var sql = 'INSERT INTO users_roles (role_id, user_id) VALUES ($1, $2)'
    client.query(sql, [roleID, userID], function(err) {
      if (err) {
        return cb({
          message: 'failed to grant role from email',
          error: err,
          userID: userID,
          roleID: roleID,
          stack: new Error().stack
        })
      }
      cb()
    })
  }

  function getRoleID(name, cb) {
    var sql = 'SELECT id from roles where name = $1'
    client.query(sql, [name], function(err, data) {
      if (err) {
        return cb({
          message: 'failed to get role',
          reason: 'role_not_found',
          role: name,
          error: err,
          stack: new Error().stack
        })
      }
      var rows = data.rows
      if (rows.length === 0) {
        return cb({
          message: 'failed to get role',
          reason: 'role_not_found',
          role: name,
          error: 'invalid role name',
          stack: new Error().stack
        })
      }
      var roleID = rows[0].id
      return cb(null, roleID)
    })
  }
}
