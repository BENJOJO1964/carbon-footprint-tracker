import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, ProgressBar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { CarbonFootprint, MovementData, Invoice } from '../types';
import { locationService } from '../services/LocationService';
import { sensorService } from '../services/SensorService';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint | null>(null);
  const [todayMovements, setTodayMovements] = useState<MovementData[]>([]);
  const [todayInvoices, setTodayInvoices] = useState<Invoice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    loadDashboardData();
    setupLocationTracking();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 這裡應該從API獲取數據
      // 暫時使用模擬數據
      const mockCarbonFootprint: CarbonFootprint = {
        id: '1',
        userId: 'current_user',
        date: new Date(),
        total: 12.5,
        breakdown: {
          transportation: 6.2,
          shopping: 3.8,
          food: 1.5,
          energy: 0.8,
          other: 0.2,
        },
        activities: [],
      };

      setCarbonFootprint(mockCarbonFootprint);
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
    }
  };

  const setupLocationTracking = () => {
    locationService.startTracking(
      (location) => {
        console.log('位置更新:', location);
      },
      (movement) => {
        console.log('移動檢測:', movement);
        setTodayMovements(prev => [...prev, movement]);
      }
    );
    setIsTracking(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getProgressPercentage = (current: number, target: number = 20): number => {
    return Math.min(current / target, 1);
  };

  const getEmissionColor = (value: number): string => {
    if (value < 5) return '#4CAF50'; // 綠色
    if (value < 10) return '#FF9800'; // 橙色
    return '#F44336'; // 紅色
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const pieData = carbonFootprint ? [
    {
      name: '交通',
      population: carbonFootprint.breakdown.transportation,
      color: '#FF6B6B',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: '購物',
      population: carbonFootprint.breakdown.shopping,
      color: '#4ECDC4',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: '食物',
      population: carbonFootprint.breakdown.food,
      color: '#45B7D1',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: '能源',
      population: carbonFootprint.breakdown.energy,
      color: '#96CEB4',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: '其他',
      population: carbonFootprint.breakdown.other,
      color: '#FFEAA7',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ] : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 今日碳足跡總覽 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>今日碳足跡</Title>
            <View style={styles.statusIndicator}>
              <Icon
                name={isTracking ? 'my-location' : 'location-off'}
                size={20}
                color={isTracking ? '#4CAF50' : '#9E9E9E'}
              />
              <Text style={[styles.statusText, { color: isTracking ? '#4CAF50' : '#9E9E9E' }]}>
                {isTracking ? '追蹤中' : '未追蹤'}
              </Text>
            </View>
          </View>
          
          <View style={styles.carbonDisplay}>
            <Text style={styles.carbonValue}>
              {carbonFootprint?.total.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.carbonUnit}>kg CO₂</Text>
          </View>

          <ProgressBar
            progress={getProgressPercentage(carbonFootprint?.total || 0)}
            color={getEmissionColor(carbonFootprint?.total || 0)}
            style={styles.progressBar}
          />
          
          <Text style={styles.progressText}>
            目標: 20 kg CO₂/天
          </Text>
        </Card.Content>
      </Card>

      {/* 碳足跡分布圖 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>碳足跡分布</Title>
          {pieData.length > 0 && (
            <PieChart
              data={pieData}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          )}
        </Card.Content>
      </Card>

      {/* 今日活動統計 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>今日活動</Title>
          <View style={styles.activityStats}>
            <View style={styles.statItem}>
              <Icon name="directions-walk" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{todayMovements.length}</Text>
              <Text style={styles.statLabel}>移動記錄</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="receipt" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{todayInvoices.length}</Text>
              <Text style={styles.statLabel}>發票記錄</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trending-down" size={24} color="#FF9800" />
              <Text style={styles.statValue}>-2.3</Text>
              <Text style={styles.statLabel}>節省 (kg)</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 環保建議 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>環保建議</Title>
          <View style={styles.suggestionItem}>
            <Icon name="lightbulb-outline" size={20} color="#FFC107" />
            <Text style={styles.suggestionText}>
              建議多使用大眾運輸工具，可減少 30% 的交通碳排放
            </Text>
          </View>
          <View style={styles.suggestionItem}>
            <Icon name="eco" size={20} color="#4CAF50" />
            <Text style={styles.suggestionText}>
              選擇本地食材，可減少食物運輸的碳足跡
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* 快速操作 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>快速操作</Title>
          <View style={styles.quickActions}>
            <Button
              mode="contained"
              icon="camera"
              style={styles.actionButton}
              onPress={() => {/* 導航到發票掃描 */}}
            >
              掃描發票
            </Button>
            <Button
              mode="outlined"
              icon="analytics"
              style={styles.actionButton}
              onPress={() => {/* 導航到分析頁面 */}}
            >
              查看分析
            </Button>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
  },
  carbonDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  carbonValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  carbonUnit: {
    fontSize: 16,
    color: '#666',
    marginTop: -8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default DashboardScreen;
