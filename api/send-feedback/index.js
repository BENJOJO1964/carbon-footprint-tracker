// Vercel Serverless Function for sending feedback emails
// 使用 Resend API 直接發送郵件
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // 只允許POST請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userEmail, feedbackContent } = req.body;
        
        console.log('收到反饋郵件請求:', { userEmail, feedbackContent });
        console.log('Resend API Key 狀態:', process.env.RESEND_API_KEY ? '已設定' : '未設定');
        
        // 檢查 Resend API Key
        if (!process.env.RESEND_API_KEY) {
            console.error('RESEND_API_KEY 未設定');
            return res.status(500).json({
                success: false,
                error: '郵件服務配置錯誤'
            });
        }
        
        console.log('使用 Resend API 發送郵件...');
        
        // 根據用戶語言設定郵件主題和內容
        const userAgent = req.headers['user-agent'] || '';
        const isEnglish = userAgent.includes('en') || userEmail.includes('@') && userEmail.split('@')[1].includes('com');
        const isSimplified = userAgent.includes('zh-CN') || userAgent.includes('zh_CN');
        
        let subject, html;
        
        if (isEnglish) {
            subject = 'Carbon Diary - User Feedback';
            html = `
                <h2>Carbon Diary - User Feedback</h2>
                <p><strong>User Email:</strong> ${userEmail}</p>
                <p><strong>Feedback Content:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${feedbackContent.replace(/\n/g, '<br>')}
                </div>
                <p><em>Sent time: ${new Date().toLocaleString('en-US')}</em></p>
            `;
        } else if (isSimplified) {
            subject = '减碳日记 - 用户意见反馈';
            html = `
                <h2>减碳日记 - 用户意见反馈</h2>
                <p><strong>用户Email:</strong> ${userEmail}</p>
                <p><strong>反馈内容:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${feedbackContent.replace(/\n/g, '<br>')}
                </div>
                <p><em>发送时间: ${new Date().toLocaleString('zh-CN')}</em></p>
            `;
        } else {
            subject = '減碳日記 - 用戶意見反饋';
            html = `
                <h2>減碳日記 - 用戶意見反饋</h2>
                <p><strong>用戶Email:</strong> ${userEmail}</p>
                <p><strong>反饋內容:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${feedbackContent.replace(/\n/g, '<br>')}
                </div>
                <p><em>發送時間: ${new Date().toLocaleString('zh-TW')}</em></p>
            `;
        }
        
        // 發送郵件
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev', // 使用 Resend 的預設驗證地址
            to: 'rbben521@gmail.com',
            subject: subject,
            html: html
        });
        
        if (error) {
            console.error('Resend 發送失敗:', error);
            throw error;
        }
        
        console.log('反饋郵件發送成功:', data.id);
        
        res.status(200).json({
            success: true,
            message: '反饋已成功發送',
            messageId: data.id
        });
        
    } catch (error) {
        console.error('反饋郵件發送失敗:', error);
        console.error('錯誤詳情:', {
            message: error.message,
            code: error.code,
            response: error.response
        });
        
        // 檢查 Resend API 錯誤
        if (error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
            console.error('Resend API Key 無效或過期');
            return res.status(500).json({
                success: false,
                error: 'Resend API Key 無效或過期，請檢查設定'
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
