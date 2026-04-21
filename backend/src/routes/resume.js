const express = require('express');
const router = express.Router();
const { generatePoints } = require('../services/aiService');
const authenticateToken = require('../middleware/auth');
const db = require('../db');

// AI生成简历摘要
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { experience, skills } = req.body;
    
    if (!experience || experience.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '工作经历描述不能为空'
      });
    }
    
    // 使用AI生成要点
    const points = await generatePoints(experience);
    
    // 生成摘要
    const summary = points.join('\n\n');
    
    res.json({
      success: true,
      data: { summary }
    });
    
  } catch (error) {
    console.error('生成失败:', error);
    res.status(500).json({
      success: false,
      message: '生成失败，请重试'
    });
  }
});

// 保存简历
router.post('/', authenticateToken, async (req, res) => {
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
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '姓名不能为空'
      });
    }

    const skillsStr = skills ? JSON.stringify(skills) : null;
    const workStr = workExperiences ? JSON.stringify(workExperiences) : null;
    const eduStr = educations ? JSON.stringify(educations) : null;

    const [result] = await db.query(
      `INSERT INTO resumes (name, jobTitle, email, phone, skills, workExperiences, educations, summary, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, jobTitle, email, phone, skillsStr, workStr, eduStr, summary, userId]
    );

    res.json({
      success: true,
      data: { id: result.insertId },
      message: '保存成功'
    });

  } catch (error) {
    console.error('保存失败:', error);
    res.status(500).json({
      success: false,
      message: '保存失败'
    });
  }
});

// 获取用户简历列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const [rows] = await db.query(
      'SELECT id, name, jobTitle, createdAt FROM resumes WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('获取简历列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败'
    });
  }
});

// 获取单个简历
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const [rows] = await db.query(
      'SELECT * FROM resumes WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '简历不存在'
      });
    }
    
    const resume = rows[0];
    
    // 解析JSON字段
    resume.skills = resume.skills ? JSON.parse(resume.skills) : [];
    resume.workExperiences = resume.workExperiences ? JSON.parse(resume.workExperiences) : [];
    resume.educations = resume.educations ? JSON.parse(resume.educations) : [];
    
    res.json({
      success: true,
      data: resume
    });
    
  } catch (error) {
    console.error('获取简历失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败'
    });
  }
});

// 更新简历
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
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

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '姓名不能为空'
      });
    }

    const skillsStr = skills ? JSON.stringify(skills) : null;
    const workStr = workExperiences ? JSON.stringify(workExperiences) : null;
    const eduStr = educations ? JSON.stringify(educations) : null;

    await db.query(
      `UPDATE resumes SET name=?, jobTitle=?, email=?, phone=?, skills=?, workExperiences=?, educations=?, summary=?, updatedAt=NOW()
       WHERE id=? AND userId=?`,
      [name, jobTitle, email, phone, skillsStr, workStr, eduStr, summary, id, userId]
    );

    res.json({
      success: true,
      message: '更新成功'
    });

  } catch (error) {
    console.error('更新失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
});

// 删除简历
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    await db.query(
      'DELETE FROM resumes WHERE id = ? AND userId = ?',
      [id, userId]
    );
    
    res.json({
      success: true,
      message: '删除成功'
    });
    
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

module.exports = router;