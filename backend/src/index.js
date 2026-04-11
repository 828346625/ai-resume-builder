// ========== 引入环境变量 ==========
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');  // 添加这行：引入数据库
const { generatePoints } = require('./services/aiService');//引入 AI 服务
// ========== 创建 Express 应用 ==========
const app = express();
app.use(cors());
app.use(express.json());
const userRoutes = require('./routes/user');
const authenticateToken = require('./middleware/auth');
app.use('/api/user', userRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.json({
    message: '✅ 后端服务运行成功！',
    time: new Date().toLocaleString()
  });
});



// ========== AI 生成简历要点接口 ==========
app.post('/api/ai/generate-points', async (req, res) => {
  try {
    const { workDescription } = req.body;
    
    if (!workDescription || workDescription.trim() === '') {
      return res.status(400).json({
        code: 400,
        message: '工作描述不能为空'
      });
    }
    
    console.log('收到生成请求:', workDescription);
    
    const points = await generatePoints(workDescription);
    
    res.json({
      code: 200,
      data: { points },
      message: '生成成功'
    });
    
  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({
      code: 500,
      message: 'AI生成失败，请重试',
      error: error.message
    });
  }
});

// ========== 保存简历接口 ==========
app.post('/api/resume', authenticateToken, async (req, res) => {
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
    const userId = req.userId;  // 从 token 获取用户ID

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

    // 插入数据库，带上userId
    const [result] = await db.query(
      `INSERT INTO resumes (name, jobTitle, email, phone, skills, workExperiences, educations, summary, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, jobTitle, email, phone, skillsStr, workStr, eduStr, summary, userId]
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

// ========== 获取简历列表 ==========
app.get('/api/resumes', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;  // 从 token 获取用户ID
    // 分页参数：page=1&limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // 查询总数，只统计当前用户的简历
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM resumes WHERE userId = ?', [userId]);
    const total = countResult[0].total;
    
    // 查询分页数据，只返回当前用户的简历
    const [rows] = await db.query(
      `SELECT id, name, jobTitle, email, phone, createdAt, updatedAt 
       FROM resumes 
       WHERE userId = ?
       ORDER BY createdAt DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      },
      message: '获取成功'
    });
    
  } catch (error) {
    console.error('获取列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

// ========== 获取单份简历 ==========
app.get('/api/resume/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;  // 从 token 获取用户ID
    
    const [rows] = await db.query('SELECT * FROM resumes WHERE id = ? AND userId = ?', [id, userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '简历不存在'
      });
    }
    
    // 解析JSON字段
    const resume = rows[0];
    if (resume.skills) resume.skills = JSON.parse(resume.skills);
    if (resume.workExperiences) resume.workExperiences = JSON.parse(resume.workExperiences);
    if (resume.educations) resume.educations = JSON.parse(resume.educations);
    
    res.json({
      code: 200,
      data: resume,
      message: '获取成功'
    });
    
  } catch (error) {
    console.error('获取简历失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

// ========== 删除简历 ==========
app.delete('/api/resume/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;  // 从 token 获取用户ID
    
    // 先检查是否存在，并且属于当前用户
    const [check] = await db.query('SELECT id FROM resumes WHERE id = ? AND userId = ?', [id, userId]);
    if (check.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '简历不存在'
      });
    }
    
    // 执行删除，只删除当前用户的简历
    await db.query('DELETE FROM resumes WHERE id = ? AND userId = ?', [id, userId]);
    
    res.json({
      code: 200,
      data: { id: parseInt(id) },
      message: '删除成功'
    });
    
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

// ========== 更新简历 ==========
app.put('/api/resume/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;  // 从 token 获取用户ID
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

    // 先检查简历是否存在，并且属于当前用户
    const [check] = await db.query('SELECT version FROM resumes WHERE id = ? AND userId = ?', [id, userId]);
    if (check.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '简历不存在'
      });
    }

    const currentVersion = check[0].version;
    const newVersion = currentVersion + 1;

    // 将数组/对象转换为JSON字符串
    const skillsStr = skills ? JSON.stringify(skills) : null;
    const workStr = workExperiences ? JSON.stringify(workExperiences) : null;
    const eduStr = educations ? JSON.stringify(educations) : null;

    // 更新简历，版本号+1，只更新当前用户的简历
    const [result] = await db.query(
      `UPDATE resumes 
       SET name = ?, jobTitle = ?, email = ?, phone = ?, 
           skills = ?, workExperiences = ?, educations = ?, summary = ?,
           version = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND userId = ?`,
      [name, jobTitle, email, phone, skillsStr, workStr, eduStr, summary, newVersion, id, userId]
    );

    res.json({
      code: 200,
      data: { 
        id: parseInt(id),
        version: newVersion
      },
      message: '更新成功'
    });

  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

// ========== 获取版本历史 ==========
app.get('/api/resume/:id/versions', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId;  // 从 token 获取用户ID

    // 检查简历是否存在，并且属于当前用户
    const [check] = await db.query('SELECT id FROM resumes WHERE id = ? AND userId = ?', [id, userId]);
    if (check.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '简历不存在'
      });
    }

    // 获取当前简历（目前只存最新版本，版本历史需要单独建表）
    const [rows] = await db.query(
      `SELECT id, name, jobTitle, email, phone, skills, workExperiences, educations, summary, version, createdAt, updatedAt
       FROM resumes 
       WHERE id = ? AND userId = ?`,
      [id, userId]
    );

    // 解析JSON字段
    const resume = rows[0];
    if (resume.skills) resume.skills = JSON.parse(resume.skills);
    if (resume.workExperiences) resume.workExperiences = JSON.parse(resume.workExperiences);
    if (resume.educations) resume.educations = JSON.parse(resume.educations);

    res.json({
      code: 200,
      data: {
        current: resume,
        message: '当前版本信息（如需完整版本历史，需要创建版本历史表）'
      },
      message: '获取成功'
    });

  } catch (error) {
    console.error('获取版本失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});


// ========== 启动服务器 ==========
const PORT = 5000;
try {
  app.listen(PORT, () => {
    console.log(`✅ 服务器已启动！`);
    console.log(`✅ 访问地址：http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('服务器启动失败:', error);
  process.exit(1);
}

// 捕获未处理的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});