import cv2
import numpy as np
import pytesseract
import easyocr
from PIL import Image
import re
import logging
from typing import Dict, List, Optional, Tuple
import os
from google.cloud import vision
import json

logger = logging.getLogger(__name__)

class OCRService:
    """OCR 服務類，用於處理發票和文檔的文本識別"""
    
    def __init__(self):
        self.easyocr_reader = easyocr.Reader(['ch_tra', 'en'])
        
        # 初始化 Google Vision API（如果可用）
        try:
            self.vision_client = vision.ImageAnnotatorClient()
            self.use_google_vision = True
        except Exception as e:
            logger.warning(f"Google Vision API 初始化失敗: {e}")
            self.use_google_vision = False
    
    def preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """預處理圖像以提高 OCR 準確性"""
        try:
            # 轉換為灰度圖
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image.copy()
            
            # 降噪
            denoised = cv2.medianBlur(gray, 3)
            
            # 增強對比度
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
            
            # 二值化
            _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return binary
        except Exception as e:
            logger.error(f"圖像預處理失敗: {e}")
            return image
    
    def extract_text_tesseract(self, image: np.ndarray) -> str:
        """使用 Tesseract 提取文本"""
        try:
            # 設定 Tesseract 配置
            config = '--oem 3 --psm 6 -l chi_tra+eng'
            
            # 提取文本
            text = pytesseract.image_to_string(image, config=config)
            
            return text.strip()
        except Exception as e:
            logger.error(f"Tesseract OCR 失敗: {e}")
            return ""
    
    def extract_text_easyocr(self, image: np.ndarray) -> List[Tuple[str, float]]:
        """使用 EasyOCR 提取文本"""
        try:
            results = self.easyocr_reader.readtext(image)
            return [(text, confidence) for (bbox, text, confidence) in results]
        except Exception as e:
            logger.error(f"EasyOCR 失敗: {e}")
            return []
    
    def extract_text_google_vision(self, image_bytes: bytes) -> str:
        """使用 Google Vision API 提取文本"""
        try:
            if not self.use_google_vision:
                return ""
            
            image = vision.Image(content=image_bytes)
            response = self.vision_client.text_detection(image=image)
            
            if response.error.message:
                logger.error(f"Google Vision API 錯誤: {response.error.message}")
                return ""
            
            texts = response.text_annotations
            if texts:
                return texts[0].description
            return ""
        except Exception as e:
            logger.error(f"Google Vision API 失敗: {e}")
            return ""
    
    def parse_invoice_data(self, text: str) -> Dict:
        """解析發票文本，提取關鍵信息"""
        try:
            invoice_data = {
                'store_name': '',
                'total_amount': 0.0,
                'date': '',
                'items': [],
                'confidence': 0.0
            }
            
            # 提取商店名稱（通常在發票開頭）
            store_patterns = [
                r'([^\n]+(?:商店|超市|便利商店|百貨|商場|市場|店))',
                r'([^\n]+(?:Store|Market|Shop|Mall))',
                r'統一超商|7-ELEVEN|全家|萊爾富|OK超商',
                r'家樂福|大潤發|愛買|全聯|頂好'
            ]
            
            for pattern in store_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    invoice_data['store_name'] = match.group(1).strip()
                    break
            
            # 提取總金額
            amount_patterns = [
                r'總計[：:]\s*(\d+(?:\.\d{2})?)',
                r'合計[：:]\s*(\d+(?:\.\d{2})?)',
                r'總額[：:]\s*(\d+(?:\.\d{2})?)',
                r'Total[：:]\s*(\d+(?:\.\d{2})?)',
                r'NT\$\s*(\d+(?:\.\d{2})?)',
                r'\$\s*(\d+(?:\.\d{2})?)'
            ]
            
            for pattern in amount_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        invoice_data['total_amount'] = float(match.group(1))
                        break
                    except ValueError:
                        continue
            
            # 提取日期
            date_patterns = [
                r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
                r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
                r'(\d{4}年\d{1,2}月\d{1,2}日)'
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, text)
                if match:
                    invoice_data['date'] = match.group(1)
                    break
            
            # 提取商品項目（簡化版本）
            lines = text.split('\n')
            items = []
            
            for line in lines:
                line = line.strip()
                # 尋找包含價格的行
                price_match = re.search(r'(\d+(?:\.\d{2})?)', line)
                if price_match and len(line) > 5:
                    # 簡單的商品名稱提取
                    item_name = re.sub(r'\d+(?:\.\d{2})?', '', line).strip()
                    if item_name and len(item_name) > 1:
                        try:
                            price = float(price_match.group(1))
                            items.append({
                                'name': item_name,
                                'price': price,
                                'quantity': 1
                            })
                        except ValueError:
                            continue
            
            invoice_data['items'] = items[:10]  # 限制最多10個商品
            
            return invoice_data
            
        except Exception as e:
            logger.error(f"發票數據解析失敗: {e}")
            return {
                'store_name': '',
                'total_amount': 0.0,
                'date': '',
                'items': [],
                'confidence': 0.0
            }
    
    def calculate_confidence(self, tesseract_text: str, easyocr_results: List, google_text: str) -> float:
        """計算 OCR 結果的置信度"""
        try:
            confidence_scores = []
            
            # Tesseract 置信度（基於文本長度）
            if tesseract_text:
                tesseract_confidence = min(len(tesseract_text) / 100, 1.0)
                confidence_scores.append(tesseract_confidence * 0.3)
            
            # EasyOCR 置信度
            if easyocr_results:
                avg_easyocr_confidence = sum(conf for _, conf in easyocr_results) / len(easyocr_results)
                confidence_scores.append(avg_easyocr_confidence * 0.4)
            
            # Google Vision 置信度（基於文本長度）
            if google_text:
                google_confidence = min(len(google_text) / 100, 1.0)
                confidence_scores.append(google_confidence * 0.3)
            
            return sum(confidence_scores) if confidence_scores else 0.0
            
        except Exception as e:
            logger.error(f"置信度計算失敗: {e}")
            return 0.0
    
    def process_invoice(self, image_file) -> Dict:
        """處理發票圖片，返回解析結果"""
        try:
            # 讀取圖片
            image_bytes = image_file.read()
            image_file.seek(0)  # 重置文件指針
            
            # 轉換為 OpenCV 格式
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("無法讀取圖片")
            
            # 預處理圖像
            processed_image = self.preprocess_image(image)
            
            # 使用多種 OCR 方法
            tesseract_text = self.extract_text_tesseract(processed_image)
            easyocr_results = self.extract_text_easyocr(image)
            google_text = self.extract_text_google_vision(image_bytes)
            
            # 合併文本結果
            combined_text = tesseract_text
            if easyocr_results:
                easyocr_text = ' '.join([text for text, _ in easyocr_results])
                combined_text += '\n' + easyocr_text
            if google_text:
                combined_text += '\n' + google_text
            
            # 解析發票數據
            invoice_data = self.parse_invoice_data(combined_text)
            
            # 計算置信度
            confidence = self.calculate_confidence(tesseract_text, easyocr_results, google_text)
            invoice_data['confidence'] = confidence
            
            # 添加原始文本
            invoice_data['raw_text'] = combined_text
            
            logger.info(f"OCR 處理完成，置信度: {confidence:.2f}")
            
            return {
                'success': True,
                'data': invoice_data,
                'processing_time': 0,  # 可以添加實際處理時間
                'methods_used': {
                    'tesseract': bool(tesseract_text),
                    'easyocr': bool(easyocr_results),
                    'google_vision': bool(google_text)
                }
            }
            
        except Exception as e:
            logger.error(f"發票 OCR 處理失敗: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': {
                    'store_name': '',
                    'total_amount': 0.0,
                    'date': '',
                    'items': [],
                    'confidence': 0.0,
                    'raw_text': ''
                }
            }
    
    def process_document(self, image_file, document_type: str = 'general') -> Dict:
        """處理一般文檔"""
        try:
            # 讀取圖片
            image_bytes = image_file.read()
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                raise ValueError("無法讀取圖片")
            
            # 預處理圖像
            processed_image = self.preprocess_image(image)
            
            # 提取文本
            text = self.extract_text_tesseract(processed_image)
            
            return {
                'success': True,
                'data': {
                    'text': text,
                    'document_type': document_type,
                    'confidence': min(len(text) / 100, 1.0)
                }
            }
            
        except Exception as e:
            logger.error(f"文檔 OCR 處理失敗: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': {
                    'text': '',
                    'document_type': document_type,
                    'confidence': 0.0
                }
            }
