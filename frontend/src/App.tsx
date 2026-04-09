import React, { useState } from 'react';

// ========== 类型定义 ==========
interface WorkExperience {
  id: number;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

type MenuItem = 'generate' | 'resumes' | 'profile';

// ========== 主组件 ==========
function App() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('generate');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 简历表单数据
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [summary, setSummary] = useState('');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }
  ]);

  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ========== 工作经历操作 ==========
  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
  };
  const removeWorkExperience = (id: number) => {
    if (workExperiences.length > 1) setWorkExperiences(workExperiences.filter(exp => exp.id !== id));
  };
  const updateWorkExperience = (id: number, field: keyof WorkExperience, value: string) => {
    setWorkExperiences(workExperiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  // ========== 教育经历操作 ==========
  const addEducation = () => {
    setEducations([...educations, { id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }]);
  };
  const removeEducation = (id: number) => {
    if (educations.length > 1) setEducations(educations.filter(edu => edu.id !== id));
  };
  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducations(educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  // ========== AI 生成 ==========
  const handleAIGenerate = async () => {
    if (!aiInput.trim()) { setMessage('请输入工作描述'); return; }
    setAiLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/ai/generate-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workDescription: aiInput })
      });
      const data = await res.json();
      if (data.code === 200 && data.data.points) {
        const latestWork = workExperiences[workExperiences.length - 1];
        if (latestWork) {
          const newDescription = latestWork.description ? latestWork.description + '\n' + data.data.points.join('\n') : data.data.points.join('\n');
          updateWorkExperience(latestWork.id, 'description', newDescription);
        }
        setMessage('✅ AI 生成成功！已添加到工作描述中');
      } else {
        setMessage('生成失败：' + (data.message || '未知错误'));
      }
    } catch (error) {
      setMessage('⚠️ 后端未启动，请先启动后端服务');
    } finally {
      setAiLoading(false);
    }
  };

  // ========== 保存简历 ==========
  const handleSave = async () => {
    if (!name.trim()) { setMessage('请填写姓名'); return; }
    const resumeData = {
      name, jobTitle, email, phone,
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      workExperiences: workExperiences.filter(exp => exp.company || exp.position),
      educations: educations.filter(edu => edu.school || edu.degree),
      summary
    };
    const newResume = { ...resumeData, id: Date.now(), createdAt: new Date().toLocaleString() };
    setSavedResumes([newResume, ...savedResumes]);
    setMessage('✅ 简历已保存到本地！');
    setTimeout(() => setMessage(''), 2000);
  };

  const loadResume = (resume: any) => {
    setName(resume.name || '');
    setJobTitle(resume.jobTitle || '');
    setEmail(resume.email || '');
    setPhone(resume.phone || '');
    setSkills((resume.skills || []).join(', '));
    setSummary(resume.summary || '');
    if (resume.workExperiences?.length) {
      setWorkExperiences(resume.workExperiences.map((exp: any, idx: number) => ({ ...exp, id: Date.now() + idx })));
    }
    if (resume.educations?.length) {
      setEducations(resume.educations.map((edu: any, idx: number) => ({ ...edu, id: Date.now() + idx })));
    }
    setActiveMenu('generate');
    setMessage('已加载简历，可以继续编辑');
  };

  const newResume = () => {
    setName('');
    setJobTitle('');
    setEmail('');
    setPhone('');
    setSkills('');
    setSummary('');
    setWorkExperiences([{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
    setEducations([{ id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }]);
    setAiInput('');
    setMessage('已创建新简历');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    // 最外层：相对定位容器 + 水晶背景
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* 水晶背景层 */}
      <style>{`
        @keyframes crystal-shimmer {
          0%, 100% { 
            background-position: 0% 0%, 0% 0%, 0% 0%, 50% 50%;
            background-size: 10px 10px, 10px 10px, 200% 200%, 200% 200%;
          }
          50% { 
            background-position: 1px 1px, -1px -1px, 100% 100%, 50% 50%;
            background-size: 12px 12px, 12px 12px, 200% 200%, 180% 180%;
          }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: `
            repeating-linear-gradient(
              60deg,
              transparent 0px,
              transparent 1px,
              rgba(255, 255, 255, 0.05) 1px,
              rgba(255, 255, 255, 0.05) 2px
            ),
            repeating-linear-gradient(
              -60deg,
              transparent 0px,
              transparent 1px,
              rgba(255, 255, 255, 0.05) 1px,
              rgba(255, 255, 255, 0.05) 2px
            ),
            linear-gradient(
              60deg,
              rgba(43, 108, 176, 0.4) 0%,
              rgba(72, 126, 176, 0.4) 33%,
              rgba(95, 142, 176, 0.4) 66%,
              rgba(116, 157, 176, 0.4) 100%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(255, 255, 255, 0.2) 0%,
              transparent 50%
            )
          `,
          backgroundBlendMode: "overlay, overlay, normal, screen",
          animation: "crystal-shimmer 15s ease-in-out infinite",
        }}
      />

      {/* 主要内容 - 侧边栏 + 右侧内容 */}
      <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>
        {/* ========== 左侧边栏 ========== */}
        <aside style={{
          width: '260px',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>📄 AI简历通</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>智能简历生成器</p>
          </div>

          {!isLoggedIn ? (
            <div style={{ marginBottom: '30px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px', fontSize: '14px' }}>👤 未登录</p>
              <button onClick={() => setShowLoginModal(true)} style={sidebarButtonStyle}>登录 / 注册</button>
            </div>
          ) : (
            <div style={{ marginBottom: '30px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>欢迎回来</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.7 }}>user@example.com</p>
            </div>
          )}

          <nav style={{ flex: 1 }}>
            <div onClick={() => setActiveMenu('generate')} style={{ ...menuItemStyle, background: activeMenu === 'generate' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              <span style={{ marginRight: '12px' }}>✨</span> 生成简历
            </div>
            <div onClick={() => setActiveMenu('resumes')} style={{ ...menuItemStyle, background: activeMenu === 'resumes' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              <span style={{ marginRight: '12px' }}>📋</span> 我的简历
            </div>
            <div onClick={() => setActiveMenu('profile')} style={{ ...menuItemStyle, background: activeMenu === 'profile' ? 'rgba(255,255,255,0.15)' : 'transparent' }}>
              <span style={{ marginRight: '12px' }}>👤</span> 个人资料
            </div>
          </nav>

          <button onClick={newResume} style={{ ...sidebarButtonStyle, marginTop: '20px', background: '#007bff' }}>
            + 新建简历
          </button>
        </aside>

        {/* ========== 右侧主内容区 ========== */}
        <main style={{ flex: 1, overflow: 'auto', background: 'rgba(245, 247, 250, 0.85)', padding: '24px 32px' }}>
          
          {activeMenu === 'generate' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#1a1a2e' }}>📝 生成简历</h1>
              <p style={{ color: '#666', marginBottom: '24px' }}>填写以下信息，AI 将帮你生成专业简历</p>

              <Section title="基本信息">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <input type="text" placeholder="姓名 *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="职位" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} />
                  <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  <input type="tel" placeholder="电话" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <input type="text" placeholder="技能（用逗号分隔，如：React, TypeScript, Node.js）" value={skills} onChange={e => setSkills(e.target.value)} style={inputStyle} />
              </Section>

              <Section title="🤖 AI 智能生成" highlight>
                <textarea placeholder="描述你的工作经历，AI 将生成3条专业简历要点..." value={aiInput} onChange={e => setAiInput(e.target.value)} rows={4} style={{ ...inputStyle, width: '100%' }} />
                <button onClick={handleAIGenerate} disabled={aiLoading} style={{ ...buttonStyle, marginTop: '12px' }}>
                  {aiLoading ? '生成中...' : '✨ 生成简历要点'}
                </button>
              </Section>

              <Section title="💼 工作经历">
                {workExperiences.map((exp, idx) => (
                  <div key={exp.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong>经历 {idx + 1}</strong>
                      {workExperiences.length > 1 && <button onClick={() => removeWorkExperience(exp.id)} style={smallButtonStyle}>删除</button>}
                    </div>
                    <input type="text" placeholder="公司名称" value={exp.company} onChange={e => updateWorkExperience(exp.id, 'company', e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="职位" value={exp.position} onChange={e => updateWorkExperience(exp.id, 'position', e.target.value)} style={inputStyle} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" placeholder="开始时间" value={exp.startDate} onChange={e => updateWorkExperience(exp.id, 'startDate', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <input type="text" placeholder="结束时间" value={exp.endDate} onChange={e => updateWorkExperience(exp.id, 'endDate', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                    <textarea placeholder="工作描述" value={exp.description} onChange={e => updateWorkExperience(exp.id, 'description', e.target.value)} rows={3} style={inputStyle} />
                  </div>
                ))}
                <button onClick={addWorkExperience} style={outlineButtonStyle}>+ 添加工作经历</button>
              </Section>

              <Section title="🎓 教育经历">
                {educations.map((edu, idx) => (
                  <div key={edu.id} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <strong>教育 {idx + 1}</strong>
                      {educations.length > 1 && <button onClick={() => removeEducation(edu.id)} style={smallButtonStyle}>删除</button>}
                    </div>
                    <input type="text" placeholder="学校名称" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="学位" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} style={inputStyle} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="text" placeholder="开始时间" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <input type="text" placeholder="结束时间" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  </div>
                ))}
                <button onClick={addEducation} style={outlineButtonStyle}>+ 添加教育经历</button>
              </Section>

              <Section title="📝 个人简介">
                <textarea placeholder="简要介绍自己..." value={summary} onChange={e => setSummary(e.target.value)} rows={4} style={{ ...inputStyle, width: '100%' }} />
              </Section>

              <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '40px' }}>
                <button onClick={handleSave} style={{ ...buttonStyle, backgroundColor: '#28a745', padding: '12px 32px', fontSize: '16px' }}>
                  💾 保存简历
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'resumes' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#1a1a2e' }}>📋 我的简历</h1>
              <p style={{ color: '#666', marginBottom: '24px' }}>共 {savedResumes.length} 份简历</p>
              {savedResumes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' }}>
                  <p style={{ fontSize: '18px', color: '#999' }}>暂无简历，快去生成一份吧</p>
                  <button onClick={() => setActiveMenu('generate')} style={buttonStyle}>开始创建</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {savedResumes.map((resume) => (
                    <div key={resume.id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px' }}>{resume.name || '未命名'}</h3>
                          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{resume.jobTitle || '暂无职位'} | 创建于 {resume.createdAt}</p>
                        </div>
                        <button onClick={() => loadResume(resume)} style={{ ...buttonStyle, padding: '6px 16px', fontSize: '14px' }}>编辑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'profile' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '28px', marginBottom: '24px', color: '#1a1a2e' }}>👤 个人资料</h1>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                  登录功能正在开发中...<br />
                  目前简历数据保存在本地浏览器中
                </p>
                {isLoggedIn && (
                  <button onClick={() => setIsLoggedIn(false)} style={{ ...buttonStyle, backgroundColor: '#dc3545', width: '100%' }}>退出登录</button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div style={modalOverlayStyle} onClick={() => setShowLoginModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>登录 / 注册</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>演示模式，点击下方按钮即可体验</p>
            <button onClick={() => { setIsLoggedIn(true); setShowLoginModal(false); setMessage('登录成功！'); setTimeout(() => setMessage(''), 2000); }} style={{ ...buttonStyle, width: '100%' }}>
              继续体验
            </button>
            <button onClick={() => setShowLoginModal(false)} style={{ ...outlineButtonStyle, width: '100%', marginTop: '12px' }}>取消</button>
          </div>
        </div>
      )}

      {message && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 20px', background: message.includes('成功') || message.includes('✅') ? '#28a745' : '#dc3545', color: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          {message}
        </div>
      )}
    </div>
  );
}

// ========== 辅助组件 ==========
const Section: React.FC<{ title: string; children: React.ReactNode; highlight?: boolean }> = ({ title, children, highlight }) => (
  <div style={{ marginBottom: '32px', background: highlight ? '#fff8e7' : '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <h3 style={{ marginBottom: '16px', fontSize: '18px', color: '#333' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>
  </div>
);

// ========== 样式 ==========
const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const outlineButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: 'transparent',
  color: '#007bff',
  border: '1px solid #007bff',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
};

const smallButtonStyle: React.CSSProperties = {
  padding: '4px 12px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px'
};

const sidebarButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '12px',
  cursor: 'pointer',
  marginBottom: '8px',
  transition: 'background 0.2s'
};

const cardStyle: React.CSSProperties = {
  background: '#f9f9f9',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '32px',
  width: '400px',
  maxWidth: '90%'
};

export default App;