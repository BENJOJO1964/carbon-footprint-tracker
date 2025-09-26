import logging
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class EmissionFactor:
    """碳排放係數數據類"""
    activity: str
    factor: float  # kg CO2 per unit
    unit: str
    source: str
    reliability: float  # 0-1, 數據可靠性

class CarbonCalculator:
    """碳足跡計算器"""
    
    def __init__(self):
        self.emission_factors = self._load_emission_factors()
        self.product_categories = self._load_product_categories()
        self.food_emission_factors = self._load_food_emission_factors()
    
    def _load_emission_factors(self) -> Dict[str, EmissionFactor]:
        """載入碳排放係數"""
        return {
            # 交通運輸
            'walking': EmissionFactor('walking', 0.0, 'km', 'IPCC', 1.0),
            'cycling': EmissionFactor('cycling', 0.0, 'km', 'IPCC', 1.0),
            'driving_gasoline': EmissionFactor('driving_gasoline', 0.192, 'km', 'EPA', 0.9),
            'driving_diesel': EmissionFactor('driving_diesel', 0.171, 'km', 'EPA', 0.9),
            'driving_electric': EmissionFactor('driving_electric', 0.053, 'km', 'EPA', 0.8),
            'bus': EmissionFactor('bus', 0.089, 'km', 'IPCC', 0.9),
            'train': EmissionFactor('train', 0.041, 'km', 'IPCC', 0.9),
            'metro': EmissionFactor('metro', 0.041, 'km', 'IPCC', 0.9),
            'flight_domestic': EmissionFactor('flight_domestic', 0.285, 'km', 'IPCC', 0.9),
            'flight_international': EmissionFactor('flight_international', 0.255, 'km', 'IPCC', 0.9),
            
            # 能源使用
            'electricity_taiwan': EmissionFactor('electricity_taiwan', 0.509, 'kWh', '台電', 0.95),
            'natural_gas': EmissionFactor('natural_gas', 1.96, 'm³', 'IPCC', 0.9),
            'lpg': EmissionFactor('lpg', 1.51, 'kg', 'IPCC', 0.9),
            
            # 食物
            'beef': EmissionFactor('beef', 27.0, 'kg', 'Poore & Nemecek', 0.9),
            'pork': EmissionFactor('pork', 12.1, 'kg', 'Poore & Nemecek', 0.9),
            'chicken': EmissionFactor('chicken', 6.9, 'kg', 'Poore & Nemecek', 0.9),
            'fish': EmissionFactor('fish', 5.1, 'kg', 'Poore & Nemecek', 0.8),
            'dairy': EmissionFactor('dairy', 3.2, 'kg', 'Poore & Nemecek', 0.9),
            'eggs': EmissionFactor('eggs', 4.2, 'kg', 'Poore & Nemecek', 0.9),
            'rice': EmissionFactor('rice', 2.7, 'kg', 'Poore & Nemecek', 0.9),
            'wheat': EmissionFactor('wheat', 1.4, 'kg', 'Poore & Nemecek', 0.9),
            'vegetables': EmissionFactor('vegetables', 0.4, 'kg', 'Poore & Nemecek', 0.8),
            'fruits': EmissionFactor('fruits', 0.4, 'kg', 'Poore & Nemecek', 0.8),
        }
    
    def _load_product_categories(self) -> Dict[str, float]:
        """載入商品類別碳排放係數 (kg CO2 per NT$ 100)"""
        return {
            'food': 0.8,
            'clothing': 1.2,
            'electronics': 2.5,
            'home': 1.5,
            'health': 1.0,
            'beauty': 1.8,
            'sports': 1.3,
            'books': 0.6,
            'toys': 1.4,
            'automotive': 3.0,
            'garden': 0.9,
            'office': 1.1,
            'other': 1.0
        }
    
    def _load_food_emission_factors(self) -> Dict[str, float]:
        """載入食物碳排放係數 (kg CO2 per kg)"""
        return {
            'beef': 27.0,
            'pork': 12.1,
            'chicken': 6.9,
            'fish': 5.1,
            'dairy': 3.2,
            'eggs': 4.2,
            'rice': 2.7,
            'wheat': 1.4,
            'vegetables': 0.4,
            'fruits': 0.4,
            'nuts': 0.3,
            'legumes': 0.6
        }
    
    def calculate_transportation_emission(self, data: Dict) -> float:
        """計算交通運輸碳排放"""
        try:
            transport_type = data.get('type', 'unknown')
            distance = data.get('distance', 0)  # km
            passengers = data.get('passengers', 1)
            vehicle_type = data.get('vehicle_type', 'gasoline')
            
            # 根據交通類型選擇排放係數
            if transport_type == 'walking' or transport_type == 'cycling':
                return 0.0
            
            elif transport_type == 'driving':
                factor_key = f'driving_{vehicle_type}'
                if factor_key not in self.emission_factors:
                    factor_key = 'driving_gasoline'  # 預設
                
                factor = self.emission_factors[factor_key]
                emission = distance * factor.factor
                
                # 考慮載客數（分攤碳排放）
                return emission / passengers
            
            elif transport_type == 'public_transport':
                transport_mode = data.get('mode', 'bus')
                factor_key = transport_mode if transport_mode in self.emission_factors else 'bus'
                factor = self.emission_factors[factor_key]
                return distance * factor.factor
            
            elif transport_type == 'flying':
                flight_type = data.get('flight_type', 'domestic')
                factor_key = f'flight_{flight_type}'
                factor = self.emission_factors[factor_key]
                return distance * factor.factor
            
            else:
                # 未知交通類型，使用預設值
                return distance * 0.1
            
        except Exception as e:
            logger.error(f"交通碳排放計算失敗: {e}")
            return 0.0
    
    def calculate_shopping_emission(self, data: Dict) -> float:
        """計算購物碳排放"""
        try:
            total_amount = data.get('total_amount', 0)  # NT$
            items = data.get('items', [])
            
            if not items:
                # 沒有詳細商品信息，使用平均係數
                return total_amount * 0.01  # 1% 的碳排放係數
            
            total_emission = 0.0
            
            for item in items:
                category = item.get('category', 'other')
                price = item.get('price', 0)
                quantity = item.get('quantity', 1)
                
                # 根據商品類別計算碳排放
                if category in self.product_categories:
                    emission_factor = self.product_categories[category]
                else:
                    emission_factor = self.product_categories['other']
                
                item_emission = (price * quantity) * (emission_factor / 100)
                total_emission += item_emission
            
            return total_emission
            
        except Exception as e:
            logger.error(f"購物碳排放計算失敗: {e}")
            return 0.0
    
    def calculate_food_emission(self, data: Dict) -> float:
        """計算食物碳排放"""
        try:
            food_items = data.get('items', [])
            total_emission = 0.0
            
            for item in food_items:
                food_type = item.get('type', '')
                weight = item.get('weight', 0)  # kg
                
                # 尋找匹配的食物類型
                emission_factor = 0.0
                for food_key, factor in self.food_emission_factors.items():
                    if food_key in food_type.lower():
                        emission_factor = factor
                        break
                
                if emission_factor == 0.0:
                    # 使用平均食物排放係數
                    emission_factor = 2.0
                
                total_emission += weight * emission_factor
            
            return total_emission
            
        except Exception as e:
            logger.error(f"食物碳排放計算失敗: {e}")
            return 0.0
    
    def calculate_energy_emission(self, data: Dict) -> float:
        """計算能源使用碳排放"""
        try:
            energy_type = data.get('type', 'electricity')
            consumption = data.get('consumption', 0)
            
            if energy_type == 'electricity':
                factor = self.emission_factors['electricity_taiwan']
                return consumption * factor.factor
            
            elif energy_type == 'natural_gas':
                factor = self.emission_factors['natural_gas']
                return consumption * factor.factor
            
            elif energy_type == 'lpg':
                factor = self.emission_factors['lpg']
                return consumption * factor.factor
            
            else:
                return 0.0
            
        except Exception as e:
            logger.error(f"能源碳排放計算失敗: {e}")
            return 0.0
    
    def calculate_footprint(self, data: Dict) -> Dict:
        """計算總碳足跡"""
        try:
            activity_type = data.get('type', 'unknown')
            
            if activity_type == 'transportation':
                emission = self.calculate_transportation_emission(data)
            elif activity_type == 'shopping':
                emission = self.calculate_shopping_emission(data)
            elif activity_type == 'food':
                emission = self.calculate_food_emission(data)
            elif activity_type == 'energy':
                emission = self.calculate_energy_emission(data)
            else:
                emission = 0.0
            
            return {
                'carbon_footprint': round(emission, 3),
                'activity_type': activity_type,
                'calculation_method': 'standard_emission_factors',
                'confidence': 0.8,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"碳足跡計算失敗: {e}")
            return {
                'carbon_footprint': 0.0,
                'activity_type': data.get('type', 'unknown'),
                'calculation_method': 'error',
                'confidence': 0.0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def calculate_daily_footprint(self, activities: List[Dict]) -> Dict:
        """計算每日碳足跡"""
        try:
            total_emission = 0.0
            breakdown = {
                'transportation': 0.0,
                'shopping': 0.0,
                'food': 0.0,
                'energy': 0.0,
                'other': 0.0
            }
            
            for activity in activities:
                result = self.calculate_footprint(activity)
                emission = result['carbon_footprint']
                activity_type = activity.get('type', 'other')
                
                total_emission += emission
                
                if activity_type in breakdown:
                    breakdown[activity_type] += emission
                else:
                    breakdown['other'] += emission
            
            return {
                'total_emission': round(total_emission, 3),
                'breakdown': {k: round(v, 3) for k, v in breakdown.items()},
                'activity_count': len(activities),
                'average_per_activity': round(total_emission / len(activities), 3) if activities else 0.0,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"每日碳足跡計算失敗: {e}")
            return {
                'total_emission': 0.0,
                'breakdown': {
                    'transportation': 0.0,
                    'shopping': 0.0,
                    'food': 0.0,
                    'energy': 0.0,
                    'other': 0.0
                },
                'activity_count': 0,
                'average_per_activity': 0.0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def generate_insights(self, carbon_data: List[Dict]) -> List[Dict]:
        """生成碳足跡洞察"""
        try:
            insights = []
            
            if not carbon_data:
                return insights
            
            # 計算統計數據
            total_emission = sum(item.get('carbon_footprint', 0) for item in carbon_data)
            avg_emission = total_emission / len(carbon_data)
            
            # 分析趨勢
            if len(carbon_data) >= 7:
                recent_week = carbon_data[-7:]
                previous_week = carbon_data[-14:-7] if len(carbon_data) >= 14 else []
                
                if previous_week:
                    recent_avg = sum(item.get('carbon_footprint', 0) for item in recent_week) / 7
                    previous_avg = sum(item.get('carbon_footprint', 0) for item in previous_week) / 7
                    
                    change_percent = ((recent_avg - previous_avg) / previous_avg) * 100
                    
                    if change_percent > 10:
                        insights.append({
                            'type': 'warning',
                            'title': '碳排放增加',
                            'description': f'最近一週的碳排放比前一週增加了 {change_percent:.1f}%',
                            'priority': 'high'
                        })
                    elif change_percent < -10:
                        insights.append({
                            'type': 'achievement',
                            'title': '碳排放減少',
                            'description': f'最近一週的碳排放比前一週減少了 {abs(change_percent):.1f}%',
                            'priority': 'medium'
                        })
            
            # 分析主要排放源
            activity_types = {}
            for item in carbon_data:
                activity_type = item.get('type', 'other')
                emission = item.get('carbon_footprint', 0)
                activity_types[activity_type] = activity_types.get(activity_type, 0) + emission
            
            if activity_types:
                max_activity = max(activity_types, key=activity_types.get)
                max_emission = activity_types[max_activity]
                
                if max_emission > total_emission * 0.5:
                    insights.append({
                        'type': 'tip',
                        'title': '主要排放源',
                        'description': f'{max_activity} 佔總碳排放的 {(max_emission/total_emission)*100:.1f}%',
                        'priority': 'medium'
                    })
            
            # 目標達成分析
            daily_goal = 20.0  # kg CO2
            if avg_emission > daily_goal:
                insights.append({
                    'type': 'warning',
                    'title': '超過每日目標',
                    'description': f'平均每日碳排放 {avg_emission:.1f}kg 超過目標 {daily_goal}kg',
                    'priority': 'high'
                })
            elif avg_emission < daily_goal * 0.8:
                insights.append({
                    'type': 'achievement',
                    'title': '達成環保目標',
                    'description': f'平均每日碳排放 {avg_emission:.1f}kg 低於目標',
                    'priority': 'medium'
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"洞察生成失敗: {e}")
            return []
    
    def get_emission_factors(self) -> Dict:
        """獲取所有排放係數"""
        return {
            factor.activity: {
                'factor': factor.factor,
                'unit': factor.unit,
                'source': factor.source,
                'reliability': factor.reliability
            }
            for factor in self.emission_factors.values()
        }
