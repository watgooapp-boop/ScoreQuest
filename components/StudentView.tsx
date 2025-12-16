import React, { useState } from 'react';
import { Search, RotateCcw, Award, User, Hash } from 'lucide-react';
import { Student, AppConfig } from '../types';
import { getStatus } from '../constants';

interface StudentViewProps {
  students: Student[];
  config: AppConfig;
}

export const StudentView: React.FC<StudentViewProps> = ({ students, config }) => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<Student | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setHasSearched(true);

    if (searchId.length !== 5) {
      setError('กรุณากรอกรหัสประจำตัว 5 หลัก');
      return;
    }

    const found = students.find(s => s.id === searchId);
    if (found) {
      setResult(found);
    } else {
      setError('ไม่พบข้อมูลนักเรียน กรุณาตรวจสอบรหัสอีกครั้ง');
    }
  };

  const handleReset = () => {
    setSearchId('');
    setResult(null);
    setHasSearched(false);
    setError('');
  };

  const status = result ? getStatus(result.score, config.maxScore, result.status) : null;
  const percentage = result ? (result.score / config.maxScore) * 100 : 0;

  return (
    <div className="max-w-md mx-auto w-full px-4 py-8">
      {/* Search Card */}
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ${result ? 'mb-6' : 'mb-0'}`}>
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
          <h2 className="text-xl font-bold mb-2">ตรวจสอบคะแนนสอบ</h2>
          <p className="text-blue-100 text-sm">กรอกรหัสประจำตัว 5 หลักเพื่อค้นหา</p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                maxLength={5}
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
                placeholder="รหัสประจำตัว (เช่น 12345)"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors text-lg text-center tracking-widest"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              ค้นหาข้อมูล
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-pulse border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Result Card */}
      {result && status && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-white p-6 border-b border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Award className="w-32 h-32 text-blue-600" />
             </div>
             
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner text-blue-600 font-bold border-4 border-white">
                  {result.prefix === 'ด.ช.' ? '👦' : '👧'}
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-1">{result.prefix}{result.firstName} {result.lastName}</h2>
               <div className="flex gap-3 text-sm text-gray-500 font-medium">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">ห้อง {result.room}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">เลขที่ {result.number}</span>
               </div>
             </div>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-gray-500 mb-2 font-medium">คะแนนที่ทำได้</p>
              <div className="flex items-end justify-center gap-2 text-blue-900">
                <span className="text-6xl font-bold tracking-tighter">{result.score}</span>
                <span className="text-2xl font-semibold text-gray-400 mb-2">/ {config.maxScore}</span>
              </div>
              
              {/* Percentage Display */}
              <div className="mt-3">
                 <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm border border-indigo-100">
                    คิดเป็น {Number.isInteger(percentage) ? percentage : percentage.toFixed(2)}%
                 </span>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${status.color} border border-opacity-20 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300`}>
                <div className="text-4xl mb-2">{status.icon}</div>
                <h3 className="text-lg font-bold">อยู่ในระดับ</h3>
                <p className="text-2xl font-extrabold mt-1">{status.label}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              ค้นหาใหม่อีกครั้ง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};