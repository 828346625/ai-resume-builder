import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// 类型定义
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

const DEMO_USER = {
  name: '王小明',
  email: 'xiaoming.wang@example.com',
  avatar: 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name=王小明',
};

// ========== 登录模态框组件 ==========
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (e: React.FormEvent) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  email,
  setEmail,
  password,
  setPassword,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center mb-6">登录</h2>
        <form onSubmit={onLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
            登录
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">演示账号：任意邮箱 + 任意密码</p>
      </div>
    </div>
  );
};

// ========== 简历编辑组件（移到外部避免焦点丢失） ==========
interface EditorViewProps {
  name: string;
  setName: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  skills: string;
  setSkills: (value: string) => void;
  summary: string;
  setSummary: (value: string) => void;
  generatedSummary: string;
  setGeneratedSummary: (value: string) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  workExperiences: WorkExperience[];
  setWorkExperiences: React.Dispatch<React.SetStateAction<WorkExperience[]>>;
  educations: Education[];
  setEducations: React.Dispatch<React.SetStateAction<Education[]>>;
  nameError: string;
  setNameError: (value: string) => void;
  emailError: string;
  setEmailError: (value: string) => void;
  phoneError: string;
  setPhoneError: (value: string) => void;
  onAIGenerate: () => void;
  onSave: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({
  name,
  setName,
  jobTitle,
  setJobTitle,
  email,
  setEmail,
  phone,
  setPhone,
  skills,
  setSkills,
  summary,
  setSummary,
  generatedSummary,
  setGeneratedSummary,
  isGenerating,
  setIsGenerating,
  workExperiences,
  setWorkExperiences,
  educations,
  setEducations,
  nameError,
  setNameError,
  emailError,
  setEmailError,
  phoneError,
  setPhoneError,
  onAIGenerate,
  onSave,
}) => {
  // 工作经历操作
  const addWork = () => {
    setWorkExperiences([
      ...workExperiences,
      { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' },
    ]);
  };
  const updateWork = (id: number, field: keyof WorkExperience, value: string) => {
    setWorkExperiences(workExperiences.map(w => (w.id === id ? { ...w, [field]: value } : w)));
  };
  const removeWork = (id: number) => setWorkExperiences(workExperiences.filter(w => w.id !== id));

  // 教育经历操作
  const addEdu = () => {
    setEducations([...educations, { id: Date.now(), school: '', degree: '', startDate: '', endDate: '' }]);
  };
  const updateEdu = (id: number, field: keyof Education, value: string) => {
    setEducations(educations.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const removeEdu = (id: number) => setEducations(educations.filter(e => e.id !== id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 基本信息 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">基本信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              className="border rounded-lg p-2 w-full"
              placeholder="姓名（必填，2-20个字符）"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.trim().length < 2 || e.target.value.trim().length > 20) {
                  setNameError('姓名长度应为2-20个字符');
                } else {
                  setNameError('');
                }
              }}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>
          <input
            className="border rounded-lg p-2"
            placeholder="职位（如：前端开发工程师）"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />
          <div>
            <input
              type="email"
              className="border rounded-lg p-2 w-full"
              placeholder="邮箱（例如：name@example.com）"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(e.target.value)) {
                  setEmailError('请输入正确的邮箱格式');
                } else {
                  setEmailError('');
                }
              }}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <input
              type="tel"
              pattern="1[3-9]\d{9}"
              title="请输入11位手机号"
              className="border rounded-lg p-2 w-full"
              placeholder="手机号（11位数字）"
              value={phone}
              onChange={e => {
                const val = e.target.value;
                setPhone(val);
                const phoneRegex = /^1[3-9]\d{9}$/;
                if (!phoneRegex.test(val)) {
                  setPhoneError('请输入11位手机号');
                } else {
                  setPhoneError('');
                }
              }}
            />
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">技能（逗号分隔）</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="React, TypeScript, Node.js"
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
        </div>
      </div>

      {/* AI 智能生成 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-2">🤖 AI 智能生成</h3>
        <p className="text-sm text-gray-500 mb-3">
          填写工作经历描述，AI 将为你生成专业简历介绍（基于第一条工作经历）
        </p>
        <textarea
          rows={4}
          className="w-full border rounded-lg p-3 mb-3"
          placeholder="例如：在某某公司负责前端开发，主导了三个大型项目，用户量增长50%..."
          value={workExperiences[0]?.description || ''}
          onChange={e => {
            if (workExperiences.length > 0) {
              updateWork(workExperiences[0].id, 'description', e.target.value);
            }
          }}
        />
        <button
          onClick={onAIGenerate}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : '✨ 生成简历介绍'}
        </button>
        {generatedSummary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="whitespace-pre-wrap text-gray-700">{generatedSummary}</p>
          </div>
        )}
      </div>

      {/* 工作经历 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">💼 工作经历</h3>
          <button onClick={addWork} className="text-blue-600 text-sm">
            + 添加
          </button>
        </div>
        {workExperiences.length === 0 && (
          <div className="text-gray-400 text-sm mb-2">暂无工作经历，点击右上方按钮添加</div>
        )}
        {workExperiences.map((exp, idx) => (
          <div key={exp.id} className="border-t pt-4 mt-4 first:border-0 first:pt-0">
            <div className="flex justify-between mb-2">
              <span className="font-medium">经历 {idx + 1}</span>
              {workExperiences.length > 1 && (
                <button onClick={() => removeWork(exp.id)} className="text-red-500 text-sm">
                  删除
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded p-2"
                placeholder="公司名称"
                value={exp.company}
                onChange={e => updateWork(exp.id, 'company', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="职位"
                value={exp.position}
                onChange={e => updateWork(exp.id, 'position', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="开始时间（如：2020-01）"
                value={exp.startDate}
                onChange={e => updateWork(exp.id, 'startDate', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="结束时间（如：2023-12）"
                value={exp.endDate}
                onChange={e => updateWork(exp.id, 'endDate', e.target.value)}
              />
            </div>
            <textarea
              className="w-full border rounded p-2 mt-3"
              rows={2}
              placeholder="工作描述"
              value={exp.description}
              onChange={e => updateWork(exp.id, 'description', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* 教育经历 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">🎓 教育经历</h3>
          <button onClick={addEdu} className="text-blue-600 text-sm">
            + 添加
          </button>
        </div>
        {educations.length === 0 && (
          <div className="text-gray-400 text-sm mb-2">暂无教育背景，点击上方按钮添加</div>
        )}
        {educations.map((edu, idx) => (
          <div key={edu.id} className="border-t pt-4 mt-4 first:border-0 first:pt-0">
            <div className="flex justify-between mb-2">
              <span className="font-medium">教育 {idx + 1}</span>
              {educations.length > 1 && (
                <button onClick={() => removeEdu(edu.id)} className="text-red-500 text-sm">
                  删除
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border rounded p-2"
                placeholder="学校名称"
                value={edu.school}
                onChange={e => updateEdu(edu.id, 'school', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="学位（如：本科）"
                value={edu.degree}
                onChange={e => updateEdu(edu.id, 'degree', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="开始时间"
                value={edu.startDate}
                onChange={e => updateEdu(edu.id, 'startDate', e.target.value)}
              />
              <input
                className="border rounded p-2"
                placeholder="结束时间"
                value={edu.endDate}
                onChange={e => updateEdu(edu.id, 'endDate', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg">
          保存简历
        </button>
      </div>
    </div>
  );
};

// ========== 简历预览组件 ==========
interface PreviewViewProps {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  summary: string;
  generatedSummary: string;
  skills: string;
  onBack: () => void;
}

const PreviewView: React.FC<PreviewViewProps> = ({
  name,
  jobTitle,
  email,
  phone,
  summary,
  generatedSummary,
  skills,
  onBack,
}) => {
  const displaySummary = summary || generatedSummary || '暂无介绍，请先在编辑页生成 AI 内容。';
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition mr-4"
        >
          ← 返回编辑
        </button>
        <h2 className="text-2xl font-bold">简历预览</h2>
      </div>
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold">{name || '姓名'}</h1>
        <p className="text-gray-600 mt-1">{jobTitle || '职位'}</p>
        <div className="flex justify-center gap-4 mt-3 text-sm text-gray-500">
          <span>{email}</span>
          <span>{phone}</span>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-600 border-l-4 border-blue-600 pl-3">个人简介</h3>
        <p className="mt-2 text-gray-700 whitespace-pre-wrap">{displaySummary}</p>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-600 border-l-4 border-blue-600 pl-3">技能</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.split(',').map((s, i) => s.trim() && <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{s.trim()}</span>)}
        </div>
      </div>
    </div>
  );
};

// ========== 账号设置组件 ==========
interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition mr-4"
        >
          ← 返回
        </button>
        <h2 className="text-xl font-bold">账号设置</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">用户名</label>
          <input className="w-full border rounded-lg p-2" defaultValue={DEMO_USER.name} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input className="w-full border rounded-lg p-2" defaultValue={DEMO_USER.email} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">新密码</label>
          <input type="password" className="w-full border rounded-lg p-2" placeholder="留空则不修改" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">保存修改</button>
      </div>
    </div>
  );
};

// ========== 主应用 ==========
function App() {
  // 全局状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 简历表单状态
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [summary, setSummary] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  // 初始化一条空工作经历，保证 AI 生成区的 textarea 可输入
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' },
  ]);
  const [educations, setEducations] = useState<Education[]>([]);

  // 校验错误信息
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // 模拟登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('请输入邮箱和密码');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      
      if (data.code === 200) {
        localStorage.setItem('token', data.data.token);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setLoginError('');
        setActiveMenu('resume');
        // 清空之前的数据
        setSkills('');
        setEmail(loginEmail);
        setGeneratedSummary('');
        setName('');
        setJobTitle('');
        setPhone('');
        setSummary('');
        setWorkExperiences([{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
        setEducations([]);
        setNameError('');
        setEmailError('');
        setPhoneError('');
      } else {
        setLoginError(data.message || '登录失败');
      }
    } catch (error) {
      setLoginError('网络错误，请重试');
    }
  };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setActiveMenu('home');
    setName('');
    setJobTitle('');
    setEmail('');
    setPhone('');
    setSkills('');
    setSummary('');
    setGeneratedSummary('');
    setWorkExperiences([{ id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]);
    setEducations([]);
    setNameError('');
    setEmailError('');
    setPhoneError('');
  };

  const openSettings = () => {
    setActiveMenu('settings');
    setIsUserMenuOpen(false);
  };

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // AI 生成
  const handleAIGenerate = async () => {
    const firstExp = workExperiences[0];
    const workDesc = firstExp?.description?.trim();
    if (!workDesc) {
      alert('请在工作经历中填写至少一段工作描述（第一条经历）');
      return;
    }
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/resume/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ experience: workDesc, skills: skills.split(',').map(s => s.trim()) }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedSummary(data.data.summary);
        setSummary(data.data.summary);
      } else {
        setGeneratedSummary('生成失败，请稍后重试');
      }
    } catch (error) {
      // 模拟生成
      setTimeout(() => {
        const mock = `基于您的工作经历（${workDesc.slice(0, 60)}...），我们为您生成了专业的自我评价：\n\n具有扎实的前端开发能力，善于团队协作，能够独立负责项目模块。`;
        setGeneratedSummary(mock);
        setSummary(mock);
        setIsGenerating(false);
      }, 1000);
      return;
    }
    setIsGenerating(false);
  };

  // 保存简历（带校验）
  const handleSave = async () => {
    let hasError = false;
    if (name.trim().length < 2 || name.trim().length > 20) {
      setNameError('姓名长度应为2-20个字符');
      hasError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('请输入正确的邮箱格式');
      hasError = true;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('请输入11位手机号');
      hasError = true;
    }
    if (hasError) {
      alert('请修正表单中的错误');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          jobTitle,
          email,
          phone,
          skills: skills.split(',').map(s => s.trim()).filter(s => s),
          workExperiences,
          educations,
          summary
        })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('简历保存成功！');
      } else {
        alert('保存失败：' + data.message);
      }
    } catch (error) {
      alert('网络错误，请重试');
    }
  };
    alert('简历已保存（演示模式）');
  };

  // 首页组件
  const HomePage = () => (
    <div className="max-w-5xl mx-auto text-center py-16 px-4">
      <div className="mb-8">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">AI 简历构建器</h1>
        <p className="text-xl text-gray-600 mb-8">智能生成专业简历，助你拿下心仪 Offer</p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition"
        >
          立即开始
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="text-xl font-semibold mb-2">AI 智能生成</h3>
          <p className="text-gray-600">输入工作经历，AI 自动撰写专业描述</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-xl font-semibold mb-2">多份简历管理</h3>
          <p className="text-gray-600">轻松创建和管理多份不同岗位的简历</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm">
          <div className="text-3xl mb-3">📄</div>
          <h3 className="text-xl font-semibold mb-2">PDF 导出</h3>
          <p className="text-gray-600">一键导出专业排版简历</p>
        </div>
      </div>
    </div>
  );

  // 侧边栏
  const Sidebar = () => (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-5 border-b">
        <h1 className="text-xl font-bold text-blue-600">📄 AI简历</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {isLoggedIn ? (
          <>
            <button
              onClick={() => setActiveMenu('resume')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                activeMenu === 'resume' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>✏️</span> 简历编辑
            </button>
            <button
              onClick={() => setActiveMenu('preview')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                activeMenu === 'preview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>👁️</span> 预览简历
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <span>🔐</span> 登录 / 注册
          </button>
        )}
      </nav>
    </aside>
  );

  // 用户区域
  const UserArea = () => {
    if (!isLoggedIn) {
      return (
        <button onClick={() => setShowLoginModal(true)} className="text-gray-700 hover:text-blue-600 font-medium">
          登录 / 注册
        </button>
      );
    }
    return (
      <div className="relative" ref={userMenuRef}>
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg transition p-1"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <img src={DEMO_USER.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">{DEMO_USER.name}</span>
        </div>
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <button
              onClick={openSettings}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
            >
              <span>⚙️</span> 账号设置
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition flex items-center gap-2"
            >
              <span>🚪</span> 退出登录
            </button>
          </div>
        )}
      </div>
    );
  };

  // 主渲染
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-3 flex justify-end items-center gap-4">
          <UserArea />
        </header>
        <main className="flex-1 overflow-auto p-6">
          {!isLoggedIn ? (
            <HomePage />
          ) : (
            <>
              {activeMenu === 'resume' && (
                <EditorView
                  name={name}
                  setName={setName}
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  skills={skills}
                  setSkills={setSkills}
                  summary={summary}
                  setSummary={setSummary}
                  generatedSummary={generatedSummary}
                  setGeneratedSummary={setGeneratedSummary}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  workExperiences={workExperiences}
                  setWorkExperiences={setWorkExperiences}
                  educations={educations}
                  setEducations={setEducations}
                  nameError={nameError}
                  setNameError={setNameError}
                  emailError={emailError}
                  setEmailError={setEmailError}
                  phoneError={phoneError}
                  setPhoneError={setPhoneError}
                  onAIGenerate={handleAIGenerate}
                  onSave={handleSave}
                />
              )}
              {activeMenu === 'preview' && (
                <PreviewView
                  name={name}
                  jobTitle={jobTitle}
                  email={email}
                  phone={phone}
                  summary={summary}
                  generatedSummary={generatedSummary}
                  skills={skills}
                  onBack={() => setActiveMenu('resume')}
                />
              )}
              {activeMenu === 'settings' && <SettingsView onBack={() => setActiveMenu('resume')} />}
            </>
          )}
        </main>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        email={loginEmail}
        setEmail={setLoginEmail}
        password={loginPassword}
        setPassword={setLoginPassword}
        error={loginError}
      />
    </div>
  );
}

export default App;