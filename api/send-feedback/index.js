// Vercel Serverless Function for sending feedback emails
// 使用Vercel專用的郵件服務
const { Resend } = require('resend');

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
        
        // 檢查Resend API Key
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY未設定');
            return res.status(500).json({
                success: false,
                error: '郵件服務配置錯誤'
            });
        }
        
        console.log('Resend API Key檢查:', {
            RESEND_API_KEY: process.env.RESEND_API_KEY ? '已設定' : '未設定',
            RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
            RESEND_API_KEY_PREFIX: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : '未設定',
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL
        });
        
        // 使用Resend API發送郵件（Vercel專用）
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('使用Resend API發送郵件...');
        
        // 發送郵件
        const result = await resend.emails.send({
            from: '減碳日記 <onboarding@resend.dev>',
            to: ['rbben521@gmail.com'],
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
        });
        
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
                
                // 檢查Resend API錯誤
                if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
                    console.error('Resend API Key無效或過期');
                    return res.status(500).json({
                        success: false,
                        error: 'Resend API Key無效或過期，請檢查設定'
                    });
                }
                
                if (error.message.includes('Rate limit')) {
                    console.error('Resend API 速率限制');
                    return res.status(500).json({
                        success: false,
                        error: '郵件發送頻率過高，請稍後再試'
                    });
                }
                
                res.status(500).json({
                    success: false,
                    error: '郵件發送失敗，請稍後再試',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
}
