// Vercel Serverless Function for sending feedback emails
const nodemailer = require('nodemailer');

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
        
        // 配置郵件發送器
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
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
        await transporter.sendMail(mailOptions);
        
        console.log('反饋郵件發送成功');
        
        res.status(200).json({
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
}
