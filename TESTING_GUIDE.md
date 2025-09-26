# 🧪 碳足跡追蹤器測試指南

## 📱 測試環境配置

### 本機IP地址
- **主機IP**: `172.20.10.6`
- **本地回環**: `127.0.0.1` 或 `localhost`

## 🌐 測試網址

### 後端API服務
```bash
# 本機測試
http://localhost:3001
http://127.0.0.1:3001

# 區域網路測試（手機可訪問）
http://172.20.10.6:3001
```

### AI服務
```bash
# 本機測試
http://localhost:5001
http://127.0.0.1:5001

# 區域網路測試（手機可訪問）
http://172.20.10.6:5001
```

### 健康檢查端點
```bash
# 後端健康檢查
http://172.20.10.6:3001/health

# AI服務健康檢查
http://172.20.10.6:5001/health
```

## 📱 手機測試配置

### 1. 確保手機和電腦在同一WiFi網路

### 2. 修改前端配置
編輯 `frontend/src/services/AuthService.ts`：

```typescript
// 將 API_BASE_URL 改為您的本機IP
const API_BASE_URL = 'http://172.20.10.6:3001/api';
```

### 3. 修改AI服務配置
編輯 `frontend/src/services/` 中的相關檔案：

```typescript
// AI服務URL
const AI_SERVICE_URL = 'http://172.20.10.6:5001';
```

## 🚀 啟動測試服務

### 方法1: 使用Docker Compose（推薦）
```bash
cd deployment

# 修改docker-compose.yml中的端口映射
# 將 ports 改為:
# ports:
#   - "0.0.0.0:3001:3001"  # 後端
#   - "0.0.0.0:5001:5001"  # AI服務

# 啟動服務
docker-compose up -d

# 查看服務狀態
docker-compose ps
```

### 方法2: 手動啟動
```bash
# 啟動後端服務
cd backend
npm install
npm run dev

# 啟動AI服務（新終端）
cd ai-service
pip install -r requirements.txt
python app.py

# 啟動前端（新終端）
cd frontend
npm install
npm start
```

## 📋 API測試端點

### 認證API
```bash
# 註冊用戶
POST http://172.20.10.6:3000/api/auth/register
Content-Type: application/json

{
  "name": "測試用戶",
  "email": "test@example.com",
  "password": "password123"
}

# 登入
POST http://172.20.10.6:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 移動記錄API
```bash
# 創建移動記錄
POST http://172.20.10.6:3000/api/movement
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "type": "driving",
  "startLocation": {
    "latitude": 25.0330,
    "longitude": 121.5654,
    "accuracy": 10,
    "timestamp": "2024-01-01T10:00:00Z"
  },
  "endLocation": {
    "latitude": 25.0400,
    "longitude": 121.5700,
    "accuracy": 10,
    "timestamp": "2024-01-01T10:30:00Z"
  },
  "distance": 5.2,
  "duration": 30
}
```

### 發票API
```bash
# 上傳發票圖片
POST http://172.20.10.6:3000/api/invoice/upload
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

# 檔案: invoice.jpg
```

### AI服務API
```bash
# OCR發票識別
POST http://172.20.10.6:5000/api/ocr/process
Content-Type: multipart/form-data

# 檔案: invoice.jpg

# 碳足跡計算
POST http://172.20.10.6:5000/api/carbon/calculate
Content-Type: application/json

{
  "type": "transportation",
  "distance": 10.5,
  "vehicle_type": "gasoline",
  "passengers": 1
}
```

## 🔧 手機應用測試

### React Native測試
```bash
# 啟動Metro服務器
cd frontend
npm start

# 在手機上運行
npm run android  # Android
npm run ios      # iOS
```

### 手機網路配置
1. 確保手機連接到與電腦相同的WiFi
2. 在手機瀏覽器中測試：
   - `http://172.20.10.6:3000/health`
   - `http://172.20.10.6:5000/health`

## 🛠️ 測試工具

### 使用Postman測試API
1. 下載並安裝Postman
2. 創建新的Collection
3. 設置Base URL: `http://172.20.10.6:3000/api`
4. 添加認證Header: `Authorization: Bearer <token>`

### 使用curl測試
```bash
# 測試健康檢查
curl http://172.20.10.6:3000/health

# 測試註冊
curl -X POST http://172.20.10.6:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"測試用戶","email":"test@example.com","password":"password123"}'
```

## 📊 監控和日誌

### 查看服務日誌
```bash
# Docker服務日誌
docker-compose logs -f backend
docker-compose logs -f ai-service

# 手動啟動的服務日誌
# 後端日誌會在終端顯示
# AI服務日誌會在終端顯示
```

### 監控端點
```bash
# Prometheus監控
http://172.20.10.6:9090

# Grafana儀表板
http://172.20.10.6:3001
# 用戶名: admin
# 密碼: admin123
```

## 🐛 常見問題排除

### 1. 手機無法訪問服務
- 檢查防火牆設定
- 確認IP地址正確
- 確保服務綁定到0.0.0.0而不是127.0.0.1

### 2. CORS錯誤
- 檢查後端CORS設定
- 確認FRONTEND_URL包含手機IP

### 3. 網路連接問題
```bash
# 測試網路連接
ping 172.20.10.6

# 測試端口是否開放
telnet 172.20.10.6 3000
telnet 172.20.10.6 5000
```

### 4. 服務啟動失敗
```bash
# 檢查端口是否被占用
lsof -i :3000
lsof -i :5000

# 殺死占用端口的進程
kill -9 <PID>
```

## 📱 手機測試檢查清單

- [ ] 手機和電腦在同一WiFi網路
- [ ] 後端服務運行在172.20.10.6:3000
- [ ] AI服務運行在172.20.10.6:5000
- [ ] 手機可以訪問健康檢查端點
- [ ] 前端應用可以連接到後端API
- [ ] OCR功能可以正常使用
- [ ] GPS定位功能正常
- [ ] 發票掃描功能正常

## 🔐 測試數據

### 測試用戶
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "測試用戶"
}
```

### 測試移動記錄
```json
{
  "type": "driving",
  "distance": 10.5,
  "duration": 25,
  "startLocation": {
    "latitude": 25.0330,
    "longitude": 121.5654,
    "accuracy": 10
  },
  "endLocation": {
    "latitude": 25.0400,
    "longitude": 121.5700,
    "accuracy": 10
  }
}
```

## 📞 測試支援

如果遇到問題，請檢查：
1. 網路連接
2. 服務狀態
3. 日誌輸出
4. 防火牆設定

---

**開始測試您的碳足跡追蹤器吧！🌱📱**
