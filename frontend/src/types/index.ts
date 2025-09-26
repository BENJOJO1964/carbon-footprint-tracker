// 用戶相關類型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  language: 'zh-TW' | 'en-US';
  notifications: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    achievements: boolean;
  };
  privacy: {
    shareData: boolean;
    locationTracking: boolean;
  };
}

// 位置和移動相關類型
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: Date;
}

export interface MovementData {
  id: string;
  userId: string;
  type: MovementType;
  startLocation: Location;
  endLocation: Location;
  distance: number; // 公里
  duration: number; // 分鐘
  carbonFootprint: number; // 公斤 CO2
  timestamp: Date;
  metadata?: any;
}

export enum MovementType {
  WALKING = 'walking',
  CYCLING = 'cycling',
  DRIVING = 'driving',
  PUBLIC_TRANSPORT = 'public_transport',
  FLYING = 'flying',
  UNKNOWN = 'unknown'
}

// 發票和購物相關類型
export interface Invoice {
  id: string;
  userId: string;
  type: InvoiceType;
  storeName: string;
  totalAmount: number;
  items: InvoiceItem[];
  carbonFootprint: number; // 公斤 CO2
  timestamp: Date;
  imageUrl?: string;
  ocrData?: any;
}

export enum InvoiceType {
  ELECTRONIC = 'electronic',
  PAPER = 'paper',
  SCANNED = 'scanned'
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
  carbonFootprint: number; // 公斤 CO2
}

// 碳足跡相關類型
export interface CarbonFootprint {
  id: string;
  userId: string;
  date: Date;
  total: number; // 公斤 CO2
  breakdown: {
    transportation: number;
    shopping: number;
    food: number;
    energy: number;
    other: number;
  };
  activities: CarbonActivity[];
}

export interface CarbonActivity {
  id: string;
  type: ActivityType;
  description: string;
  carbonFootprint: number;
  timestamp: Date;
  metadata?: any;
}

export enum ActivityType {
  TRANSPORTATION = 'transportation',
  SHOPPING = 'shopping',
  FOOD = 'food',
  ENERGY = 'energy',
  TRAVEL = 'travel',
  OTHER = 'other'
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 感應器數據類型
export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: Date;
}

// 分析數據類型
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  totalCarbonFootprint: number;
  averageDaily: number;
  trends: {
    transportation: number[];
    shopping: number[];
    food: number[];
    energy: number[];
  };
  insights: string[];
  recommendations: string[];
}

// 設定類型
export interface AppSettings {
  apiUrl: string;
  enableLocationTracking: boolean;
  enableSensorTracking: boolean;
  enableNotifications: boolean;
  dataRetentionDays: number;
  debugMode: boolean;
}
