console.log('开始测试...');

try {
  console.log('尝试加载mysql2模块...');
  const mysql = require('mysql2');
  console.log('mysql2模块加载成功');
  
  console.log('创建数据库连接池...');
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'resume_builder'
  });
  console.log('连接池创建成功');
  
  const promisePool = pool.promise();
  console.log('Promise连接池创建成功');
  
  async function testQuery() {
    try {
      console.log('开始执行测试查询...');
      const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
      console.log('查询成功:', rows);
    } catch (error) {
      console.error('查询失败:', error);
    } finally {
      console.log('测试完成');
    }
  }
  
  testQuery();
  
} catch (error) {
  console.error('测试过程中出现错误:', error);
}

console.log('测试脚本执行完毕');
