import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { Location, MovementData, MovementType } from '../types';

class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private isTracking = false;
  private currentLocation: Location | null = null;
  private lastLocation: Location | null = null;
  private movementBuffer: Location[] = [];
  private onLocationUpdate?: (location: Location) => void;
  private onMovementDetected?: (movement: MovementData) => void;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          '位置權限',
          '需要位置權限才能追蹤您的移動軌跡和計算碳足跡',
          [{ text: '確定' }]
        );
        return false;
      }

      // 獲取初始位置
      await this.getCurrentPosition();
      return true;
    } catch (error) {
      console.error('位置服務初始化失敗:', error);
      return false;
    }
  }

  private async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置權限',
          message: '碳足跡追蹤器需要存取您的位置資訊來計算移動距離和碳排放量',
          buttonNeutral: '稍後詢問',
          buttonNegative: '拒絕',
          buttonPositive: '允許',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS 權限在 Info.plist 中設定
  }

  async getCurrentPosition(): Promise<Location | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('獲取位置失敗:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  startTracking(
    onLocationUpdate?: (location: Location) => void,
    onMovementDetected?: (movement: MovementData) => void
  ): void {
    if (this.isTracking) {
      return;
    }

    this.onLocationUpdate = onLocationUpdate;
    this.onMovementDetected = onMovementDetected;
    this.isTracking = true;

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };

        this.updateLocation(location);
      },
      (error) => {
        console.error('位置追蹤錯誤:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // 10公尺
        interval: 5000, // 5秒
        fastestInterval: 2000, // 2秒
      }
    );
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.onLocationUpdate = undefined;
    this.onMovementDetected = undefined;
  }

  private updateLocation(location: Location): void {
    this.lastLocation = this.currentLocation;
    this.currentLocation = location;

    // 通知位置更新
    if (this.onLocationUpdate) {
      this.onLocationUpdate(location);
    }

    // 添加到移動緩衝區
    this.movementBuffer.push(location);

    // 保持緩衝區大小
    if (this.movementBuffer.length > 10) {
      this.movementBuffer.shift();
    }

    // 檢測移動
    if (this.lastLocation) {
      this.detectMovement();
    }
  }

  private detectMovement(): void {
    if (!this.lastLocation || !this.currentLocation) {
      return;
    }

    const distance = this.calculateDistance(
      this.lastLocation,
      this.currentLocation
    );

    const timeDiff = (this.currentLocation.timestamp.getTime() - 
                     this.lastLocation.timestamp.getTime()) / 1000 / 60; // 分鐘

    // 如果移動距離超過50公尺且時間間隔合理
    if (distance > 0.05 && timeDiff > 0.5 && timeDiff < 30) {
      const movementType = this.detectMovementType();
      const carbonFootprint = this.calculateTransportationCarbon(
        movementType,
        distance
      );

      const movement: MovementData = {
        id: Date.now().toString(),
        userId: 'current_user', // 應該從認證服務獲取
        type: movementType,
        startLocation: this.lastLocation,
        endLocation: this.currentLocation,
        distance,
        duration: timeDiff,
        carbonFootprint,
        timestamp: this.currentLocation.timestamp,
      };

      if (this.onMovementDetected) {
        this.onMovementDetected(movement);
      }
    }
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // 地球半徑（公里）
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    const lat1 = this.toRad(loc1.latitude);
    const lat2 = this.toRad(loc2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private detectMovementType(): MovementType {
    // 基於速度和加速度數據檢測移動類型
    // 這裡可以整合感應器數據來更準確地判斷
    const speed = this.calculateSpeed();
    
    if (speed < 5) return MovementType.WALKING;
    if (speed < 20) return MovementType.CYCLING;
    if (speed < 80) return MovementType.DRIVING;
    return MovementType.UNKNOWN;
  }

  private calculateSpeed(): number {
    if (!this.lastLocation || !this.currentLocation) {
      return 0;
    }

    const distance = this.calculateDistance(this.lastLocation, this.currentLocation);
    const timeDiff = (this.currentLocation.timestamp.getTime() - 
                     this.lastLocation.timestamp.getTime()) / 1000 / 3600; // 小時

    return timeDiff > 0 ? distance / timeDiff : 0; // km/h
  }

  private calculateTransportationCarbon(type: MovementType, distance: number): number {
    // 碳排放係數 (kg CO2/km)
    const emissionFactors = {
      [MovementType.WALKING]: 0,
      [MovementType.CYCLING]: 0,
      [MovementType.DRIVING]: 0.192, // 汽油車平均
      [MovementType.PUBLIC_TRANSPORT]: 0.089, // 公車/捷運平均
      [MovementType.FLYING]: 0.285, // 短程飛行
      [MovementType.UNKNOWN]: 0.1, // 預設值
    };

    return distance * emissionFactors[type];
  }

  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export const locationService = LocationService.getInstance();
