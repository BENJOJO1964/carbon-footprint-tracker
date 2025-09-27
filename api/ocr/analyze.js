// 真实OCR处理 - 不再使用模拟数据
async function realOCRProcessing(imageData) {
    // 这里应该调用真实的OCR服务
    // 目前返回错误，要求前端使用Tesseract.js
    
    throw new Error('请使用前端Tesseract.js进行真实OCR识别，此API已禁用模拟数据');
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
            
            // 调用真实OCR处理
            const ocrResult = await realOCRProcessing(imageData);
            
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
