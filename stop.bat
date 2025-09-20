@echo off
echo ========================================
echo 日照系統 - 停止服務
echo ========================================

echo.
echo 停止所有服務...
docker-compose down

echo.
echo 清理未使用的映像和容器...
docker system prune -f

echo.
echo ========================================
echo 服務已停止！
echo ========================================
echo.
echo 重新啟動: start.bat
echo 完整部署: deploy.bat
echo.
pause


