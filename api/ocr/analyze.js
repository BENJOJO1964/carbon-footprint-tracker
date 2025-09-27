// 簡單的OCR模擬器 - 基於圖像特徵分析
function simpleOCR(imageData) {
    // 這是一個簡化的OCR模擬，實際應用中應該使用真正的OCR服務
    // 基於圖像數據的簡單分析來模擬OCR結果
    
    const imageSize = imageData.length;
    
    // 根據圖像大小和特徵模擬不同的發票類型
    const invoiceTypes = [
        { storeName: '7-ELEVEN', amount: 65, items: ['飲料', '零食'] },
        { storeName: '全家便利商店', amount: 120, items: ['便當', '飲料'] },
        { storeName: '全聯福利中心', amount: 280, items: ['牛奶', '麵包', '蔬菜'] },
        { storeName: '家樂福', amount: 450, items: ['生鮮', '日用品'] },
        { storeName: '星巴克', amount: 150, items: ['咖啡', '蛋糕'] },
        { storeName: '麥當勞', amount: 180, items: ['套餐', '薯條'] }
    ];
    
    // 根據圖像大小選擇不同的發票類型
    const index = Math.floor((imageSize / 1000) % invoiceTypes.length);
    const selectedInvoice = invoiceTypes[index];
    
    // 添加一些隨機變化
    const variation = (Math.random() - 0.5) * 0.2; // ±10% 變化
    const amount = Math.round(selectedInvoice.amount * (1 + variation));
    
    return {
        storeName: selectedInvoice.storeName,
        amount: amount,
        items: selectedInvoice.items,
        date: new Date().toISOString(),
        confidence: 0.85 + Math.random() * 0.1 // 85-95% 信心度
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        console.log('🔍 OCR API called with image data length:', imageData.length);
        
        // 模擬OCR處理時間
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 使用簡單的OCR模擬器分析圖像
        const ocrResult = simpleOCR(imageData);
        
        console.log('✅ OCR識別結果:', ocrResult);
        
        return res.status(200).json({
            success: true,
            data: ocrResult,
            message: 'OCR識別成功'
        });
        
    } catch (error) {
        console.error('❌ OCR API error:', error);
        return res.status(500).json({ 
            error: 'OCR處理失敗',
            message: error.message
        });
    }
}
