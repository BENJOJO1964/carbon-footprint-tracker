#!/bin/bash

# 碳足跡追蹤器開發環境啟動腳本

echo "🌱 啟動碳足跡追蹤器開發環境..."

# 檢查Docker是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未運行，請先啟動Docker"
    exit 1
fi

# 進入部署目錄
cd deployment

# 停止現有服務
echo "🛑 停止現有服務..."
docker-compose -f docker-compose.dev.yml down

# 構建並啟動服務
echo "🔨 構建並啟動服務..."
docker-compose -f docker-compose.dev.yml up --build -d

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "📊 檢查服務狀態..."
docker-compose -f docker-compose.dev.yml ps

# 顯示訪問信息
echo ""
echo "🎉 服務啟動完成！"
echo ""
echo "📱 手機測試網址:"
echo "   後端API: http://172.20.10.6:3001"
echo "   AI服務:  http://172.20.10.6:5001"
echo "   健康檢查: http://172.20.10.6:3001/health"
echo ""
echo "💻 本機測試網址:"
echo "   後端API: http://localhost:3001"
echo "   AI服務:  http://localhost:5001"
echo "   健康檢查: http://localhost:3001/health"
echo ""
echo "📋 常用命令:"
echo "   查看日誌: docker-compose -f docker-compose.dev.yml logs -f"
echo "   停止服務: docker-compose -f docker-compose.dev.yml down"
echo "   重啟服務: docker-compose -f docker-compose.dev.yml restart"
echo ""
echo "🔧 開始測試您的碳足跡追蹤器吧！"
