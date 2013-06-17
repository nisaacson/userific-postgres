# Userfic PostGRES backend

Manage users using a postgres database. This module implements the abstract [Userific](https://github.com/nisaacson/userific) interface

# Installation

```bash
npm install -S userific-postgres
```

# Usage

```javascript
var UserificPostGRES = require('userific-postgres')
var config = {
  host: 'localhost',              // the host of the postgres server
  port: '27017',                  // the port of the postgres server
  db: 'userific-postgres-test',   // the postgres database to use,
  table: 'users'                  // the table name of where users are stored in the database (defaults to "users")
  user: 'postgres username here',  // optional
  pass: 'postgres password here',  // optional
}


var backend = new UserificPostGRES(config)

// you must call the asynchronous init function before this postgres backend can be used
backend.init(function(err) {
  // backend implements all the interface methods of the abstract Userific module
  var registerData = {
      email: 'foo@example.com',
      password: 'barPassword'
  }
  backend.register(registerData, function(err, user) {
    if (err) {
      inspect(err, 'error registering user via the userific mongoose backend')
      return
    }
    inspect(user, 'registered user correctly')
  })
})
```


# Test

```bash
# install development dependencies
npm install
# run tests
npm test
```
