// 待实现 - 需要配置 OpenAI API
const generateResumeContent = async (userInput) => {
  // 临时返回模拟数据
  return {
    summary: `基于您提供的${userInput.skills?.join(', ') || '技能'}，我们生成了以下简历内容...`,
    bulletPoints: ['协助团队完成了3个项目', '提升了20%的工作效率']
  };
};

module.exports = { generateResumeContent };