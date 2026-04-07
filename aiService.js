const OpenAI = require('openai');

// 初始化 DeepSeek 客户端
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

/**
 * 根据工作描述生成简历要点
 */
async function generatePoints(workDescription) {
  const prompt = `你是一位资深简历顾问。请根据以下工作经历描述，生成3条专业的简历要点。

要求：
1. 每条以强有力的动词开头（如：负责、主导、优化、设计、实现）
2. 尽可能包含量化成果（如：提升30%、减少50%时间、覆盖1000+用户）
3. 每条不超过40字
4. 只返回JSON数组格式，不要有其他解释文字

工作经历描述：
${workDescription}

请直接返回JSON数组，示例：["主导xx项目开发，上线后用户增长50%", "优化系统性能，接口响应时间缩短30%"]`;

  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的简历优化助手，只返回JSON格式的数组。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    console.log('AI返回原始内容:', content);  // 调试用
    
    // 解析 JSON
    let points = JSON.parse(content);
    
    if (!Array.isArray(points)) {
      points = [points];
    }
    
    return points;
    
  } catch (error) {
    console.error('AI调用失败:', error);
    // 降级返回默认内容
    return [
      "负责核心功能开发，确保项目按时交付",
      "优化代码结构，提升系统可维护性",
      "与团队协作解决技术难题，获得好评"
    ];
  }
}

module.exports = { generatePoints };