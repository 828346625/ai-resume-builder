const express = require('express');
const router = express.Router();

// 测试路由
router.post('/generate', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      summary: '这是一个AI生成的简历摘要（测试数据）' 
    } 
  });
});

module.exports = router;