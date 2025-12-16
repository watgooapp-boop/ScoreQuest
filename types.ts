export interface Student {
  id: string; // 5 digit code
  prefix: string;
  firstName: string;
  lastName: string;
  room: string;
  number: number;
  score: number;
  maxScore: number; // Legacy support for individual max score, but config.maxScore will take precedence
  status?: string; // Status from Google Sheet
}

export interface AppConfig {
  logoUrl: string;
  headerTitle: string;
  headerSubtitle: string;
  examName: string;
  maxScore: number;
}

export enum ScoreStatus {
  IMPROVE = 'ปรับปรุง',
  PASS = 'พอใช้',
  GOOD = 'ดี',
  VERY_GOOD = 'ดีมาก',
  EXCELLENT = 'เยี่ยมมาก'
}

export type ViewMode = 'STUDENT' | 'LOGIN' | 'TEACHER';