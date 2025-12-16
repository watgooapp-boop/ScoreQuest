import { Student, AppConfig, ScoreStatus } from './types';

// Google Apps Script Web App URL
export const API_URL = 'https://script.google.com/macros/s/AKfycbyRM57bEWtXI5DSkQ2jeuXxhTXzRAaAEbnJJSPFRAsKXiHBpneokX68v4jNRZ7bdxxaiw/exec';

export const DEFAULT_CONFIG: AppConfig = {
  logoUrl: 'https://img5.pic.in.th/file/secure-sv1/nw_logo-removebg.png',
  headerTitle: 'ประกาศคะแนนสอบวัดผลการเรียนรู้',
  headerSubtitle: 'รายวิชาคณิตศาสตร์พื้นฐาน 4 ค22102',
  examName: 'การสอบ วัดผลการเรียนรู้กลางภาค 2/68',
  maxScore: 20
};

// Initial Mock data (will be replaced by API data)
export const MOCK_STUDENTS: Student[] = [];

export const getStatus = (score: number, max: number, explicitStatus?: string): { label: string; color: string; icon: string } => {
  // 1. Check if status comes directly from Google Sheet (Priority)
  if (explicitStatus && typeof explicitStatus === 'string' && explicitStatus.trim().length > 0) {
    const label = explicitStatus.trim();
    
    // Strict Match with Enum
    if (label === ScoreStatus.EXCELLENT) return { label, color: 'text-green-600 bg-green-100', icon: '🏆' };
    if (label === ScoreStatus.VERY_GOOD) return { label, color: 'text-blue-600 bg-blue-100', icon: '🌟' };
    if (label === ScoreStatus.GOOD) return { label, color: 'text-cyan-600 bg-cyan-100', icon: '👍' };
    if (label === ScoreStatus.PASS) return { label, color: 'text-yellow-600 bg-yellow-100', icon: '🙂' };
    if (label === ScoreStatus.IMPROVE) return { label, color: 'text-red-600 bg-red-100', icon: '✌️' };

    // Robust/Fuzzy Match (in case sheet data has slight variations)
    if (label.match(/เยี่ยม|ดีเลิศ|สุดยอด/)) return { label, color: 'text-green-600 bg-green-100', icon: '🏆' };
    if (label.match(/ดีมาก/)) return { label, color: 'text-blue-600 bg-blue-100', icon: '🌟' };
    if (label === 'ดี' || label.match(/^ดี$/)) return { label, color: 'text-cyan-600 bg-cyan-100', icon: '👍' };
    if (label.match(/พอใช้|ผ่าน/)) return { label, color: 'text-yellow-600 bg-yellow-100', icon: '🙂' };
    if (label.match(/ปรับปรุง|ไม่ผ่าน|ตก|ซ่อม/)) return { label, color: 'text-red-600 bg-red-100', icon: '✌️' };

    // Default styling for custom text from sheet
    return { label, color: 'text-gray-700 bg-gray-100', icon: '📊' };
  }

  // 2. Fallback: Calculate based on score percentage if no status in sheet
  const percentage = (score / max) * 100;
  if (percentage >= 80) return { label: ScoreStatus.EXCELLENT, color: 'text-green-600 bg-green-100', icon: '🏆' };
  if (percentage >= 75) return { label: ScoreStatus.VERY_GOOD, color: 'text-blue-600 bg-blue-100', icon: '🌟' };
  if (percentage >= 70) return { label: ScoreStatus.GOOD, color: 'text-cyan-600 bg-cyan-100', icon: '👍' };
  if (percentage >= 50) return { label: ScoreStatus.PASS, color: 'text-yellow-600 bg-yellow-100', icon: '🙂' };
  return { label: ScoreStatus.IMPROVE, color: 'text-red-600 bg-red-100', icon: '✌️' };
};