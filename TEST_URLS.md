# 🌐 碳足跡追蹤器測試網址

## 📱 您的本機IP
**`172.20.10.6`**

## 🚀 測試網址

### 後端API服務
- **本機**: http://localhost:3001
- **手機**: http://172.20.10.6:3001
- **健康檢查**: http://172.20.10.6:3001/health

### AI服務
- **本機**: http://localhost:5001
- **手機**: http://172.20.10.6:5001
- **健康檢查**: http://172.20.10.6:5001/health

## 📋 快速測試命令

### 1. 註冊用戶
```bash
curl -X POST http://172.20.10.6:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"測試用戶","email":"test@example.com","password":"password123"}'
```

### 2. 登入
```bash
curl -X POST http://172.20.10.6:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. 健康檢查
```bash
curl http://172.20.10.6:3001/health
curl http://172.20.10.6:5001/health
```

## 🚀 啟動服務

```bash
# 使用Docker啟動
./start-dev.sh

# 或手動啟動
cd deployment
docker-compose -f docker-compose.dev.yml up -d
```

## 📱 手機測試

1. 確保手機和電腦在同一WiFi
2. 在手機瀏覽器打開: http://172.20.10.6:3001/health
3. 如果看到JSON響應，說明連接正常

## 🔧 故障排除

- 檢查防火牆設定
- 確認服務正在運行: `docker-compose -f docker-compose.dev.yml ps`
- 查看日誌: `docker-compose -f docker-compose.dev.yml logs -f`

---

**注意**: 端口已調整為3001和5001，避免與您現有的AI影片生成器服務衝突。
