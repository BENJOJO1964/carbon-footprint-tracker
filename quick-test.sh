#!/bin/bash

# 快速測試腳本

echo "🧪 碳足跡追蹤器快速測試"

# 獲取本機IP
LOCAL_IP="172.20.10.6"

echo "📱 測試網址:"
echo "   後端API: http://$LOCAL_IP:3001"
echo "   AI服務:  http://$LOCAL_IP:5001"
echo ""

# 測試健康檢查
echo "🔍 測試健康檢查..."

# 測試後端健康檢查
echo "測試後端服務..."
if curl -s http://$LOCAL_IP:3001/health > /dev/null; then
    echo "✅ 後端服務正常"
else
    echo "❌ 後端服務異常"
fi

# 測試AI服務健康檢查
echo "測試AI服務..."
if curl -s http://$LOCAL_IP:5001/health > /dev/null; then
    echo "✅ AI服務正常"
else
    echo "❌ AI服務異常"
fi

echo ""
echo "📋 API測試命令:"

# 註冊測試用戶
echo "1. 註冊測試用戶:"
echo "curl -X POST http://$LOCAL_IP:3001/api/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"測試用戶\",\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo ""

# 登入測試
echo "2. 登入測試:"
echo "curl -X POST http://$LOCAL_IP:3001/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"
echo ""

# OCR測試
echo "3. OCR發票識別測試:"
echo "curl -X POST http://$LOCAL_IP:5001/api/ocr/process \\"
echo "  -F 'image=@/path/to/invoice.jpg'"
echo ""

# 碳足跡計算測試
echo "4. 碳足跡計算測試:"
echo "curl -X POST http://$LOCAL_IP:5001/api/carbon/calculate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"type\":\"transportation\",\"distance\":10.5,\"vehicle_type\":\"gasoline\",\"passengers\":1}'"
echo ""

echo "📱 手機測試步驟:"
echo "1. 確保手機和電腦在同一WiFi網路"
echo "2. 在手機瀏覽器打開: http://$LOCAL_IP:3001/health"
echo "3. 如果看到健康檢查響應，說明網路連接正常"
echo "4. 使用React Native應用進行完整測試"
echo ""

echo "🔧 故障排除:"
echo "- 如果無法訪問，檢查防火牆設定"
echo "- 確保服務正在運行: docker-compose -f docker-compose.dev.yml ps"
echo "- 查看服務日誌: docker-compose -f docker-compose.dev.yml logs -f"
echo ""

echo "🌱 開始測試您的碳足跡追蹤器吧！"
