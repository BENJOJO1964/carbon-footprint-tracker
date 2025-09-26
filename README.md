# 🌱 智能碳足跡偵測應用程式

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://python.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-61DAFB)](https://reactnative.dev/)

## 📱 專案概述

這是一個智能碳足跡偵測應用程式，能夠自動偵測並記錄用戶日常活動的碳排放量，包括購物、交通、旅行等行為。通過整合多種技術，為用戶提供準確的碳足跡計算和個性化的環保建議。

## ✨ 主要功能

### 🚗 智能移動追蹤
- **GPS定位追蹤**: 自動偵測交通方式和距離
- **感應器整合**: 利用加速度計、陀螺儀等感應器識別活動類型
- **實時軌跡記錄**: 記錄完整的移動路徑和時間
- **多種交通方式**: 支援步行、騎車、開車、大眾運輸、飛行等

### 🧾 發票智能識別
- **OCR技術掃描**: 掃描傳統發票，自動識別購物內容
- **電子發票整合**: 綁定發票載具，自動獲取購物明細
- **商品分類**: 自動識別商品類別並計算碳足跡
- **多語言支援**: 支援中文和英文發票識別

### 🤖 AI智能分析
- **行為模式分析**: AI分析用戶行為模式，識別習慣
- **個性化建議**: 提供針對性的減碳建議
- **預測分析**: 預測未來碳足跡趨勢
- **成就系統**: 環保成就和激勵機制

### 📊 數據視覺化
- **直觀儀表板**: 展示碳足跡統計和趨勢
- **多維度分析**: 按時間、類別、活動類型分析
- **比較功能**: 與歷史數據和目標比較
- **報告生成**: 生成詳細的環保報告

## 🏗️ 技術架構

### 前端技術
- **React Native**: 跨平台移動應用開發
- **TypeScript**: 類型安全的 JavaScript
- **React Navigation**: 導航管理
- **React Native Paper**: Material Design 組件
- **React Native Maps**: 地圖功能
- **React Native Charts**: 數據視覺化

### 後端技術
- **Node.js + Express**: 後端 API 服務
- **MongoDB**: 主要資料庫
- **Redis**: 快取和會話管理
- **JWT**: 用戶認證
- **Multer**: 檔案上傳處理
- **Winston**: 日誌管理

### AI 服務
- **Python + Flask**: AI 服務框架
- **TensorFlow/PyTorch**: 機器學習模型
- **OpenCV**: 圖像處理
- **Tesseract**: OCR 文字識別
- **EasyOCR**: 多語言 OCR
- **Google Vision API**: 雲端 OCR 服務

### 部署和基礎設施
- **Docker**: 容器化部署
- **Docker Compose**: 多服務編排
- **Nginx**: 反向代理和負載均衡
- **Prometheus + Grafana**: 監控和可視化

## 📁 專案結構

```
carbon/
├── frontend/                 # React Native 前端應用
│   ├── src/
│   │   ├── screens/         # 頁面組件
│   │   ├── components/      # 可重用組件
│   │   ├── services/        # API 服務
│   │   ├── types/          # TypeScript 類型定義
│   │   └── utils/          # 工具函數
│   ├── android/            # Android 配置
│   ├── ios/               # iOS 配置
│   └── package.json
├── backend/                # Node.js 後端服務
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/        # 資料模型
│   │   ├── routes/        # 路由定義
│   │   ├── middleware/    # 中介軟體
│   │   ├── services/      # 業務邏輯
│   │   ├── utils/         # 工具函數
│   │   └── database/      # 資料庫配置
│   └── package.json
├── ai-service/            # Python AI 服務
│   ├── services/          # AI 服務模組
│   │   ├── ocr_service.py      # OCR 服務
│   │   ├── carbon_calculator.py # 碳足跡計算
│   │   ├── movement_analyzer.py # 移動分析
│   │   └── recommendation_engine.py # 建議引擎
│   ├── models/            # 機器學習模型
│   ├── requirements.txt
│   └── app.py
├── deployment/            # 部署配置
│   ├── docker-compose.yml # Docker 編排
│   ├── nginx.conf        # Nginx 配置
│   ├── init-mongo.js     # MongoDB 初始化
│   └── Dockerfile        # 容器配置
├── docs/                 # 文檔
│   ├── API_DOCUMENTATION.md
│   └── INSTALLATION.md
└── README.md
```

## 🚀 快速開始

### 使用 Docker Compose（推薦）

```bash
# 克隆專案
git clone https://github.com/your-username/carbon-tracker.git
cd carbon-tracker

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
```

### 手動安裝

詳細安裝說明請參考 [INSTALLATION.md](./INSTALLATION.md)

## 📖 API 文檔

完整的 API 文檔請參考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔧 環境變數

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
```

### AI 服務
```env
FLASK_ENV=development
PORT=5000
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=your-google-api-key-here
```

## 🧪 測試

```bash
# 後端測試
cd backend
npm test

# AI 服務測試
cd ai-service
python -m pytest tests/

# 前端測試
cd frontend
npm test
```

## 📊 監控

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **API 健康檢查**: http://localhost:3000/health

## 🤝 貢獻

歡迎貢獻代碼！請遵循以下步驟：

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 開發團隊

- **前端開發**: React Native, TypeScript
- **後端開發**: Node.js, Express, MongoDB
- **AI/ML 開發**: Python, TensorFlow, OpenCV
- **DevOps**: Docker, Nginx, Prometheus

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 檔案了解詳情。

## 📞 支援

- **文檔**: [INSTALLATION.md](./INSTALLATION.md)
- **API 文檔**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **問題回報**: [GitHub Issues](https://github.com/your-username/carbon-tracker/issues)
- **討論**: [GitHub Discussions](https://github.com/your-username/carbon-tracker/discussions)

## 🌟 特色亮點

- ✅ **跨平台支援**: iOS 和 Android 原生應用
- ✅ **實時追蹤**: GPS 和感應器整合
- ✅ **智能識別**: OCR 發票掃描和商品識別
- ✅ **AI 分析**: 機器學習驅動的個性化建議
- ✅ **數據安全**: 端到端加密和隱私保護
- ✅ **可擴展性**: 微服務架構和容器化部署
- ✅ **監控完善**: 完整的監控和日誌系統

---

**讓我們一起為地球的未來努力！🌍💚**
