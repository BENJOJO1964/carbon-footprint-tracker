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

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // 驗證表單
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('錯誤', '密碼至少需要6個字符');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('錯誤', '密碼確認不匹配');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('錯誤', '請同意服務條款和隱私政策');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        Alert.alert('註冊成功', '歡迎使用碳足跡追蹤器！', [
          { text: '確定', onPress: () => navigation.replace('Main') }
        ]);
      } else {
        Alert.alert('註冊失敗', result.error || '註冊時發生錯誤');
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      Alert.alert('錯誤', '註冊時發生錯誤，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length < 6) return { strength: '弱', color: '#F44336' };
    if (password.length < 8) return { strength: '中等', color: '#FF9800' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: '強', color: '#4CAF50' };
    }
    return { strength: '中等', color: '#FF9800' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Icon name="eco" size={60} color="#4CAF50" />
          <Title style={styles.appTitle}>註冊帳號</Title>
          <Paragraph style={styles.appSubtitle}>
            開始您的環保之旅
          </Paragraph>
        </View>

        <Card style={styles.registerCard}>
          <Card.Content>
            <TextInput
              label="姓名"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="電子郵件"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="密碼"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
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

            {formData.password.length > 0 && (
              <View style={styles.passwordStrength}>
                <Text style={styles.passwordStrengthLabel}>密碼強度:</Text>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.strength}
                </Text>
              </View>
            )}

            <TextInput
              label="確認密碼"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              style={styles.input}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <Text style={styles.errorText}>密碼不匹配</Text>
            )}

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsCheckbox}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <Icon
                  name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color={agreedToTerms ? '#4CAF50' : '#666'}
                />
                <Text style={styles.termsText}>
                  我同意
                  <Text style={styles.termsLink}> 服務條款 </Text>
                  和
                  <Text style={styles.termsLink}> 隱私政策</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.registerButton}
              loading={isLoading}
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? '註冊中...' : '註冊'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              mode="outlined"
              onPress={handleBackToLogin}
              style={styles.loginButton}
            >
              返回登入
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>註冊後您將獲得</Text>
          <View style={styles.benefitList}>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>個人化碳足跡分析</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>智能環保建議</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>數據同步與備份</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>環保成就系統</Text>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  appTitle: {
    fontSize: 24,
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
  },
  registerCard: {
    elevation: 8,
    borderRadius: 16,
  },
  input: {
    marginBottom: 16,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginBottom: 8,
  },
  termsContainer: {
    marginVertical: 16,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  termsLink: {
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
  registerButton: {
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
  loginButton: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  benefits: {
    marginTop: 30,
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benefitList: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
});

export default RegisterScreen;
