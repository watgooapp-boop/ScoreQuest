import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  BarChart3, 
  LogOut, 
  Save, 
  ArrowDown01, 
  ArrowUp01,
  Filter,
  Users,
  Loader2,
  RefreshCw,
  Trophy,
  Calculator // Added Calculator icon
} from 'lucide-react';
import { Student, AppConfig } from '../types';
import { getStatus, API_URL } from '../constants';

interface TeacherViewProps {
  students: Student[];
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ students, config, onUpdateConfig, onLogout, onRefresh }) => {
  // Added 'average' to activeTab state
  const [activeTab, setActiveTab] = useState<'report' | 'settings' | 'topone' | 'average'>('report');
  
  // Report State
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: 'number' | 'score'; direction: 'asc' | 'desc' }>({ key: 'number', direction: 'asc' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings State
  const [tempConfig, setTempConfig] = useState<AppConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Derived Data
  const rooms = useMemo(() => Array.from(new Set(students.map(s => s.room))).sort(), [students]);

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];
    
    if (selectedRoom !== 'all') {
      result = result.filter(s => s.room === selectedRoom);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'score') {
        comparison = a.score - b.score;
      } else {
        comparison = a.number - b.number;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, selectedRoom, sortConfig]);

  // Logic for Top One Tab
  const topStudentsByRoom = useMemo(() => {
    const result: { room: string; students: Student[]; score: number }[] = [];
    
    rooms.forEach(room => {
      const roomStudents = students.filter(s => s.room === room);
      if (roomStudents.length === 0) return;

      const maxScore = Math.max(...roomStudents.map(s => s.score));
      const topStudents = roomStudents.filter(s => s.score === maxScore);
      
      topStudents.sort((a, b) => a.number - b.number);

      result.push({
        room,
        students: topStudents,
        score: maxScore
      });
    });

    return result;
  }, [students, rooms]);

  // Logic for Average Tab
  const roomStats = useMemo(() => {
    const result: { room: string; avg: number; count: number; max: number; min: number }[] = [];
    let totalScoreAll = 0;
    let totalStudentAll = 0;

    rooms.forEach(room => {
      const roomStudents = students.filter(s => s.room === room);
      if (roomStudents.length === 0) return;

      const totalScore = roomStudents.reduce((sum, s) => sum + s.score, 0);
      const avg = totalScore / roomStudents.length;
      
      totalScoreAll += totalScore;
      totalStudentAll += roomStudents.length;

      result.push({
        room,
        avg: parseFloat(avg.toFixed(2)),
        count: roomStudents.length,
        max: Math.max(...roomStudents.map(s => s.score)),
        min: Math.min(...roomStudents.map(s => s.score))
      });
    });

    const overallAvg = totalStudentAll > 0 ? parseFloat((totalScoreAll / totalStudentAll).toFixed(2)) : 0;

    return { roomData: result, overallAvg, totalStudents: totalStudentAll };
  }, [students, rooms]);

  const handleSort = (key: 'number' | 'score') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveStatus('idle');

    try {
      // 1. Send data to Google Sheet
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'updateConfig',
          config: tempConfig
        })
      });

      if (!response.ok) throw new Error('API Error');

      // 2. Update Local State
      onUpdateConfig(tempConfig);
      
      setSaveStatus('success');
      setSaveMessage('บันทึกการตั้งค่าลง Google Sheet เรียบร้อยแล้ว');
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
          setSaveMessage('');
          setSaveStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8">
      {/* Header / Nav */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                <Settings className="w-6 h-6" />
            </div>
            <div>
                <h2 className="font-bold text-lg text-gray-800">ระบบจัดการสำหรับครู</h2>
                <p className="text-xs text-gray-500">Teacher Dashboard</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                รายงานผล
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('topone')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'topone' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Top One
            </div>
          </button>

          {/* New Average Tab Button */}
          <button
            onClick={() => setActiveTab('average')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'average' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                ค่าเฉลี่ย
            </div>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
             <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                ตั้งค่าระบบ
            </div>
          </button>
        </div>

        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="ออกจากระบบ">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-lg min-h-[500px] overflow-hidden">
        
        {activeTab === 'report' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end md:items-center justify-between">
                <div className="flex flex-col gap-1 w-full md:w-auto">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> เลือกห้องเรียน
                    </label>
                    <select 
                        value={selectedRoom} 
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="all">ทุกห้องเรียน ({students.length} คน)</option>
                        {rooms.map(r => (
                            <option key={r} value={r}>ห้อง {r} ({students.filter(s => s.room === r).length} คน)</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex gap-2">
                   <button 
                     onClick={handleRefresh}
                     disabled={isRefreshing}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ${isRefreshing ? 'opacity-70 cursor-wait' : ''}`}
                     title="ดึงข้อมูลล่าสุดจาก Google Sheet"
                   >
                     <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                     {isRefreshing ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
                   </button>
                   <div className="h-full w-px bg-gray-300 mx-1"></div>
                   <button 
                     onClick={() => handleSort('number')}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${sortConfig.key === 'number' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600'}`}
                   >
                     {sortConfig.key === 'number' && sortConfig.direction === 'asc' ? <ArrowDown01 className="w-4 h-4"/> : <ArrowUp01 className="w-4 h-4"/>}
                     เรียงตามเลขที่
                   </button>
                   <button 
                     onClick={() => handleSort('score')}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${sortConfig.key === 'score' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-600'}`}
                   >
                     {sortConfig.key === 'score' && sortConfig.direction === 'desc' ? <ArrowDown01 className="w-4 h-4"/> : <ArrowUp01 className="w-4 h-4"/>}
                     เรียงตามคะแนน
                   </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">ห้อง</th>
                    <th className="p-4 font-semibold">เลขที่</th>
                    <th className="p-4 font-semibold">รหัสนักเรียน</th>
                    <th className="p-4 font-semibold">ชื่อ - นามสกุล</th>
                    <th className="p-4 font-semibold text-center">คะแนน (เต็ม {config.maxScore})</th>
                    <th className="p-4 font-semibold">ระดับ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedStudents.map((s) => {
                    const status = getStatus(s.score, config.maxScore, s.status);
                    const isPassing = (s.score / config.maxScore) >= 0.5;
                    return (
                        <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="p-4 text-gray-600">{s.room}</td>
                            <td className="p-4 font-medium text-gray-900">{s.number}</td>
                            <td className="p-4 text-gray-500 font-mono text-xs">{s.id}</td>
                            <td className="p-4 text-gray-800">{s.prefix}{s.firstName} {s.lastName}</td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-lg font-bold ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {s.score}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-sm font-medium ${status.color}`}>
                                    {status.icon} {status.label}
                                </span>
                            </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAndSortedStudents.length === 0 && (
                  <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                      <Users className="w-12 h-12 mb-2 opacity-20" />
                      ไม่มีข้อมูลนักเรียน
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Top One Tab Content */}
        {activeTab === 'topone' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                คะแนนสูงสุดรายห้อง (Top One)
            </h3>
            
            {topStudentsByRoom.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <Users className="w-12 h-12 mb-2 opacity-20" />
                    ยังไม่มีข้อมูลนักเรียน
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topStudentsByRoom.map((item) => (
                        <div key={item.room} className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity transform rotate-12">
                                <Trophy className="w-32 h-32 text-yellow-600" />
                            </div>

                            <div className="relative z-10 flex justify-between items-center mb-4 border-b border-yellow-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full border border-yellow-200">
                                        ห้อง {item.room}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-3xl font-bold text-yellow-600 leading-none">
                                        {item.score}
                                    </span>
                                    <span className="text-xs text-gray-500">คะแนนสูงสุด</span>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-3">
                                {item.students.map((student) => {
                                    const status = getStatus(student.score, config.maxScore, student.status);
                                    return (
                                        <div key={student.id} className="flex items-center gap-3 bg-white/80 p-3 rounded-lg border border-yellow-100 shadow-sm">
                                            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-200 to-yellow-100 flex items-center justify-center text-sm font-bold text-yellow-800 shadow-inner">
                                                {student.number}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 truncate">
                                                    {student.prefix}{student.firstName} {student.lastName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500 font-mono">{student.id}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {/* Average Tab Content */}
        {activeTab === 'average' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                สถิติคะแนนเฉลี่ย (Average Score)
            </h3>

             {roomStats.roomData.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <Users className="w-12 h-12 mb-2 opacity-20" />
                    ยังไม่มีข้อมูลนักเรียน
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Overall Stats Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-5 skew-x-12 transform translate-x-10"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left">
                                <h4 className="text-blue-200 font-medium mb-1">คะแนนเฉลี่ยรวมทุกห้อง</h4>
                                <div className="text-5xl font-bold tracking-tight">{roomStats.overallAvg}</div>
                                <div className="text-sm text-blue-200 mt-2">จากนักเรียนทั้งหมด {roomStats.totalStudents} คน</div>
                            </div>
                            <div className="flex-1 w-full md:w-auto bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                                <div className="flex justify-between text-sm mb-2 text-blue-100">
                                    <span>ความคืบหน้าคะแนนรวม</span>
                                    <span>{((roomStats.overallAvg / config.maxScore) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-3 w-full bg-blue-900/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-300 rounded-full transition-all duration-1000"
                                        style={{ width: `${(roomStats.overallAvg / config.maxScore) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-blue-200">
                                    <span>0</span>
                                    <span>คะแนนเต็ม {config.maxScore}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roomStats.roomData.map((stat) => (
                            <div key={stat.room} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">ห้องเรียน</div>
                                        <div className="text-xl font-bold text-gray-800">ม. {stat.room}</div>
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-lg font-bold">
                                        {stat.avg}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>คะแนนเฉลี่ย</span>
                                            <span>{((stat.avg / config.maxScore) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${
                                                    stat.avg >= roomStats.overallAvg ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}
                                                style={{ width: `${(stat.avg / config.maxScore) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-50 flex justify-between text-xs text-gray-500">
                                        <div>
                                            <span className="block text-gray-400">จำนวนนักเรียน</span>
                                            <span className="font-medium text-gray-700">{stat.count} คน</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-gray-400">ต่ำสุด - สูงสุด</span>
                                            <span className="font-medium text-gray-700">{stat.min} - {stat.max}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">ตั้งค่าหน้าแรก</h3>
            
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ลิงค์โลโก้โรงเรียน (URL)</label>
                    <div className="flex gap-4 items-start">
                        <input 
                            type="text" 
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={tempConfig.logoUrl}
                            onChange={(e) => setTempConfig({...tempConfig, logoUrl: e.target.value})}
                        />
                        <div className="w-12 h-12 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                             <img src={tempConfig.logoUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/50?text=Err'}/>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อหลัก (บรรทัดที่ 1)</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={tempConfig.headerTitle}
                        onChange={(e) => setTempConfig({...tempConfig, headerTitle: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อรอง (บรรทัดที่ 2)</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={tempConfig.headerSubtitle}
                        onChange={(e) => setTempConfig({...tempConfig, headerSubtitle: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อการสอบ (บรรทัดที่ 3)</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={tempConfig.examName}
                        onChange={(e) => setTempConfig({...tempConfig, examName: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนเต็ม (Max Score)</label>
                    <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={tempConfig.maxScore}
                        onChange={(e) => setTempConfig({...tempConfig, maxScore: parseInt(e.target.value) || 0})}
                    />
                    <p className="text-xs text-gray-500 mt-1">คะแนนเต็มนี้จะถูกใช้เพื่อคำนวณเกรดและเปอร์เซ็นต์สำหรับนักเรียนทุกคน</p>
                </div>

                <div className="pt-6">
                    <button 
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={`w-full font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าลง Google Sheet'}
                    </button>
                    {saveMessage && (
                        <p className={`text-center mt-3 text-sm ${saveStatus === 'error' ? 'text-red-600' : 'text-green-600 animate-bounce'}`}>
                            {saveMessage}
                        </p>
                    )}
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};