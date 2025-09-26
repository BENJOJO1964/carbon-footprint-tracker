// 載入環境變數
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const port = process.env.PORT || 3001;

// 環境變數檢查
console.log('Environment variables loaded:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
});

// 中間件
app.use(cors());
app.use(express.json());

// 配置郵件發送器
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'rbben521@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// 反饋郵件發送API
app.post('/api/send-feedback', async (req, res) => {
    try {
        const { userEmail, feedbackContent } = req.body;
        
        console.log('收到反饋郵件請求:', { userEmail, feedbackContent });
        
        // 郵件內容
        const mailOptions = {
            from: process.env.EMAIL_USER || 'rbben521@gmail.com',
            to: 'rbben521@gmail.com',
            subject: '減碳日記 - 用戶意見反饋',
            html: `
                <h2>減碳日記 - 用戶意見反饋</h2>
                <p><strong>用戶Email:</strong> ${userEmail}</p>
                <p><strong>反饋內容:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${feedbackContent.replace(/\n/g, '<br>')}
                </div>
                <p><em>發送時間: ${new Date().toLocaleString('zh-TW')}</em></p>
            `
        };
        
        // 發送郵件
        await transporter.sendMail(mailOptions);
        
        console.log('反饋郵件發送成功');
        
        res.json({
            success: true,
            message: '反饋已成功發送'
        });
        
    } catch (error) {
        console.error('反饋郵件發送失敗:', error);
        res.status(500).json({
            success: false,
            error: '郵件發送失敗，請稍後再試'
        });
    }
});

// 電子發票檢查API
app.post('/api/invoice/check', async (req, res) => {
    try {
        const { carrierCode, lastCheckTime } = req.body;
        
        console.log('收到發票檢查請求:', { carrierCode, lastCheckTime });
        
        // 這裡需要調用台灣電子發票API
        const invoices = await checkTaiwanInvoiceAPI(carrierCode, lastCheckTime);
        
        res.json({
            success: true,
            invoices: invoices
        });
        
    } catch (error) {
        console.error('發票檢查失敗:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// OCR分析API
app.post('/api/ocr/analyze', async (req, res) => {
    try {
        const { imageData } = req.body;
        
        console.log('收到OCR分析請求');
        
        // 這裡需要調用OCR API
        const result = await analyzeInvoiceOCR(imageData);
        
        res.json(result);
        
    } catch (error) {
        console.error('OCR分析失敗:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 電子發票檢查函數（真實API整合）
async function checkTaiwanInvoiceAPI(carrierCode, lastCheckTime) {
    // 財政部電子發票API配置
    const API_CONFIG = {
        baseURL: 'https://api.einvoice.nat.gov.tw/API',
        appID: process.env.INVOICE_APP_ID || 'YOUR_APP_ID', // 從環境變數讀取
        apiKey: process.env.INVOICE_API_KEY || 'YOUR_API_KEY' // 從環境變數讀取
    };
    
    try {
        console.log(`檢查載具 ${carrierCode} 的新發票，最後檢查時間: ${lastCheckTime}`);
        
        // 如果還沒有申請到API金鑰，返回空結果
        if (API_CONFIG.appID === 'YOUR_APP_ID' || API_CONFIG.apiKey === 'YOUR_API_KEY') {
            console.log('⚠️ 財政部API金鑰尚未配置，請先申請API金鑰');
            return [];
        }
        
        // 調用財政部電子發票API
        const axios = require('axios');
        
        const response = await axios.post(`${API_CONFIG.baseURL}/invoice-check`, {
            AppID: API_CONFIG.appID,
            APIKey: API_CONFIG.apiKey,
            CarrierCode: carrierCode,
            LastCheckTime: lastCheckTime
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10秒超時
        });
        
        if (response.data && response.data.success) {
            // 轉換API回應格式為我們需要的格式
            const invoices = response.data.invoices.map(invoice => ({
                storeName: invoice.sellerName || invoice.storeName,
                amount: parseFloat(invoice.amount) || 0,
                items: invoice.items || [],
                confidence: 0.95, // 官方API，信心度很高
                invoiceNumber: invoice.invoiceNumber,
                date: invoice.date,
                source: 'official' // 標記為官方API來源
            }));
            
            console.log(`✅ 從財政部API獲取到 ${invoices.length} 張新發票`);
            return invoices;
        } else {
            console.log('❌ 財政部API回應失敗:', response.data);
            return [];
        }
        
    } catch (error) {
        console.error('❌ 調用財政部API失敗:', error.message);
        
        // 如果是網路錯誤或API金鑰錯誤，返回空結果
        if (error.code === 'ENOTFOUND' || error.response?.status === 401) {
            console.log('⚠️ API金鑰可能無效或網路連線問題');
            return [];
        }
        
        // 其他錯誤也返回空結果，避免系統崩潰
        return [];
    }
}

// OCR分析函數 - 使用Tesseract.js（免費開源）
async function analyzeInvoiceOCR(imageData) {
    try {
        // 使用Tesseract.js進行OCR識別
        const { createWorker } = require('tesseract.js');
        
        const worker = await createWorker('chi_tra'); // 繁體中文
        const { data: { text } } = await worker.recognize(imageData);
        await worker.terminate();
        
        // 解析OCR結果，提取商店名稱和金額
        const result = parseInvoiceText(text);
        
        return {
            storeName: result.storeName,
            amount: result.amount,
            items: result.items,
            confidence: 0.8
        };
        
    } catch (error) {
        console.error('OCR識別失敗:', error);
        throw new Error('無法識別發票內容，請手動輸入');
    }
}

// 解析發票文字
function parseInvoiceText(text) {
    // 簡單的文字解析邏輯
    const lines = text.split('\n');
    let storeName = '';
    let amount = 0;
    let items = [];
    
    // 尋找商店名稱（通常在開頭幾行）
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes('有限公司') || lines[i].includes('股份有限公司') || 
            lines[i].includes('商店') || lines[i].includes('超商')) {
            storeName = lines[i].trim();
            break;
        }
    }
    
    // 尋找金額（通常包含「總計」、「合計」等關鍵字）
    for (const line of lines) {
        if (line.includes('總計') || line.includes('合計') || line.includes('金額')) {
            const match = line.match(/(\d+\.?\d*)/);
            if (match) {
                amount = parseFloat(match[1]);
                break;
            }
        }
    }
    
    return {
        storeName: storeName || '未知商店',
        amount: amount || 0,
        items: items
    };
}

app.listen(port, () => {
    console.log(`服務器運行在 http://localhost:${port}`);
});
