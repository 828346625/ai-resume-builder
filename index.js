const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');  // 添加这行：引入数据库

const app = express();

app.use(cors());
app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.json({
    message: '✅ 后端服务运行成功！',
    time: new Date().toLocaleString()
  });
});

// ========== 新增：保存简历接口 ==========
app.post('/api/resume', async (req, res) => {
  try {
    const {
      name,
      jobTitle,
      email,
      phone,
      skills,
      workExperiences,
      educations,
      summary
    } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '姓名不能为空'
      });
    }

    // 将数组/对象转换为JSON字符串存储
    const skillsStr = skills ? JSON.stringify(skills) : null;
    const workStr = workExperiences ? JSON.stringify(workExperiences) : null;
    const eduStr = educations ? JSON.stringify(educations) : null;

    // 插入数据库
    const [result] = await db.execute(
      `INSERT INTO resumes (name, jobTitle, email, phone, skills, workExperiences, educations, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, jobTitle, email, phone, skillsStr, workStr, eduStr, summary]
    );

    res.json({
      code: 200,
      data: { id: result.insertId },
      message: '保存成功'
    });

  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});
// =====================================

// 启动服务器
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ 服务器已启动！`);
  console.log(`✅ 访问地址：http://localhost:${PORT}`);
});