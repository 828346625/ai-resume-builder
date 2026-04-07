// 提示词模板 - 待优化
const getResumePrompt = (userData) => {
  return `
    请根据以下信息生成专业的简历描述：
    工作经验：${userData.experience || '无'}
    技能：${userData.skills?.join(', ') || '无'}
    
    要求：语言专业、突出成就、使用动词开头
  `;
};

module.exports = { getResumePrompt };