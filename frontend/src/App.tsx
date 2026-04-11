import React, { useState, useEffect } from 'react';

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

interface Resume {
  id: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  skills: string[];
  workExperiences: WorkExperience[];
  educations: Education[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

type MenuItem = 'resumes' | 'profile';
type View = 'home' | 'editor';

// ========== 主组件 ==========
function App() {
  // 页面状态
  const [activeMenu, setActiveMenu] = useState<MenuItem>('resumes');
  const [currentView, setCurrentView] = useState<View>('home');
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  
  // 用户状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [username, setUsername] = useState('');
  
  // 简历数据
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);

  // 编辑页面的表单数据
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

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ========== 检查登录状态 ==========
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
      fetchResumes();
    }
  }, []);

  // ========== 从后端加载简历列表 ==========
  const fetchResumes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setResumes(data.data.list);
      }
    } catch (error) {
      console.error('加载简历失败', error);
    } finally {
      setLoading(false);
    }
  };

  // ========== 新建简历 ==========
  const createNewResume = () => {
    setName('');
    setJobTitle('');
    setEmail('');
    setPhone('');
    setSkills('');
    setSummary('');
    setWorkExperiences([{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
    setEducations([{ id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }]);
    setAiInput('');
    setEditingResumeId(null);
    setCurrentView('editor');
  };

  // ========== 编辑简历 ==========
  const editResume = (resume: Resume) => {
    setName(resume.name || '');
    setJobTitle(resume.jobTitle || '');
    setEmail(resume.email || '');
    setPhone(resume.phone || '');
    setSkills((resume.skills || []).join(', '));
    setSummary(resume.summary || '');
    
    if (resume.workExperiences && resume.workExperiences.length > 0) {
      setWorkExperiences(resume.workExperiences);
    } else {
      setWorkExperiences([{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
    }
    
    if (resume.educations && resume.educations.length > 0) {
      setEducations(resume.educations);
    } else {
      setEducations([{ id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }]);
    }
    
    setEditingResumeId(resume.id);
    setCurrentView('editor');
  };

  // ========== 保存当前编辑的简历 ==========
  const handleSaveResume = async () => {
    if (!name.trim()) {
      setMessage('请填写姓名');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('请先登录');
      setShowLoginModal(true);
      return;
    }

    const resumeData = {
      name,
      jobTitle,
      email,
      phone,
      skills: skills.split(',').map(s => s.trim()).filter(s => s),
      workExperiences: workExperiences.filter(exp => exp.company || exp.position),
      educations: educations.filter(edu => edu.school || edu.degree),
      summary
    };

    setLoading(true);
    try {
      const url = editingResumeId 
        ? `http://localhost:5000/api/resume/${editingResumeId}`
        : 'http://localhost:5000/api/resume';
      
      const method = editingResumeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });
      const data = await res.json();

      if (data.code === 200) {
        setMessage(editingResumeId ? '简历更新成功！' : '简历保存成功！');
        await fetchResumes();
        setCurrentView('home');
      } else {
        setMessage('保存失败：' + data.message);
      }
    } catch (error) {
      setMessage('保存失败：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ========== 删除简历 ==========
  const deleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这份简历吗？')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/resume/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.code === 200) {
        setMessage('删除成功');
        await fetchResumes();
      } else {
        setMessage('删除失败：' + data.message);
      }
    } catch (error) {
      setMessage('删除失败：' + (error as Error).message);
    }
  };

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

  // ========== 登录处理 ==========
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const inputUsername = formData.get('username') as string;
    const inputPassword = formData.get('password') as string;

    try {
      const res = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword })
      });
      const data = await res.json();

      if (data.code === 200) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('username', inputUsername);
        setIsLoggedIn(true);
        setUsername(inputUsername);
        setShowLoginModal(false);
        setMessage(`欢迎回来，${inputUsername}！`);
        await fetchResumes();
      } else {
        setMessage('登录失败：' + data.message);
      }
    } catch (error) {
      setMessage('登录失败，请检查后端是否启动');
    }
  };

  // ========== 注册处理 ==========
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const inputUsername = formData.get('username') as string;
    const inputPassword = formData.get('password') as string;
    const inputEmail = formData.get('email') as string;

    try {
      const res = await fetch('http://localhost:5000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUsername, password: inputPassword, email: inputEmail })
      });
      const data = await res.json();

      if (data.code === 200 || data.code === 201) {
        setMessage('注册成功，请登录');
        setShowRegisterModal(false);
        setShowLoginModal(true);
      } else {
        setMessage('注册失败：' + data.message);
      }
    } catch (error) {
      setMessage('注册失败，请检查后端是否启动');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setResumes([]);
    setMessage('已退出登录');
    setTimeout(() => setMessage(''), 2000);
  };

  // ========== 首页：简历卡片列表 ==========
  const HomeView = () => (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'normal' }}>
          {activeMenu === 'resumes' ? '📋 我的简历' : '👤 个人资料'}
        </h2>
      </div>

      {activeMenu === 'resumes' && (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>加载中...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {/* 新建简历卡片 */}
              <div onClick={createNewResume} style={newCardStyle}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>新建简历</div>
                <div style={{ fontSize: '14px', color: '#888' }}>点击创建一份新的简历</div>
              </div>

              {/* 已有简历卡片 */}
              {resumes.map((resume) => (
                <div key={resume.id} onClick={() => editResume(resume)} style={cardItemStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '32px' }}>📄</div>
                    <button onClick={(e) => deleteResume(resume.id, e)} style={deleteIconStyle}>🗑️</button>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {resume.name || '未命名'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {resume.jobTitle || '暂无职位'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
                    更新于 {new Date(resume.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeMenu === 'profile' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '24px' }}>个人资料</h3>
          {isLoggedIn ? (
            <div>
              <p><strong>用户名：</strong> {username}</p>
              <p><strong>邮箱：</strong> {email || '未设置'}</p>
              <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc3545', marginTop: '20px' }}>退出登录</button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#666', marginBottom: '20px' }}>请先登录</p>
              <button onClick={() => setShowLoginModal(true)} style={buttonStyle}>去登录</button>
            </div>
          )}
        </div>
      )}

      {resumes.length === 0 && activeMenu === 'resumes' && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <p>暂无简历，点击"新建简历"开始创建</p>
        </div>
      )}
    </div>
  );

  // ========== 编辑页面 ==========
  const EditorView = () => (
    <div style={{ padding: '24px', overflow: 'auto', height: 'calc(100vh - 70px)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => { setCurrentView('home'); setActiveMenu('resumes'); }} style={backButtonStyle}>
            ← 返回首页
          </button>
          <h2 style={{ margin: 0 }}>{editingResumeId ? '编辑简历' : '新建简历'}</h2>
        </div>

        {/* 基本信息 */}
        <Section title="基本信息">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input type="text" placeholder="姓名 *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="职位" value={jobTitle} onChange={e => setJobTitle(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input type="tel" placeholder="电话" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </div>
          <input type="text" placeholder="技能（用逗号分隔，如：React, TypeScript, Node.js）" value={skills} onChange={e => setSkills(e.target.value)} style={inputStyle} />
        </Section>

        {/* AI 生成区 */}
        <Section title="🤖 AI 智能生成" highlight>
          <textarea placeholder="描述你的工作经历，AI 将生成3条专业简历要点..." value={aiInput} onChange={e => setAiInput(e.target.value)} rows={4} style={{ ...inputStyle, width: '100%' }} />
          <button onClick={handleAIGenerate} disabled={aiLoading} style={{ ...buttonStyle, marginTop: '12px' }}>
            {aiLoading ? '生成中...' : '✨ 生成简历要点'}
          </button>
        </Section>

        {/* 工作经历 */}
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

        {/* 教育经历 */}
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

        {/* 个人简介 */}
        <Section title="📝 个人简介">
          <textarea placeholder="简要介绍自己..." value={summary} onChange={e => setSummary(e.target.value)} rows={4} style={{ ...inputStyle, width: '100%' }} />
        </Section>

        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '40px' }}>
          <button onClick={handleSaveResume} disabled={loading} style={{ ...buttonStyle, backgroundColor: '#28a745', padding: '12px 32px', fontSize: '16px' }}>
            {loading ? '保存中...' : '💾 保存简历'}
          </button>
        </div>
      </div>
    </div>
  );

  // ========== 主渲染 ==========
  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* 水晶背景 */}
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
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: `
          repeating-linear-gradient(60deg, transparent 0px, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px),
          repeating-linear-gradient(-60deg, transparent 0px, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px),
          linear-gradient(60deg, rgba(43,108,176,0.4) 0%, rgba(72,126,176,0.4) 33%, rgba(95,142,176,0.4) 66%, rgba(116,157,176,0.4) 100%),
          radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)
        `,
        backgroundBlendMode: "overlay, overlay, normal, screen",
        animation: "crystal-shimmer 15s ease-in-out infinite",
      }} />

      {/* 主内容区 */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* 顶部栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.95)',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📄</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>AI简历通</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>{username}</span>
                <div
                  onClick={() => setShowLoginModal(true)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#007bff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {username.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                style={{
                  padding: '8px 16px',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>

        {/* 主体：侧边栏 + 内容区 */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧边栏 */}
          <aside style={{
            width: '200px',
            background: 'rgba(26, 26, 46, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 0'
          }}>
            <nav>
              <div
                onClick={() => { setActiveMenu('resumes'); setCurrentView('home'); }}
                style={{ ...menuItemStyle, background: activeMenu === 'resumes' && currentView === 'home' ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              >
                <span style={{ marginRight: '12px' }}>📋</span> 我的简历
              </div>
              <div
                onClick={() => { setActiveMenu('profile'); setCurrentView('home'); }}
                style={{ ...menuItemStyle, background: activeMenu === 'profile' && currentView === 'home' ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              >
                <span style={{ marginRight: '12px' }}>👤</span> 个人资料
              </div>
            </nav>
          </aside>

          {/* 右侧内容区 */}
          <main style={{ flex: 1, overflow: 'auto', background: 'rgba(245, 247, 250, 0.6)' }}>
            {currentView === 'home' ? <HomeView /> : <EditorView />}
          </main>
        </div>
      </div>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div style={modalOverlayStyle} onClick={() => setShowLoginModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>登录</h2>
            <form onSubmit={handleLogin}>
              <input type="text" name="username" placeholder="用户名" style={{ ...inputStyle, marginBottom: '12px' }} required />
              <input type="password" name="password" placeholder="密码" style={{ ...inputStyle, marginBottom: '20px' }} required />
              <button type="submit" style={{ ...buttonStyle, width: '100%' }}>登录</button>
            </form>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', textAlign: 'center' }}>
              还没有账号？{' '}
              <span onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} style={{ color: '#007bff', cursor: 'pointer' }}>
                立即注册
              </span>
            </p>
            <button onClick={() => setShowLoginModal(false)} style={{ ...outlineButtonStyle, width: '100%', marginTop: '12px' }}>取消</button>
          </div>
        </div>
      )}

      {/* 注册弹窗 */}
      {showRegisterModal && (
        <div style={modalOverlayStyle} onClick={() => setShowRegisterModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>注册</h2>
            <form onSubmit={handleRegister}>
              <input type="text" name="username" placeholder="用户名" style={{ ...inputStyle, marginBottom: '12px' }} required />
              <input type="email" name="email" placeholder="邮箱" style={{ ...inputStyle, marginBottom: '12px' }} required />
              <input type="password" name="password" placeholder="密码" style={{ ...inputStyle, marginBottom: '20px' }} required />
              <button type="submit" style={{ ...buttonStyle, width: '100%' }}>注册</button>
            </form>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', textAlign: 'center' }}>
              已有账号？{' '}
              <span onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} style={{ color: '#007bff', cursor: 'pointer' }}>
                去登录
              </span>
            </p>
            <button onClick={() => setShowRegisterModal(false)} style={{ ...outlineButtonStyle, width: '100%', marginTop: '12px' }}>取消</button>
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: message.includes('成功') || message.includes('欢迎') || message.includes('✅') ? '#28a745' : '#dc3545',
          color: '#fff',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

// ========== 样式组件 ==========
const Section: React.FC<{ title: string; children: React.ReactNode; highlight?: boolean }> = ({ title, children, highlight }) => (
  <div style={{ marginBottom: '32px', background: highlight ? '#fff8e7' : '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <h3 style={{ marginBottom: '16px', fontSize: '18px', color: '#333' }}>{title}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>
  </div>
);

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box'
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

const backButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#f0f0f0',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px'
};

const cardStyle: React.CSSProperties = {
  background: '#f9f9f9',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px'
};

const newCardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  border: '2px dashed #ccc'
};

const cardItemStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '20px',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

const deleteIconStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '4px',
  opacity: 0.6
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 20px',
  cursor: 'pointer',
  marginBottom: '8px',
  transition: 'background 0.2s'
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