export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // 這裡應該調用真實的OCR服務，比如Google Vision API
        // 目前返回一個錯誤，讓用戶知道需要真實的OCR服務
        console.log('OCR API called with image data length:', imageData.length);
        
        // 模擬OCR處理時間
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 返回錯誤，要求手動輸入
        return res.status(503).json({ 
            error: 'OCR服務未配置',
            message: '請手動輸入發票信息',
            requiresManualInput: true
        });
        
    } catch (error) {
        console.error('OCR API error:', error);
        return res.status(500).json({ 
            error: 'OCR處理失敗',
            message: error.message
        });
    }
}
