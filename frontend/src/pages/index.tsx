import React, { useState } from 'react';

export default function Home() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 测试后端连接
  const testBackend = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse('连接失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 测试 AI 生成接口
  const testAIGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workDescription: '我负责开发了一个电商网站的前端页面，使用了React和TypeScript，优化了页面加载速度' })
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse('连接失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>AI简历构建器 - 后端测试</h1>
      
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <button 
          onClick={testBackend}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          测试后端连接
        </button>
        
        <button 
          onClick={testAIGenerate}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          测试AI生成简历要点
        </button>
      </div>

      {loading && <p>加载中...</p>}
      
      {response && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: '#f0f0f0', 
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          <strong>后端返回：</strong>
          <pre style={{ overflow: 'auto' }}>{response}</pre>
        </div>
      )}
    </div>
  );
}