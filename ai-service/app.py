from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# 載入環境變數
load_dotenv()

# 設定日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 導入服務模組
from services.ocr_service import OCRService
from services.carbon_calculator import CarbonCalculator
from services.movement_analyzer import MovementAnalyzer
from services.recommendation_engine import RecommendationEngine
from services.data_processor import DataProcessor

# 初始化服務
ocr_service = OCRService()
carbon_calculator = CarbonCalculator()
movement_analyzer = MovementAnalyzer()
recommendation_engine = RecommendationEngine()
data_processor = DataProcessor()

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查端點"""
    return jsonify({
        'status': 'healthy',
        'service': 'carbon-ai-service',
        'version': '1.0.0'
    })

@app.route('/api/ocr/process', methods=['POST'])
def process_invoice_ocr():
    """處理發票 OCR 識別"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': '沒有上傳圖片'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': '沒有選擇檔案'}), 400
        
        # 處理 OCR
        result = ocr_service.process_invoice(image_file)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        logger.error(f'OCR 處理錯誤: {str(e)}')
        return jsonify({'error': 'OCR 處理失敗'}), 500

@app.route('/api/carbon/calculate', methods=['POST'])
def calculate_carbon_footprint():
    """計算碳足跡"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        # 計算碳足跡
        result = carbon_calculator.calculate_footprint(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        logger.error(f'碳足跡計算錯誤: {str(e)}')
        return jsonify({'error': '碳足跡計算失敗'}), 500

@app.route('/api/movement/analyze', methods=['POST'])
def analyze_movement():
    """分析移動模式"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        # 分析移動模式
        result = movement_analyzer.analyze_patterns(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        logger.error(f'移動分析錯誤: {str(e)}')
        return jsonify({'error': '移動分析失敗'}), 500

@app.route('/api/recommendations/generate', methods=['POST'])
def generate_recommendations():
    """生成環保建議"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        # 生成建議
        result = recommendation_engine.generate_recommendations(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        logger.error(f'建議生成錯誤: {str(e)}')
        return jsonify({'error': '建議生成失敗'}), 500

@app.route('/api/data/process', methods=['POST'])
def process_user_data():
    """處理用戶數據"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        # 處理數據
        result = data_processor.process_data(data)
        
        return jsonify({
            'success': True,
            'data': result
        })
    
    except Exception as e:
        logger.error(f'數據處理錯誤: {str(e)}')
        return jsonify({'error': '數據處理失敗'}), 500

@app.route('/api/insights/generate', methods=['POST'])
def generate_insights():
    """生成數據洞察"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': '沒有提供數據'}), 400
        
        # 生成洞察
        insights = []
        
        # 分析碳足跡趨勢
        if 'carbon_data' in data:
            carbon_insights = carbon_calculator.generate_insights(data['carbon_data'])
            insights.extend(carbon_insights)
        
        # 分析移動模式
        if 'movement_data' in data:
            movement_insights = movement_analyzer.generate_insights(data['movement_data'])
            insights.extend(movement_insights)
        
        # 生成建議
        recommendations = recommendation_engine.generate_recommendations(data)
        
        return jsonify({
            'success': True,
            'data': {
                'insights': insights,
                'recommendations': recommendations
            }
        })
    
    except Exception as e:
        logger.error(f'洞察生成錯誤: {str(e)}')
        return jsonify({'error': '洞察生成失敗'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '端點不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '內部伺服器錯誤'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f'啟動 AI 服務，端口: {port}, 調試模式: {debug}')
    app.run(host='0.0.0.0', port=port, debug=debug)
