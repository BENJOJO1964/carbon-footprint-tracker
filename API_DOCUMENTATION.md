# 碳足跡追蹤器 API 文檔

## 概述

碳足跡追蹤器提供完整的 RESTful API，用於管理用戶數據、追蹤移動記錄、處理發票掃描和計算碳足跡。

**基礎 URL**: `https://api.carbon-tracker.com/api`

## 認證

API 使用 JWT (JSON Web Token) 進行認證。在請求標頭中包含認證令牌：

```
Authorization: Bearer <your-jwt-token>
```

## 通用響應格式

### 成功響應
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 錯誤響應
```json
{
  "success": false,
  "error": "錯誤訊息",
  "details": [ ... ]
}
```

### 分頁響應
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasMore": true
    }
  }
}
```

## 認證 API

### 註冊用戶
```http
POST /auth/register
```

**請求體**:
```json
{
  "name": "張三",
  "email": "zhang@example.com",
  "password": "password123"
}
```

**響應**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "張三",
      "email": "zhang@example.com",
      "emailVerified": false,
      "preferences": { ... }
    },
    "token": "jwt_token_here"
  }
}
```

### 用戶登入
```http
POST /auth/login
```

**請求體**:
```json
{
  "email": "zhang@example.com",
  "password": "password123"
}
```

### 驗證 Token
```http
GET /auth/validate
Authorization: Bearer <token>
```

### 重設密碼
```http
POST /auth/reset-password
```

**請求體**:
```json
{
  "email": "zhang@example.com"
}
```

## 用戶管理 API

### 獲取用戶資料
```http
GET /user/profile
Authorization: Bearer <token>
```

### 更新用戶資料
```http
PUT /user/profile
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "name": "張三",
  "preferences": {
    "units": "metric",
    "language": "zh-TW",
    "notifications": {
      "daily": true,
      "weekly": true,
      "monthly": false,
      "achievements": true
    }
  }
}
```

### 修改密碼
```http
PUT /user/change-password
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### 上傳頭像
```http
POST /user/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

## 移動記錄 API

### 獲取移動記錄
```http
GET /movement?page=1&limit=20&type=driving&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**查詢參數**:
- `page`: 頁碼 (預設: 1)
- `limit`: 每頁數量 (預設: 20, 最大: 100)
- `type`: 移動類型 (walking, cycling, driving, public_transport, flying, unknown)
- `startDate`: 開始日期 (ISO 8601)
- `endDate`: 結束日期 (ISO 8601)

### 創建移動記錄
```http
POST /movement
Authorization: Bearer <token>
```

**請求體**:
```json
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
  "duration": 30,
  "metadata": {
    "vehicleType": "gasoline",
    "passengers": 1
  }
}
```

### 獲取移動統計
```http
GET /movement/stats/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**響應**:
```json
{
  "success": true,
  "data": {
    "totalDistance": 150.5,
    "totalDuration": 1800,
    "totalCarbonFootprint": 28.9,
    "averageSpeed": 25.5,
    "movementCount": 25,
    "typeBreakdown": [
      {
        "type": "driving",
        "count": 15,
        "totalDistance": 120.0,
        "totalCarbonFootprint": 23.0
      }
    ]
  }
}
```

### 批量創建移動記錄
```http
POST /movement/batch
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "movements": [
    {
      "type": "walking",
      "distance": 1.2,
      "duration": 15,
      "timestamp": "2024-01-01T08:00:00Z"
    },
    {
      "type": "driving",
      "distance": 10.5,
      "duration": 25,
      "timestamp": "2024-01-01T09:00:00Z"
    }
  ]
}
```

## 發票管理 API

### 獲取發票記錄
```http
GET /invoice?page=1&limit=20&type=scanned&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### 創建發票記錄
```http
POST /invoice
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "type": "scanned",
  "storeName": "全聯福利中心",
  "totalAmount": 285,
  "items": [
    {
      "name": "有機蔬菜",
      "quantity": 2,
      "price": 120,
      "category": "food",
      "carbonFootprint": 0.8
    },
    {
      "name": "牛奶",
      "quantity": 1,
      "price": 65,
      "category": "food",
      "carbonFootprint": 0.5
    }
  ],
  "imageUrl": "https://example.com/invoice.jpg"
}
```

### 上傳發票圖片
```http
POST /invoice/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**請求體**: 包含 `invoice` 檔案的 multipart 表單

**響應**:
```json
{
  "success": true,
  "data": {
    "storeName": "全聯福利中心",
    "totalAmount": 285,
    "items": [
      {
        "name": "有機蔬菜",
        "quantity": 2,
        "price": 120,
        "category": "food"
      }
    ],
    "carbonFootprint": 1.3,
    "confidence": 0.85,
    "rawText": "全聯福利中心\n有機蔬菜 x2 $120\n牛奶 x1 $65\n總計: $285"
  }
}
```

### 獲取發票統計
```http
GET /invoice/stats/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### 獲取商品類別分布
```http
GET /invoice/stats/category-distribution?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

## 碳足跡 API

### 獲取碳足跡記錄
```http
GET /carbon?page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### 獲取指定日期的碳足跡
```http
GET /carbon/date/2024-01-01
Authorization: Bearer <token>
```

**響應**:
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "total": 12.5,
    "breakdown": {
      "transportation": 6.2,
      "shopping": 3.8,
      "food": 1.5,
      "energy": 0.8,
      "other": 0.2
    },
    "dailyGoal": 20.0,
    "goalProgress": 62.5,
    "isGoalAchieved": true,
    "activities": [
      {
        "type": "transportation",
        "description": "開車上班",
        "carbonFootprint": 6.2,
        "timestamp": "2024-01-01T08:00:00Z"
      }
    ]
  }
}
```

### 計算碳足跡
```http
POST /carbon/calculate/2024-01-01
Authorization: Bearer <token>
```

### 獲取碳足跡統計
```http
GET /carbon/stats/overview?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### 獲取碳足跡趨勢
```http
GET /carbon/stats/trends?startDate=2024-01-01&endDate=2024-01-31&groupBy=week
Authorization: Bearer <token>
```

**響應**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "2024-W01",
      "total": 87.5,
      "transportation": 52.3,
      "shopping": 26.7,
      "food": 5.2,
      "energy": 2.8,
      "other": 0.5,
      "average": 12.5,
      "count": 7
    }
  ]
}
```

### 獲取排行榜
```http
GET /carbon/leaderboard?startDate=2024-01-01&endDate=2024-01-31&limit=10
Authorization: Bearer <token>
```

### 設定每日目標
```http
PUT /carbon/daily-goal
Authorization: Bearer <token>
```

**請求體**:
```json
{
  "goal": 15.0
}
```

## 分析 API

### 獲取儀表板數據
```http
GET /analytics/dashboard?period=week
Authorization: Bearer <token>
```

**響應**:
```json
{
  "success": true,
  "data": {
    "period": "week",
    "totalCarbonFootprint": 87.5,
    "averageDaily": 12.5,
    "trends": {
      "transportation": [6.2, 5.8, 7.1, 6.5, 5.9, 6.8, 7.3],
      "shopping": [3.8, 4.2, 3.5, 4.1, 3.9, 4.0, 3.7],
      "food": [1.5, 1.8, 1.2, 1.6, 1.4, 1.7, 1.3],
      "energy": [0.8, 0.9, 0.7, 0.8, 0.9, 0.8, 0.7]
    },
    "insights": [
      {
        "type": "tip",
        "title": "交通碳排放增加",
        "description": "您的交通碳排放比上週增加了 15%",
        "priority": "high"
      }
    ],
    "recommendations": [
      "建議多使用大眾運輸工具",
      "選擇步行或騎車代替短程開車"
    ]
  }
}
```

### 獲取分析報告
```http
GET /analytics/report?startDate=2024-01-01&endDate=2024-01-31&type=transportation
Authorization: Bearer <token>
```

### 獲取行為模式分析
```http
GET /analytics/behavior-patterns?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### 獲取環保成就
```http
GET /analytics/achievements
Authorization: Bearer <token>
```

### 獲取個人化建議
```http
GET /analytics/recommendations?category=transportation
Authorization: Bearer <token>
```

## AI 服務 API

### OCR 發票識別
```http
POST /ai/ocr/process
Content-Type: multipart/form-data
```

**請求體**: 包含 `image` 檔案的 multipart 表單

**響應**:
```json
{
  "success": true,
  "data": {
    "storeName": "全聯福利中心",
    "totalAmount": 285,
    "items": [
      {
        "name": "有機蔬菜",
        "quantity": 2,
        "price": 120,
        "category": "food"
      }
    ],
    "carbonFootprint": 1.3,
    "confidence": 0.85,
    "rawText": "全聯福利中心\n有機蔬菜 x2 $120\n牛奶 x1 $65\n總計: $285"
  },
  "processing_time": 2.5,
  "methods_used": {
    "tesseract": true,
    "easyocr": true,
    "google_vision": false
  }
}
```

### 碳足跡計算
```http
POST /ai/carbon/calculate
```

**請求體**:
```json
{
  "type": "transportation",
  "distance": 10.5,
  "vehicle_type": "gasoline",
  "passengers": 1
}
```

### 移動模式分析
```http
POST /ai/movement/analyze
```

**請求體**:
```json
{
  "movements": [
    {
      "type": "driving",
      "distance": 10.5,
      "duration": 25,
      "timestamp": "2024-01-01T08:00:00Z"
    }
  ]
}
```

### 生成環保建議
```http
POST /ai/recommendations/generate
```

**請求體**:
```json
{
  "carbon_data": {
    "total": 15.2,
    "breakdown": {
      "transportation": 8.5,
      "shopping": 4.2,
      "food": 1.8,
      "energy": 0.7
    }
  },
  "user_preferences": {
    "units": "metric",
    "language": "zh-TW"
  }
}
```

## 錯誤代碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 201 | 創建成功 |
| 400 | 請求錯誤 |
| 401 | 未認證 |
| 403 | 無權限 |
| 404 | 資源不存在 |
| 409 | 資源衝突 |
| 422 | 驗證失敗 |
| 429 | 請求過於頻繁 |
| 500 | 伺服器錯誤 |

## 速率限制

API 實施速率限制以防止濫用：

- **一般 API**: 每 15 分鐘最多 100 個請求
- **OCR API**: 每小時最多 50 個請求
- **上傳 API**: 每小時最多 20 個請求

超過限制時會返回 429 狀態碼。

## Webhook

### 事件類型
- `user.registered`: 用戶註冊
- `movement.created`: 移動記錄創建
- `invoice.processed`: 發票處理完成
- `carbon.calculated`: 碳足跡計算完成

### Webhook 格式
```json
{
  "event": "movement.created",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "userId": "user_id",
    "movementId": "movement_id",
    "type": "driving",
    "carbonFootprint": 2.1
  }
}
```

## SDK 和範例

### JavaScript/Node.js
```javascript
const CarbonTrackerAPI = require('carbon-tracker-sdk');

const api = new CarbonTrackerAPI({
  baseURL: 'https://api.carbon-tracker.com/api',
  token: 'your-jwt-token'
});

// 創建移動記錄
const movement = await api.movements.create({
  type: 'driving',
  distance: 10.5,
  duration: 25
});
```

### Python
```python
from carbon_tracker import CarbonTrackerAPI

api = CarbonTrackerAPI(
    base_url='https://api.carbon-tracker.com/api',
    token='your-jwt-token'
)

# 獲取碳足跡統計
stats = api.carbon.get_stats(
    start_date='2024-01-01',
    end_date='2024-01-31'
)
```

### React Native
```javascript
import { CarbonTrackerAPI } from 'carbon-tracker-rn';

const api = new CarbonTrackerAPI({
  baseURL: 'https://api.carbon-tracker.com/api',
  token: userToken
});

// 上傳發票圖片
const result = await api.invoices.upload(imageUri);
```

## 更新日誌

### v1.0.0 (2024-01-01)
- 初始版本發布
- 基本 CRUD 操作
- OCR 發票識別
- 碳足跡計算
- 移動追蹤

### v1.1.0 (2024-02-01)
- 新增分析 API
- 改進 OCR 準確性
- 新增批量操作
- 性能優化

## 支援

- **文檔**: https://docs.carbon-tracker.com
- **GitHub**: https://github.com/carbon-tracker/api
- **支援郵箱**: support@carbon-tracker.com
- **狀態頁面**: https://status.carbon-tracker.com
