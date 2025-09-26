import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Card, Title, Paragraph, Button, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Invoice, InvoiceItem, InvoiceType } from '../types';

const InvoiceScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedInvoice, setScannedInvoice] = useState<Invoice | null>(null);
  const [manualInput, setManualInput] = useState({
    storeName: '',
    totalAmount: '',
    items: '',
  });

  const handleCameraPress = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
          processInvoiceImage(imageUri);
        }
      }
    });
  };

  const handleGalleryPress = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setSelectedImage(imageUri);
          processInvoiceImage(imageUri);
        }
      }
    });
  };

  const processInvoiceImage = async (imageUri: string) => {
    setIsProcessing(true);
    
    try {
      // 這裡應該調用OCR API來處理發票圖片
      // 暫時使用模擬數據
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬處理時間
      
      const mockInvoice: Invoice = {
        id: Date.now().toString(),
        userId: 'current_user',
        type: InvoiceType.SCANNED,
        storeName: '全聯福利中心',
        totalAmount: 285,
        items: [
          {
            name: '有機蔬菜',
            quantity: 2,
            price: 120,
            category: 'food',
            carbonFootprint: 0.8,
          },
          {
            name: '牛奶',
            quantity: 1,
            price: 65,
            category: 'food',
            carbonFootprint: 0.5,
          },
          {
            name: '麵包',
            quantity: 1,
            price: 100,
            category: 'food',
            carbonFootprint: 0.3,
          },
        ],
        carbonFootprint: 1.6,
        timestamp: new Date(),
        imageUrl: imageUri,
      };

      setScannedInvoice(mockInvoice);
      Alert.alert('成功', '發票掃描完成！');
    } catch (error) {
      console.error('發票處理失敗:', error);
      Alert.alert('錯誤', '發票處理失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.storeName || !manualInput.totalAmount) {
      Alert.alert('錯誤', '請填寫商店名稱和總金額');
      return;
    }

    // 創建手動輸入的發票
    const manualInvoice: Invoice = {
      id: Date.now().toString(),
      userId: 'current_user',
      type: InvoiceType.PAPER,
      storeName: manualInput.storeName,
      totalAmount: parseFloat(manualInput.totalAmount),
      items: [], // 手動輸入時沒有詳細項目
      carbonFootprint: parseFloat(manualInput.totalAmount) * 0.005, // 簡單估算
      timestamp: new Date(),
    };

    setScannedInvoice(manualInvoice);
    Alert.alert('成功', '手動輸入完成！');
  };

  const saveInvoice = () => {
    if (scannedInvoice) {
      // 這裡應該保存到後端
      console.log('保存發票:', scannedInvoice);
      Alert.alert('成功', '發票已保存到您的碳足跡記錄中');
      
      // 重置狀態
      setSelectedImage(null);
      setScannedInvoice(null);
      setManualInput({ storeName: '', totalAmount: '', items: '' });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return 'restaurant';
      case 'clothing':
        return 'checkroom';
      case 'electronics':
        return 'devices';
      case 'home':
        return 'home';
      default:
        return 'shopping-cart';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return '#4CAF50';
      case 'clothing':
        return '#2196F3';
      case 'electronics':
        return '#FF9800';
      case 'home':
        return '#9C27B0';
      default:
        return '#607D8B';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 掃描發票區域 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>掃描發票</Title>
          <Paragraph>使用相機掃描發票或從相簿選擇圖片</Paragraph>
          
          <View style={styles.scanButtons}>
            <TouchableOpacity
              style={[styles.scanButton, styles.cameraButton]}
              onPress={handleCameraPress}
              disabled={isProcessing}
            >
              <Icon name="camera-alt" size={32} color="#fff" />
              <Text style={styles.buttonText}>拍照</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.scanButton, styles.galleryButton]}
              onPress={handleGalleryPress}
              disabled={isProcessing}
            >
              <Icon name="photo-library" size={32} color="#fff" />
              <Text style={styles.buttonText}>相簿</Text>
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>正在處理發票...</Text>
            </View>
          )}

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            </View>
          )}
        </Card.Content>
      </Card>

      {/* 手動輸入區域 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>手動輸入</Title>
          <Paragraph>如果無法掃描，可以手動輸入發票資訊</Paragraph>
          
          <TextInput
            label="商店名稱"
            value={manualInput.storeName}
            onChangeText={(text) => setManualInput(prev => ({ ...prev, storeName: text }))}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="總金額 (元)"
            value={manualInput.totalAmount}
            onChangeText={(text) => setManualInput(prev => ({ ...prev, totalAmount: text }))}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          
          <TextInput
            label="商品項目 (可選)"
            value={manualInput.items}
            onChangeText={(text) => setManualInput(prev => ({ ...prev, items: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          
          <Button
            mode="contained"
            onPress={handleManualSubmit}
            style={styles.submitButton}
            disabled={!manualInput.storeName || !manualInput.totalAmount}
          >
            提交
          </Button>
        </Card.Content>
      </Card>

      {/* 掃描結果 */}
      {scannedInvoice && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>掃描結果</Title>
            
            <View style={styles.invoiceHeader}>
              <Text style={styles.storeName}>{scannedInvoice.storeName}</Text>
              <Text style={styles.totalAmount}>NT$ {scannedInvoice.totalAmount}</Text>
            </View>
            
            <View style={styles.carbonInfo}>
              <Icon name="eco" size={20} color="#4CAF50" />
              <Text style={styles.carbonText}>
                預估碳足跡: {scannedInvoice.carbonFootprint.toFixed(2)} kg CO₂
              </Text>
            </View>

            {scannedInvoice.items.length > 0 && (
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>商品項目:</Text>
                {scannedInvoice.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Icon
                      name={getCategoryIcon(item.category)}
                      size={20}
                      color={getCategoryColor(item.category)}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        {item.quantity} × NT$ {item.price} = NT$ {item.quantity * item.price}
                      </Text>
                    </View>
                    <Text style={styles.itemCarbon}>
                      {item.carbonFootprint.toFixed(2)} kg
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => setScannedInvoice(null)}
                style={styles.actionButton}
              >
                重新掃描
              </Button>
              <Button
                mode="contained"
                onPress={saveInvoice}
                style={styles.actionButton}
              >
                保存記錄
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 最近發票記錄 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>最近記錄</Title>
          <View style={styles.recentItem}>
            <Icon name="receipt" size={24} color="#4CAF50" />
            <View style={styles.recentInfo}>
              <Text style={styles.recentStore}>家樂福</Text>
              <Text style={styles.recentDate}>今天 14:30</Text>
            </View>
            <Text style={styles.recentAmount}>NT$ 450</Text>
          </View>
          
          <View style={styles.recentItem}>
            <Icon name="receipt" size={24} color="#2196F3" />
            <View style={styles.recentInfo}>
              <Text style={styles.recentStore}>7-ELEVEN</Text>
              <Text style={styles.recentDate}>昨天 09:15</Text>
            </View>
            <Text style={styles.recentAmount}>NT$ 120</Text>
          </View>
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
  scanButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  scanButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  galleryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  carbonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  carbonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemCarbon: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default InvoiceScreen;
