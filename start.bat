@echo off
echo ========================================
echo 日照系統 - 啟動服務
echo ========================================

echo.
echo 檢查 Docker 是否運行...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo 錯誤: Docker 未啟動，請先啟動 Docker Desktop
    pause
    exit /b 1
)

echo.
echo 啟動所有服務...
docker-compose up -d

echo.
echo 等待服務啟動...
timeout /t 10 /nobreak >nul

echo.
echo 檢查服務狀態...
docker-compose ps

echo.
echo ========================================
echo 服務已啟動！
echo ========================================
echo.
echo 服務網址:
echo - 前端: http://localhost:3000
echo - 後端 API: http://localhost:5000
echo - 資料庫: localhost:27017
echo.
echo 查看即時日誌: docker-compose logs -f
echo 停止服務: stop.bat
echo.
pause


