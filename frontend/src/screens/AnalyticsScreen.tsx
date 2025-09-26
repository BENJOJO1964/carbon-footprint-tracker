import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { AnalyticsData, CarbonFootprint } from '../types';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [carbonHistory, setCarbonHistory] = useState<CarbonFootprint[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      // 模擬數據 - 實際應該從API獲取
      const mockData: AnalyticsData = {
        period: selectedPeriod as 'day' | 'week' | 'month' | 'year',
        totalCarbonFootprint: selectedPeriod === 'week' ? 87.5 : selectedPeriod === 'month' ? 350 : 4200,
        averageDaily: selectedPeriod === 'week' ? 12.5 : selectedPeriod === 'month' ? 11.7 : 11.5,
        trends: {
          transportation: [6.2, 5.8, 7.1, 6.5, 5.9, 6.8, 7.3],
          shopping: [3.8, 4.2, 3.5, 4.1, 3.9, 4.0, 3.7],
          food: [1.5, 1.8, 1.2, 1.6, 1.4, 1.7, 1.3],
          energy: [0.8, 0.9, 0.7, 0.8, 0.9, 0.8, 0.7],
        },
        insights: [
          '您的交通碳排放比上週增加了 15%',
          '建議多使用大眾運輸工具',
          '購物習慣良好，碳排放控制得宜',
        ],
        recommendations: [
          '選擇步行或騎車代替短程開車',
          '購買本地食材減少運輸碳足跡',
          '使用節能家電降低能源消耗',
        ],
      };

      setAnalyticsData(mockData);

      // 模擬歷史數據
      const mockHistory = generateMockHistory();
      setCarbonHistory(mockHistory);
    } catch (error) {
      console.error('載入分析數據失敗:', error);
    }
  };

  const generateMockHistory = (): CarbonFootprint[] => {
    const history: CarbonFootprint[] = [];
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      history.push({
        id: i.toString(),
        userId: 'current_user',
        date,
        total: Math.random() * 20 + 5, // 5-25 kg CO2
        breakdown: {
          transportation: Math.random() * 10 + 3,
          shopping: Math.random() * 5 + 2,
          food: Math.random() * 3 + 1,
          energy: Math.random() * 2 + 0.5,
          other: Math.random() * 1 + 0.2,
        },
        activities: [],
      });
    }
    
    return history;
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case 'day': return '日';
      case 'week': return '週';
      case 'month': return '月';
      case 'year': return '年';
      default: return '週';
    }
  };

  const getChartData = () => {
    if (!analyticsData) return null;

    const labels = selectedPeriod === 'week' 
      ? ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
      : selectedPeriod === 'month'
      ? ['第1週', '第2週', '第3週', '第4週']
      : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    const data = selectedPeriod === 'week' 
      ? analyticsData.trends.transportation.map((_, index) => 
          analyticsData.trends.transportation[index] + 
          analyticsData.trends.shopping[index] + 
          analyticsData.trends.food[index] + 
          analyticsData.trends.energy[index]
        )
      : [20, 18, 22, 19, 21, 17, 23, 20, 19, 21, 18, 22];

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const getPieData = () => {
    if (!analyticsData) return [];

    const total = analyticsData.totalCarbonFootprint;
    const avgTransportation = analyticsData.trends.transportation.reduce((a, b) => a + b, 0) / analyticsData.trends.transportation.length;
    const avgShopping = analyticsData.trends.shopping.reduce((a, b) => a + b, 0) / analyticsData.trends.shopping.length;
    const avgFood = analyticsData.trends.food.reduce((a, b) => a + b, 0) / analyticsData.trends.food.length;
    const avgEnergy = analyticsData.trends.energy.reduce((a, b) => a + b, 0) / analyticsData.trends.energy.length;

    return [
      {
        name: '交通',
        population: avgTransportation,
        color: '#FF6B6B',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: '購物',
        population: avgShopping,
        color: '#4ECDC4',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: '食物',
        population: avgFood,
        color: '#45B7D1',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
      {
        name: '能源',
        population: avgEnergy,
        color: '#96CEB4',
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      },
    ];
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

  const getEmissionLevel = (value: number): { level: string; color: string } => {
    if (value < 10) return { level: '低', color: '#4CAF50' };
    if (value < 20) return { level: '中等', color: '#FF9800' };
    return { level: '高', color: '#F44336' };
  };

  const emissionLevel = analyticsData ? getEmissionLevel(analyticsData.averageDaily) : { level: '低', color: '#4CAF50' };

  return (
    <ScrollView style={styles.container}>
      {/* 時間段選擇 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>分析時間段</Title>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              { value: 'week', label: '週' },
              { value: 'month', label: '月' },
              { value: 'year', label: '年' },
            ]}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      {/* 總覽統計 */}
      {analyticsData && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>本{getPeriodLabel(selectedPeriod)}總覽</Title>
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analyticsData.totalCarbonFootprint.toFixed(1)}</Text>
                <Text style={styles.statLabel}>總碳排放 (kg)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{analyticsData.averageDaily.toFixed(1)}</Text>
                <Text style={styles.statLabel}>日均排放 (kg)</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: emissionLevel.color }]}>
                  {emissionLevel.level}
                </Text>
                <Text style={styles.statLabel}>排放等級</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 趨勢圖表 */}
      {getChartData() && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>碳足跡趨勢</Title>
            <LineChart
              data={getChartData()!}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {/* 分類分布 */}
      {getPieData().length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>碳排放分布</Title>
            <PieChart
              data={getPieData()}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 10]}
              absolute
            />
          </Card.Content>
        </Card>
      )}

      {/* 數據洞察 */}
      {analyticsData && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>數據洞察</Title>
            {analyticsData.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Icon name="insights" size={20} color="#2196F3" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* 環保建議 */}
      {analyticsData && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>環保建議</Title>
            {analyticsData.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Icon name="eco" size={20} color="#4CAF50" />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* 環保成就 */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>環保成就</Title>
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementItem}>
              <Icon name="directions-walk" size={32} color="#4CAF50" />
              <Text style={styles.achievementTitle}>步行達人</Text>
              <Text style={styles.achievementDesc}>本週步行超過 10 公里</Text>
            </View>
            <View style={styles.achievementItem}>
              <Icon name="receipt" size={32} color="#2196F3" />
              <Text style={styles.achievementTitle}>綠色購物</Text>
              <Text style={styles.achievementDesc}>選擇環保商品</Text>
            </View>
            <View style={styles.achievementItem}>
              <Icon name="trending-down" size={32} color="#FF9800" />
              <Text style={styles.achievementTitle}>減碳先鋒</Text>
              <Text style={styles.achievementDesc}>碳排放比上月減少 15%</Text>
            </View>
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
  segmentedButtons: {
    marginTop: 16,
  },
  overviewStats: {
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
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
