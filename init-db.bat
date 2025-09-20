@echo off
echo ========================================
echo 日照系統 - 資料庫初始化
echo ========================================

echo.
echo 等待 MongoDB 啟動...
timeout /t 10 /nobreak >nul

echo.
echo 連接到 MongoDB...
docker exec -it daycare_mongodb mongosh --eval "
use daycare_system;
db.createUser({
  user: 'daycare_user',
  pwd: 'daycare_password',
  roles: [
    { role: 'readWrite', db: 'daycare_system' }
  ]
});

print('資料庫用戶建立完成');
print('用戶名: daycare_user');
print('密碼: daycare_password');
print('資料庫: daycare_system');
"

echo.
echo 建立基本索引...
docker exec -it daycare_mongodb mongosh daycare_system --eval "
db.users.createIndex({ email: 1 }, { unique: true });
db.elderly.createIndex({ idNumber: 1 }, { unique: true });
db.healthRecords.createIndex({ elderly: 1, createdAt: -1 });
db.attendance.createIndex({ elderly: 1, date: -1 });
db.activities.createIndex({ date: -1 });
print('基本索引建立完成');
"

echo.
echo ========================================
echo 資料庫初始化完成！
echo ========================================
echo.
echo 預設管理員帳號建立中...
echo 請使用以下 API 建立管理員帳號:
echo.
echo curl -X POST http://localhost:5000/api/auth/register ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"name\": \"系統管理員\", \"email\": \"admin@daycare.com\", \"password\": \"admin123\", \"phone\": \"0912345678\", \"role\": \"admin\"}"
echo.
pause


