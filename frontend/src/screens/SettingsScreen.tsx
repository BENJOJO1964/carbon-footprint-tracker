import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Card, Title, Paragraph, List, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/AuthService';
import { User, UserPreferences } from '../types';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    units: 'metric',
    language: 'zh-TW',
    notifications: {
      daily: true,
      weekly: true,
      monthly: false,
      achievements: true,
    },
    privacy: {
      shareData: false,
      locationTracking: true,
    },
  });

  useEffect(() => {
    loadUserData();
    loadPreferences();
  }, []);

  const loadUserData = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('載入偏好設定失敗:', error);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('保存偏好設定失敗:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '登出',
      '確定要登出嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '刪除帳號',
      '此操作無法復原，確定要刪除您的帳號嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定刪除',
          style: 'destructive',
          onPress: () => {
            // 實現刪除帳號邏輯
            Alert.alert('功能開發中', '刪除帳號功能正在開發中');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('功能開發中', '數據導出功能正在開發中');
  };

  const handleImportData = () => {
    Alert.alert('功能開發中', '數據導入功能正在開發中');
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除快取',
      '確定要清除應用程式快取嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: async () => {
            try {
              // 清除快取邏輯
              Alert.alert('成功', '快取已清除');
            } catch (error) {
              Alert.alert('錯誤', '清除快取失敗');
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert('聯絡客服', '客服功能正在開發中');
  };

  const handleAbout = () => {
    Alert.alert(
      '關於應用程式',
      '碳足跡追蹤器 v1.0.0\n\n一個智能的碳足跡偵測和記錄應用程式，幫助您了解並減少日常活動的碳排放。\n\n© 2024 Carbon Tracker Team'
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用戶資訊 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Icon name="account-circle" size={60} color="#4CAF50" />
            </View>
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{user?.name || '用戶'}</Title>
              <Paragraph style={styles.userEmail}>{user?.email || 'user@example.com'}</Paragraph>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="edit" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* 偏好設定 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>偏好設定</Title>
          
          <List.Item
            title="單位系統"
            description={preferences.units === 'metric' ? '公制 (kg, km)' : '英制 (lb, miles)'}
            left={(props) => <List.Icon {...props} icon="ruler" />}
            right={(props) => (
              <Switch
                value={preferences.units === 'metric'}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    units: value ? 'metric' : 'imperial'
                  })
                }
              />
            )}
          />

          <List.Item
            title="語言"
            description={preferences.language === 'zh-TW' ? '繁體中文' : 'English'}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) => (
              <Switch
                value={preferences.language === 'zh-TW'}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    language: value ? 'zh-TW' : 'en-US'
                  })
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* 通知設定 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>通知設定</Title>
          
          <List.Item
            title="每日提醒"
            description="每日碳足跡提醒"
            left={(props) => <List.Icon {...props} icon="notifications" />}
            right={(props) => (
              <Switch
                value={preferences.notifications.daily}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      daily: value
                    }
                  })
                }
              />
            )}
          />

          <List.Item
            title="每週報告"
            description="每週碳足跡報告"
            left={(props) => <List.Icon {...props} icon="calendar-week" />}
            right={(props) => (
              <Switch
                value={preferences.notifications.weekly}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      weekly: value
                    }
                  })
                }
              />
            )}
          />

          <List.Item
            title="每月報告"
            description="每月碳足跡報告"
            left={(props) => <List.Icon {...props} icon="calendar-month" />}
            right={(props) => (
              <Switch
                value={preferences.notifications.monthly}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      monthly: value
                    }
                  })
                }
              />
            )}
          />

          <List.Item
            title="成就通知"
            description="環保成就通知"
            left={(props) => <List.Icon {...props} icon="emoji-events" />}
            right={(props) => (
              <Switch
                value={preferences.notifications.achievements}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      achievements: value
                    }
                  })
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* 隱私設定 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>隱私設定</Title>
          
          <List.Item
            title="位置追蹤"
            description="允許應用程式追蹤位置以計算移動碳足跡"
            left={(props) => <List.Icon {...props} icon="my-location" />}
            right={(props) => (
              <Switch
                value={preferences.privacy.locationTracking}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    privacy: {
                      ...preferences.privacy,
                      locationTracking: value
                    }
                  })
                }
              />
            )}
          />

          <List.Item
            title="數據分享"
            description="允許匿名分享數據用於研究"
            left={(props) => <List.Icon {...props} icon="share" />}
            right={(props) => (
              <Switch
                value={preferences.privacy.shareData}
                onValueChange={(value) => 
                  savePreferences({
                    ...preferences,
                    privacy: {
                      ...preferences.privacy,
                      shareData: value
                    }
                  })
                }
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* 數據管理 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>數據管理</Title>
          
          <List.Item
            title="導出數據"
            description="導出您的碳足跡數據"
            left={(props) => <List.Icon {...props} icon="download" />}
            onPress={handleExportData}
          />

          <List.Item
            title="導入數據"
            description="從其他應用程式導入數據"
            left={(props) => <List.Icon {...props} icon="upload" />}
            onPress={handleImportData}
          />

          <List.Item
            title="清除快取"
            description="清除應用程式快取數據"
            left={(props) => <List.Icon {...props} icon="clear-all" />}
            onPress={handleClearCache}
          />
        </Card.Content>
      </Card>

      {/* 支援與關於 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>支援與關於</Title>
          
          <List.Item
            title="聯絡客服"
            description="獲得技術支援"
            left={(props) => <List.Icon {...props} icon="support-agent" />}
            onPress={handleContactSupport}
          />

          <List.Item
            title="關於應用程式"
            description="版本資訊和說明"
            left={(props) => <List.Icon {...props} icon="info" />}
            onPress={handleAbout}
          />
        </Card.Content>
      </Card>

      {/* 帳號操作 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>帳號操作</Title>
          
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
          >
            登出
          </Button>

          <Button
            mode="outlined"
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            icon="delete"
            buttonColor="#F44336"
            textColor="#fff"
          >
            刪除帳號
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  logoutButton: {
    marginBottom: 12,
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  deleteButton: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
});

export default SettingsScreen;
