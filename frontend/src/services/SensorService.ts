import { accelerometer, gyroscope, magnetometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { SensorData } from '../types';

class SensorService {
  private static instance: SensorService;
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;
  private magnetometerSubscription: any = null;
  private isTracking = false;
  private sensorData: SensorData | null = null;
  private onSensorDataUpdate?: (data: SensorData) => void;

  static getInstance(): SensorService {
    if (!SensorService.instance) {
      SensorService.instance = new SensorService();
    }
    return SensorService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // 設定感應器更新頻率
      setUpdateIntervalForType(SensorTypes.accelerometer, 1000); // 1秒
      setUpdateIntervalForType(SensorTypes.gyroscope, 1000);
      setUpdateIntervalForType(SensorTypes.magnetometer, 1000);

      console.log('感應器服務初始化成功');
      return true;
    } catch (error) {
      console.error('感應器服務初始化失敗:', error);
      return false;
    }
  }

  startTracking(onSensorDataUpdate?: (data: SensorData) => void): void {
    if (this.isTracking) {
      return;
    }

    this.onSensorDataUpdate = onSensorDataUpdate;
    this.isTracking = true;

    // 開始加速度計追蹤
    this.accelerometerSubscription = accelerometer.subscribe(({ x, y, z, timestamp }) => {
      this.updateSensorData('accelerometer', { x, y, z }, timestamp);
    });

    // 開始陀螺儀追蹤
    this.gyroscopeSubscription = gyroscope.subscribe(({ x, y, z, timestamp }) => {
      this.updateSensorData('gyroscope', { x, y, z }, timestamp);
    });

    // 開始磁力計追蹤
    this.magnetometerSubscription = magnetometer.subscribe(({ x, y, z, timestamp }) => {
      this.updateSensorData('magnetometer', { x, y, z }, timestamp);
    });

    console.log('感應器追蹤已開始');
  }

  stopTracking(): void {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.unsubscribe();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.unsubscribe();
      this.gyroscopeSubscription = null;
    }

    if (this.magnetometerSubscription) {
      this.magnetometerSubscription.unsubscribe();
      this.magnetometerSubscription = null;
    }

    this.isTracking = false;
    this.onSensorDataUpdate = undefined;
    console.log('感應器追蹤已停止');
  }

  private updateSensorData(
    sensorType: 'accelerometer' | 'gyroscope' | 'magnetometer',
    data: { x: number; y: number; z: number },
    timestamp: number
  ): void {
    if (!this.sensorData) {
      this.sensorData = {
        accelerometer: { x: 0, y: 0, z: 0 },
        gyroscope: { x: 0, y: 0, z: 0 },
        magnetometer: { x: 0, y: 0, z: 0 },
        timestamp: new Date(),
      };
    }

    // 更新對應的感應器數據
    switch (sensorType) {
      case 'accelerometer':
        this.sensorData.accelerometer = data;
        break;
      case 'gyroscope':
        this.sensorData.gyroscope = data;
        break;
      case 'magnetometer':
        this.sensorData.magnetometer = data;
        break;
    }

    this.sensorData.timestamp = new Date(timestamp);

    // 通知數據更新
    if (this.onSensorDataUpdate) {
      this.onSensorDataUpdate(this.sensorData);
    }
  }

  // 檢測活動類型
  detectActivityType(sensorData: SensorData): string {
    const { accelerometer, gyroscope } = sensorData;

    // 計算加速度的總量
    const accelerationMagnitude = Math.sqrt(
      accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
    );

    // 計算角速度的總量
    const angularVelocityMagnitude = Math.sqrt(
      gyroscope.x ** 2 + gyroscope.y ** 2 + gyroscope.z ** 2
    );

    // 基於感應器數據判斷活動類型
    if (accelerationMagnitude < 10.5) {
      return '靜止';
    } else if (accelerationMagnitude < 12.5 && angularVelocityMagnitude < 0.5) {
      return '步行';
    } else if (accelerationMagnitude < 15 && angularVelocityMagnitude < 1.0) {
      return '跑步';
    } else if (angularVelocityMagnitude > 2.0) {
      return '騎車';
    } else if (accelerationMagnitude > 15) {
      return '開車';
    } else {
      return '未知活動';
    }
  }

  // 計算步數（簡化版本）
  calculateSteps(accelerometerData: { x: number; y: number; z: number }[]): number {
    let steps = 0;
    let lastMagnitude = 0;
    let isPeak = false;

    for (let i = 1; i < accelerometerData.length; i++) {
      const current = accelerometerData[i];
      const magnitude = Math.sqrt(current.x ** 2 + current.y ** 2 + current.z ** 2);

      // 檢測峰值
      if (magnitude > lastMagnitude && magnitude > 12) {
        isPeak = true;
      } else if (magnitude < lastMagnitude && isPeak && magnitude < 10) {
        steps++;
        isPeak = false;
      }

      lastMagnitude = magnitude;
    }

    return steps;
  }

  // 檢測設備方向
  detectOrientation(accelerometer: { x: number; y: number; z: number }): string {
    const { x, y, z } = accelerometer;

    if (Math.abs(z) > Math.abs(x) && Math.abs(z) > Math.abs(y)) {
      return z > 0 ? '正面朝上' : '背面朝上';
    } else if (Math.abs(x) > Math.abs(y)) {
      return x > 0 ? '右側朝上' : '左側朝上';
    } else {
      return y > 0 ? '頂部朝上' : '底部朝上';
    }
  }

  getCurrentSensorData(): SensorData | null {
    return this.sensorData;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // 清理資源
  cleanup(): void {
    this.stopTracking();
  }
}

export const sensorService = SensorService.getInstance();
