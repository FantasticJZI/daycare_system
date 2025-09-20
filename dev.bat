@echo off
echo ========================================
echo 日照系統 - 開發模式啟動
echo ========================================

echo.
echo 檢查 Node.js 是否安裝...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 錯誤: Node.js 未安裝
    pause
    exit /b 1
)

echo.
echo 檢查環境變數檔案...
if not exist "server\.env" (
    echo 正在從範例複製環境變數檔案...
    copy "server\env.example" "server\.env"
    echo 請記得編輯 server\.env 檔案
)

echo.
echo 安裝依賴套件...
call npm run install-all

echo.
echo 啟動開發服務...
echo 前端: http://localhost:3000
echo 後端: http://localhost:5000
echo 行動端: http://localhost:19006
echo.
echo 按 Ctrl+C 停止服務
echo.

call npm run dev


