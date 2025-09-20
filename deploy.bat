@echo off
echo ========================================
echo 日照系統 - 自動部署腳本
echo ========================================

echo.
echo [1/6] 檢查 Docker 是否安裝...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 錯誤: Docker 未安裝或未啟動
    pause
    exit /b 1
)
echo Docker 已安裝

echo.
echo [2/6] 檢查環境變數檔案...
if not exist "server\.env" (
    echo 警告: server\.env 檔案不存在，正在從範例複製...
    copy "server\env.example" "server\.env"
    echo 請記得編輯 server\.env 檔案設定正確的環境變數
)

echo.
echo [3/6] 停止現有容器...
docker-compose down

echo.
echo [4/6] 建置 Docker 映像...
docker-compose build --no-cache

echo.
echo [5/6] 啟動服務...
docker-compose up -d

echo.
echo [6/6] 檢查服務狀態...
timeout /t 5 /nobreak >nul
docker-compose ps

echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 服務網址:
echo - 前端: http://localhost:3000
echo - 後端 API: http://localhost:5000
echo - 資料庫: localhost:27017
echo.
echo 查看日誌: docker-compose logs -f
echo 停止服務: stop.bat
echo.
pause


