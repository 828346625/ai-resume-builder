const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: '测试服务器运行成功！' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});
