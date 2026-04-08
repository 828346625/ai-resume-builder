const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'resume_builder',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 导出Promise版本的连接
const promisePool = pool.promise();

module.exports = promisePool;