// 測試Gmail SMTP連接
const nodemailer = require('nodemailer');

async function testGmailConnection() {
    console.log('開始測試Gmail SMTP連接...');
    
    // 配置郵件發送器
    const transporter = nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'rbben521@gmail.com',
            pass: 'hpxn hxdw fjap vizk'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    try {
        // 測試連接
        await transporter.verify();
        console.log('✅ Gmail SMTP連接成功！');
        
        // 發送測試郵件
        const result = await transporter.sendMail({
            from: 'rbben521@gmail.com',
            to: 'rbben521@gmail.com',
            subject: '測試郵件 - 減碳日記',
            text: '這是一封測試郵件，確認Gmail設定正確。'
        });
        
        console.log('✅ 測試郵件發送成功！', result.messageId);
        
    } catch (error) {
        console.error('❌ Gmail SMTP連接失敗:', error.message);
        console.error('錯誤詳情:', error);
    }
}

testGmailConnection();
