#!/usr/bin/env python3
import http.server
import ssl
import socketserver
import os

# 創建自簽名證書（僅用於開發）
def create_self_signed_cert():
    import subprocess
    import tempfile
    
    # 創建臨時目錄
    temp_dir = tempfile.mkdtemp()
    key_file = os.path.join(temp_dir, 'server.key')
    cert_file = os.path.join(temp_dir, 'server.crt')
    
    # 生成自簽名證書
    subprocess.run([
        'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', key_file,
        '-out', cert_file, '-days', '365', '-nodes', '-subj',
        '/C=TW/ST=Taiwan/L=Taipei/O=CarbonTracker/CN=localhost'
    ], check=True, capture_output=True)
    
    return key_file, cert_file

# 設置服務器
PORT = 3003
Handler = http.server.SimpleHTTPRequestHandler

try:
    # 嘗試創建自簽名證書
    key_file, cert_file = create_self_signed_cert()
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        # 創建SSL上下文
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(cert_file, key_file)
        
        # 包裝socket為SSL
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"HTTPS服務器運行在 https://0.0.0.0:{PORT}")
        print(f"請使用 https://172.20.10.6:{PORT} 訪問")
        print("注意：瀏覽器會顯示證書警告，請點擊「繼續訪問」")
        
        httpd.serve_forever()
        
except Exception as e:
    print(f"HTTPS服務器啟動失敗: {e}")
    print("回退到HTTP服務器...")
    
    # 回退到HTTP
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print(f"HTTP服務器運行在 http://0.0.0.0:{PORT}")
        print(f"請使用 http://172.20.10.6:{PORT} 訪問")
        httpd.serve_forever()
