// Vercel Serverless Function for sending feedback emails
const nodemailer = require('nodemailer');

// 確保在Vercel環境中正確載入nodemailer
if (typeof nodemailer.createTransporter !== 'function') {
    console.error('nodemailer not properly loaded');
}

export default async function handler(req, res) {
    // 只允許POST請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userEmail, feedbackContent } = req.body;
        
        console.log('收到反饋郵件請求:', { userEmail, feedbackContent });
        console.log('環境變數檢查:', {
            EMAIL_USER: process.env.EMAIL_USER ? '已設定' : '未設定',
            EMAIL_PASS: process.env.EMAIL_PASS ? '已設定' : '未設定'
        });
        
        // 檢查環境變數
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('環境變數未設定');
            return res.status(500).json({
                success: false,
                error: '郵件服務配置錯誤'
            });
        }
        
        console.log('環境變數詳細檢查:', {
            EMAIL_USER: process.env.EMAIL_USER,
            EMAIL_PASS: process.env.EMAIL_PASS ? '已設定' : '未設定',
            EMAIL_PASS_LENGTH: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL
        });
        
        // 測試環境變數是否正確載入
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('環境變數未正確載入');
            return res.status(500).json({
                success: false,
                error: '環境變數未正確載入，請檢查Vercel設定'
            });
        }
        
        // 配置郵件發送器 - 使用更寬鬆的配置
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // 測試SMTP連接
        console.log('測試SMTP連接...');
        try {
            await transporter.verify();
            console.log('✅ SMTP連接成功');
        } catch (verifyError) {
            console.error('❌ SMTP連接失敗:', verifyError.message);
            return res.status(500).json({
                success: false,
                error: 'SMTP連接失敗: ' + verifyError.message
            });
        }
        
        // 郵件內容
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        const result = await transporter.sendMail(mailOptions);
        
        console.log('反饋郵件發送成功:', result.messageId);
        
        res.status(200).json({
            success: true,
            message: '反饋已成功發送',
            messageId: result.messageId
        });
        
            } catch (error) {
                console.error('反饋郵件發送失敗:', error);
                console.error('錯誤詳情:', {
                    message: error.message,
                    code: error.code,
                    response: error.response,
                    stack: error.stack
                });
                
                // 檢查是否是認證錯誤
                if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
                    console.error('Gmail認證失敗，請檢查應用程式密碼');
                    return res.status(500).json({
                        success: false,
                        error: 'Gmail認證失敗，請檢查應用程式密碼設定'
                    });
                }
                
                res.status(500).json({
                    success: false,
                    error: '郵件發送失敗，請稍後再試',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
}
