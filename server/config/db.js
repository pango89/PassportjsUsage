const sql = require('mssql');
const config = require('./config');
const pool = new sql.ConnectionPool(config.config);

exports.pool = pool;