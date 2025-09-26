import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 導入頁面組件
import DashboardScreen from './src/screens/DashboardScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// 導入服務
import { LocationService } from './src/services/LocationService';
import { SensorService } from './src/services/SensorService';
import { AuthService } from './src/services/AuthService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Tracking':
              iconName = 'my-location';
              break;
            case 'Invoice':
              iconName = 'receipt';
              break;
            case 'Analytics':
              iconName = 'analytics';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: '儀表板' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen} 
        options={{ title: '即時追蹤' }}
      />
      <Tab.Screen 
        name="Invoice" 
        component={InvoiceScreen} 
        options={{ title: '發票掃描' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: '數據分析' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: '設定' }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 檢查用戶認證狀態
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const isValid = await AuthService.validateToken(token);
        setIsAuthenticated(isValid);
      }

      // 初始化位置服務
      await LocationService.initialize();
      
      // 初始化感應器服務
      await SensorService.initialize();

      setIsLoading(false);
    } catch (error) {
      console.error('應用程式初始化失敗:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>正在載入碳足跡追蹤器...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={TabNavigator} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default App;
