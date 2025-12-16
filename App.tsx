import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Lock, Loader2, WifiOff } from 'lucide-react';
import { StudentView } from './components/StudentView';
import { TeacherView } from './components/TeacherView';
import { DEFAULT_CONFIG, API_URL } from './constants';
import { AppConfig, Student, ViewMode } from './types';

function App() {
  const [view, setView] = useState<ViewMode>('STUDENT');
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Login State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Fetch Data Function
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      if (data.config) {
        setConfig(prev => ({ ...prev, ...data.config }));
      }
      
      if (data.students && Array.isArray(data.students)) {
        setStudents(data.students);
      }
      
      setError('');
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on Mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2521') {
      setView('TEACHER');
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const renderHeader = () => (
    <header className="text-center py-8 px-4 space-y-2 relative">
       {/* Teacher Toggle Button */}
       {view === 'STUDENT' && !isLoading && !error && (
        <button 
            onClick={() => setView('LOGIN')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors opacity-50 hover:opacity-100"
            title="สำหรับครูผู้สอน"
        >
            <Settings className="w-5 h-5" />
        </button>
      )}

      <div className="flex justify-center mb-4">
        <img 
            src={config.logoUrl} 
            alt="School Logo" 
            className="h-24 object-contain drop-shadow-md transition-all hover:scale-105 duration-500" 
            onError={(e) => e.currentTarget.style.display = 'none'}
        />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">{config.headerTitle}</h1>
      <h2 className="text-xl sm:text-2xl font-semibold text-blue-700">{config.headerSubtitle}</h2>
      <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px bg-blue-200 w-12"></div>
          <h3 className="text-md sm:text-lg text-gray-600 font-medium">{config.examName}</h3>
          <div className="h-px bg-blue-200 w-12"></div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-blue-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <WifiOff className="w-16 h-16 mb-4 text-red-400" />
          <p className="text-lg font-medium text-gray-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            โหลดซ้ำ
          </button>
        </div>
      );
    }

    switch (view) {
      case 'LOGIN':
        return (
          <div className="max-w-xs mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
             <div className="text-center mb-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                    <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">เข้าสู่ระบบครูผู้สอน</h3>
             </div>
             <form onSubmit={handleLogin}>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                    autoFocus
                />
                <button 
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    ยืนยัน
                </button>
                {loginError && <p className="text-red-500 text-xs text-center mt-2">{loginError}</p>}
                <button 
                    type="button"
                    onClick={() => { setView('STUDENT'); setLoginError(''); }}
                    className="w-full mt-2 text-gray-400 text-sm hover:text-gray-600"
                >
                    ย้อนกลับ
                </button>
             </form>
          </div>
        );
      case 'TEACHER':
        return (
          <TeacherView 
            students={students} 
            config={config} 
            onUpdateConfig={setConfig}
            onLogout={() => setView('STUDENT')}
            onRefresh={fetchData}
          />
        );
      case 'STUDENT':
      default:
        return <StudentView students={students} config={config} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="container mx-auto pb-12">
        {renderHeader()}
        <main>
          {renderContent()}
        </main>
      </div>
      <footer className="text-center py-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} ScoreQuest - ระบบประกาศคะแนนสอบออนไลน์ By Kru Sawitree Mitreepan
      </footer>
    </div>
  );
}

export default App;