import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Card, Title, Paragraph, Button, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Location, MovementData, MovementType } from '../types';
import { locationService } from '../services/LocationService';
import { sensorService } from '../services/SensorService';

const { width, height } = Dimensions.get('window');

const TrackingScreen: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [movementHistory, setMovementHistory] = useState<MovementData[]>([]);
  const [trackingPath, setTrackingPath] = useState<Location[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [autoDetect, setAutoDetect] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<string>('未知');

  useEffect(() => {
    initializeTracking();
    return () => {
      locationService.stopTracking();
      sensorService.stopTracking();
    };
  }, []);

  const initializeTracking = async () => {
    const locationInitialized = await locationService.initialize();
    const sensorInitialized = await sensorService.initialize();
    
    if (!locationInitialized) {
      Alert.alert('錯誤', '無法初始化位置服務');
    }
  };

  const startTracking = () => {
    if (!currentLocation) {
      Alert.alert('錯誤', '無法獲取當前位置');
      return;
    }

    setIsTracking(true);
    setTrackingPath([currentLocation]);
    setTotalDistance(0);
    setTotalCarbon(0);

    // 開始位置追蹤
    locationService.startTracking(
      (location) => {
        setCurrentLocation(location);
        setTrackingPath(prev => [...prev, location]);
      },
      (movement) => {
        setMovementHistory(prev => [...prev, movement]);
        setTotalDistance(prev => prev + movement.distance);
        setTotalCarbon(prev => prev + movement.carbonFootprint);
      }
    );

    // 開始感應器追蹤
    if (autoDetect) {
      sensorService.startTracking((sensorData) => {
        const activity = sensorService.detectActivityType(sensorData);
        setCurrentActivity(activity);
      });
    }

    Alert.alert('開始追蹤', '已開始記錄您的移動軌跡');
  };

  const stopTracking = () => {
    setIsTracking(false);
    locationService.stopTracking();
    sensorService.stopTracking();
    
    Alert.alert(
      '追蹤完成',
      `本次移動距離: ${totalDistance.toFixed(2)} 公里\n預估碳排放: ${totalCarbon.toFixed(2)} kg CO₂`
    );
  };

  const getMovementTypeIcon = (type: MovementType): string => {
    switch (type) {
      case MovementType.WALKING:
        return 'directions-walk';
      case MovementType.CYCLING:
        return 'directions-bike';
      case MovementType.DRIVING:
        return 'directions-car';
      case MovementType.PUBLIC_TRANSPORT:
        return 'directions-bus';
      case MovementType.FLYING:
        return 'flight';
      default:
        return 'help';
    }
  };

  const getMovementTypeColor = (type: MovementType): string => {
    switch (type) {
      case MovementType.WALKING:
        return '#4CAF50';
      case MovementType.CYCLING:
        return '#2196F3';
      case MovementType.DRIVING:
        return '#F44336';
      case MovementType.PUBLIC_TRANSPORT:
        return '#FF9800';
      case MovementType.FLYING:
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const getMovementTypeName = (type: MovementType): string => {
    switch (type) {
      case MovementType.WALKING:
        return '步行';
      case MovementType.CYCLING:
        return '騎車';
      case MovementType.DRIVING:
        return '開車';
      case MovementType.PUBLIC_TRANSPORT:
        return '大眾運輸';
      case MovementType.FLYING:
        return '飛行';
      default:
        return '未知';
    }
  };

  return (
    <View style={styles.container}>
      {/* 地圖區域 */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 25.0330,
            longitude: currentLocation?.longitude || 121.5654,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={isTracking}
        >
          {/* 當前位置標記 */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="當前位置"
              description={`精度: ${currentLocation.accuracy.toFixed(0)}m`}
            />
          )}

          {/* 移動軌跡 */}
          {trackingPath.length > 1 && (
            <Polyline
              coordinates={trackingPath.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
              }))}
              strokeColor="#4CAF50"
              strokeWidth={4}
            />
          )}

          {/* 移動記錄標記 */}
          {movementHistory.map((movement, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: movement.endLocation.latitude,
                longitude: movement.endLocation.longitude,
              }}
              title={getMovementTypeName(movement.type)}
              description={`距離: ${movement.distance.toFixed(2)}km, 碳排放: ${movement.carbonFootprint.toFixed(2)}kg`}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMovementTypeColor(movement.type) }]}>
                <Icon
                  name={getMovementTypeIcon(movement.type)}
                  size={20}
                  color="#fff"
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* 控制面板 */}
      <View style={styles.controlPanel}>
        <Card style={styles.controlCard}>
          <Card.Content>
            <View style={styles.controlHeader}>
              <Title>即時追蹤</Title>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: isTracking ? '#4CAF50' : '#F44336' }]} />
                <Text style={styles.statusText}>
                  {isTracking ? '追蹤中' : '已停止'}
                </Text>
              </View>
            </View>

            {/* 當前活動 */}
            <View style={styles.currentActivity}>
              <Icon name="my-location" size={24} color="#4CAF50" />
              <Text style={styles.activityText}>當前活動: {currentActivity}</Text>
            </View>

            {/* 統計數據 */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalDistance.toFixed(2)}</Text>
                <Text style={styles.statLabel}>公里</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCarbon.toFixed(2)}</Text>
                <Text style={styles.statLabel}>kg CO₂</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{movementHistory.length}</Text>
                <Text style={styles.statLabel}>段移動</Text>
              </View>
            </View>

            {/* 設定選項 */}
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>自動偵測活動類型</Text>
                <Switch
                  value={autoDetect}
                  onValueChange={setAutoDetect}
                  disabled={isTracking}
                />
              </View>
            </View>

            {/* 控制按鈕 */}
            <View style={styles.buttonContainer}>
              {!isTracking ? (
                <Button
                  mode="contained"
                  onPress={startTracking}
                  style={styles.startButton}
                  icon="play-arrow"
                  disabled={!currentLocation}
                >
                  開始追蹤
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={stopTracking}
                  style={styles.stopButton}
                  icon="stop"
                >
                  停止追蹤
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* 移動歷史 */}
      {movementHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <Card style={styles.historyCard}>
            <Card.Content>
              <Title>移動記錄</Title>
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {movementHistory.slice(-5).reverse().map((movement, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Icon
                        name={getMovementTypeIcon(movement.type)}
                        size={24}
                        color={getMovementTypeColor(movement.type)}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyType}>
                        {getMovementTypeName(movement.type)}
                      </Text>
                      <Text style={styles.historyDetails}>
                        {movement.distance.toFixed(2)}km • {movement.duration.toFixed(1)}分鐘
                      </Text>
                    </View>
                    <Text style={styles.historyCarbon}>
                      {movement.carbonFootprint.toFixed(2)}kg
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: height * 0.6,
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  controlCard: {
    margin: 16,
    elevation: 8,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  currentActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  activityText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingsContainer: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  historyContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    maxHeight: height * 0.3,
  },
  historyCard: {
    elevation: 4,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyCarbon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default TrackingScreen;
