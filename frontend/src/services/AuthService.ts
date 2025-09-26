import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // 後端API地址

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // 從本地存儲載入認證信息
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        this.authToken = token;
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('認證服務初始化失敗:', error);
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.authToken = data.data.token;
        this.currentUser = data.data.user;

        // 保存到本地存儲
        await AsyncStorage.setItem('authToken', this.authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(this.currentUser));

        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error || '登入失敗',
        };
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      return {
        success: false,
        error: '網路連接失敗',
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.authToken = data.data.token;
        this.currentUser = data.data.user;

        // 保存到本地存儲
        await AsyncStorage.setItem('authToken', this.authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(this.currentUser));

        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error || '註冊失敗',
        };
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      return {
        success: false,
        error: '網路連接失敗',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // 清除本地存儲
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');

      // 清除記憶體中的數據
      this.authToken = null;
      this.currentUser = null;

      // 可選：通知後端登出
      if (this.authToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
          },
        });
      }
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.currentUser = data.data.user;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token驗證錯誤:', error);
      return false;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      if (!this.authToken) {
        return {
          success: false,
          error: '未登入',
        };
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.currentUser = data.data;
        await AsyncStorage.setItem('userData', JSON.stringify(this.currentUser));

        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.error || '更新失敗',
        };
      }
    } catch (error) {
      console.error('更新個人資料錯誤:', error);
      return {
        success: false,
        error: '網路連接失敗',
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      if (!this.authToken) {
        return {
          success: false,
          error: '未登入',
        };
      }

      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: data.error || '密碼修改失敗',
        };
      }
    } catch (error) {
      console.error('修改密碼錯誤:', error);
      return {
        success: false,
        error: '網路連接失敗',
      };
    }
  }

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: '重設密碼郵件已發送',
        };
      } else {
        return {
          success: false,
          error: data.error || '重設密碼失敗',
        };
      }
    } catch (error) {
      console.error('重設密碼錯誤:', error);
      return {
        success: false,
        error: '網路連接失敗',
      };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return this.authToken !== null && this.currentUser !== null;
  }

  // 獲取認證標頭
  getAuthHeaders(): { Authorization: string } | {} {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }
}

export const authService = AuthService.getInstance();
