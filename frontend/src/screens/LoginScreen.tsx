import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authService } from '../services/AuthService';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        Alert.alert('成功', '登入成功！', [
          { text: '確定', onPress: () => navigation.replace('Main') }
        ]);
      } else {
        Alert.alert('登入失敗', result.error || '請檢查您的帳號密碼');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      Alert.alert('錯誤', '登入時發生錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('提示', '請先輸入您的電子郵件地址');
      return;
    }

    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        Alert.alert('成功', '重設密碼郵件已發送到您的信箱');
      } else {
        Alert.alert('錯誤', result.error || '重設密碼失敗');
      }
    } catch (error) {
      console.error('重設密碼錯誤:', error);
      Alert.alert('錯誤', '重設密碼時發生錯誤，請重試');
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="eco" size={80} color="#4CAF50" />
          <Title style={styles.appTitle}>碳足跡追蹤器</Title>
          <Paragraph style={styles.appSubtitle}>
            智能偵測您的日常碳足跡，為環保盡一份力
          </Paragraph>
        </View>

        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>登入</Title>
            
            <TextInput
              label="電子郵件"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="密碼"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>忘記密碼？</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '登入中...' : '登入'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={handleRegister}
              style={styles.registerButton}
            >
              註冊新帳號
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>主要功能</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="my-location" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>GPS 即時追蹤</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="camera-alt" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>發票智能掃描</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="analytics" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>數據分析報告</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="eco" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>環保建議</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  loginCard: {
    elevation: 8,
    borderRadius: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  registerButton: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  features: {
    marginTop: 40,
    alignItems: 'center',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default LoginScreen;
