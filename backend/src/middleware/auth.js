const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key_2026';

// 验证 token 的中间件
function authenticateToken(req, res, next) {
  // 从请求头获取 token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '请先登录'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(403).json({
      code: 403,
      message: 'token 无效或已过期'
    });
  }
}

module.exports = authenticateToken;