# OCR服務申請指南

## Google Vision API申請步驟

### 1. 創建Google Cloud帳號
- 前往：https://console.cloud.google.com/
- 使用Google帳號登入
- 創建新專案

### 2. 啟用Vision API
- 在Google Cloud Console中
- 選擇「API和服務」→「程式庫」
- 搜索「Vision API」
- 點擊「啟用」

### 3. 創建API金鑰
- 選擇「API和服務」→「憑證」
- 點擊「建立憑證」→「API金鑰」
- 複製API金鑰

### 4. 設定配額限制（避免超額收費）
- 在「API和服務」→「配額」中
- 設定每日請求限制
- 建議設定為100次/天（免費額度內）

## 費用說明
- 每月前1,000次請求免費
- 超過後每1,000次請求約$1.50 USD
- 建議設定配額限制避免超額

## 替代方案
如果不想申請Google API，可以使用：
1. **Tesseract.js** - 免費開源OCR
2. **Azure Computer Vision** - 微軟提供
3. **百度OCR API** - 中文識別較好
