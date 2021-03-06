# Userfic PostGRES backend

[![Build Status](https://travis-ci.org/nisaacson/userific-postgres.png)](https://travis-ci.org/nisaacson/userific-postgres)
[![Dependency Status](https://david-dm.org/nisaacson/userific-postgres.png)](https://david-dm.org/nisaacson/userific-postgres)

Manage users using a postgres database. This module implements the abstract [Userific](https://github.com/nisaacson/userific) interface

# Installation

```bash
npm install -S userific-postgres
```

# Requirements

This module requires that you have already have a table setup to handle your users. You can create a default users table using the text sql dump file located at `./share/users.sql`. To create a users table with the required columns, execute the following command in the root of this module. This will create a users table in the specified database with all the required columns

```bash
psql -d <database_name> -f ./share/users.sql
```


# Usage

```javascript
var UserificPostGRES = require('userific-postgres')
var config = {
  host: 'localhost',              // the host of the postgres server
  port: '27017',                  // the port of the postgres server
  db: 'userific-postgres-test',   // the postgres database to use,
  table: 'users'                  // the table name of where users are stored in the database
  user: 'postgres username here', // optional
  pass: 'postgres password here', // optional
  useAccessTokens: true         // optional, when true users must supply a valid accessToken value when registering
}


var backend = new UserificPostGRES(config)

// you must call the asynchronous init function before this postgres backend can be used
backend.init(function(err) {
  // backend implements all the interface methods of the abstract Userific module
  var registerData = {
      email: 'foo@example.com',
      password: 'barPassword',
      accessToken: 'valid access token value here'
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
