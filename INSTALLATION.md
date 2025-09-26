# 碳足跡追蹤器 - 安裝指南

## 系統需求

### 開發環境
- Node.js 16+ 
- Python 3.8+
- MongoDB 4.4+
- Redis 6.0+
- React Native 開發環境
- Android Studio / Xcode

### 生產環境
- Docker & Docker Compose
- 至少 4GB RAM
- 至少 20GB 儲存空間
- SSL 證書（可選）

## 快速開始

### 1. 克隆專案
```bash
git clone https://github.com/your-username/carbon-tracker.git
cd carbon-tracker
```

### 2. 使用 Docker Compose 部署（推薦）

```bash
# 進入部署目錄
cd deployment

# 複製環境變數檔案
cp ../backend/env.example ../backend/.env

# 編輯環境變數
nano ../backend/.env

# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

### 3. 手動安裝

#### 後端 API 服務
```bash
cd backend

# 安裝依賴
npm install

# 複製環境變數檔案
cp env.example .env

# 編輯環境變數
nano .env

# 啟動開發服務器
npm run dev
```

#### AI 服務
```bash
cd ai-service

# 創建虛擬環境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安裝依賴
pip install -r requirements.txt

# 啟動服務
python app.py
```

#### 前端應用程式
```bash
cd frontend

# 安裝依賴
npm install

# iOS 設定
cd ios && pod install && cd ..

# 啟動 Metro 服務器
npm start

# 在另一個終端運行應用程式
npm run ios  # iOS
npm run android  # Android
```

## 環境變數設定

### 後端 (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/carbon-tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8081
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_VISION_API_KEY=your-google-vision-api-key-here
```

### AI 服務
```env
FLASK_ENV=development
PORT=5000
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=your-google-api-key-here
```

## 資料庫設定

### MongoDB
```bash
# 啟動 MongoDB
mongod --dbpath /path/to/your/db

# 創建資料庫和用戶
mongo
> use carbon-tracker
> db.createUser({
    user: "carbon-user",
    pwd: "carbon-password",
    roles: [{ role: "readWrite", db: "carbon-tracker" }]
  })
```

### Redis
```bash
# 啟動 Redis
redis-server

# 測試連接
redis-cli ping
```

## API 服務設定

### Google Cloud Vision API
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Vision API
4. 創建服務帳戶並下載 JSON 金鑰
5. 設定環境變數 `GOOGLE_APPLICATION_CREDENTIALS`

### 發票 API（台灣）
1. 前往 [財政部電子發票整合服務平台](https://www.einvoice.nat.gov.tw/)
2. 申請 API 金鑰
3. 設定環境變數 `INVOICE_API_KEY`

## 移動應用程式設定

### Android
1. 安裝 Android Studio
2. 設定 Android SDK
3. 創建虛擬設備或連接實體設備
4. 執行 `npm run android`

### iOS
1. 安裝 Xcode
2. 安裝 CocoaPods: `sudo gem install cocoapods`
3. 執行 `cd ios && pod install`
4. 執行 `npm run ios`

## 權限設定

### Android 權限 (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS 權限 (ios/CarbonTracker/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>此應用程式需要位置權限來追蹤您的移動軌跡</string>
<key>NSCameraUsageDescription</key>
<string>此應用程式需要相機權限來掃描發票</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>此應用程式需要相簿權限來選擇發票圖片</string>
```

## 測試

### 後端 API 測試
```bash
cd backend
npm test
```

### AI 服務測試
```bash
cd ai-service
python -m pytest tests/
```

### 前端測試
```bash
cd frontend
npm test
```

## 部署到生產環境

### 使用 Docker
```bash
# 構建映像
docker-compose build

# 啟動服務
docker-compose up -d

# 設定 SSL 證書
# 將證書檔案放在 deployment/ssl/ 目錄下
```

### 使用 PM2（Node.js 服務）
```bash
# 安裝 PM2
npm install -g pm2

# 啟動後端服務
cd backend
pm2 start ecosystem.config.js

# 啟動 AI 服務
cd ../ai-service
pm2 start ecosystem.config.js
```

## 監控和日誌

### 查看日誌
```bash
# Docker 日誌
docker-compose logs -f backend
docker-compose logs -f ai-service

# PM2 日誌
pm2 logs
```

### 監控面板
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin123)

## 故障排除

### 常見問題

1. **MongoDB 連接失敗**
   - 檢查 MongoDB 是否運行
   - 確認連接字串正確
   - 檢查防火牆設定

2. **Redis 連接失敗**
   - 檢查 Redis 是否運行
   - 確認端口 6379 可用

3. **OCR 功能無法使用**
   - 檢查 Google Vision API 金鑰
   - 確認網路連接
   - 檢查圖片格式和大小

4. **位置追蹤不準確**
   - 檢查 GPS 權限
   - 確認設備 GPS 設定
   - 檢查網路連接

### 日誌位置
- 後端日誌: `backend/logs/`
- AI 服務日誌: `ai-service/logs/`
- Docker 日誌: `docker-compose logs`

## 支援

如有問題，請：
1. 查看日誌檔案
2. 檢查 GitHub Issues
3. 聯繫開發團隊

## 更新

### 更新應用程式
```bash
# 拉取最新代碼
git pull origin main

# 重新構建和部署
docker-compose down
docker-compose build
docker-compose up -d
```

### 資料庫遷移
```bash
cd backend
npm run migrate
```
