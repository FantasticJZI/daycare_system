# 日照系統 - 長者日間照顧中心資訊管理平台

## 專案概述

這是一個專為長者日間照顧中心設計的綜合資訊管理平台，旨在同時滿足機構管理者、照護人員、家屬和長者本人的需求。

## 系統架構

### 前端應用
- **Web 後台** - 管理員、護理人員、社工使用
- **行動端 App** - 照服員打卡、即時紀錄
- **家屬端小程式/APP** - 查看長者出勤、活動、健康狀況

### 後端核心
- **使用者與角色管理** - 管理員/護理師/照服員/家屬/醫師顧問
- **資料庫** - 長者基本資料、病史、活動紀錄、健康數據
- **API 接口** - 與醫療系統、政府長照平台串接
- **即時通知** - LINE、APP 推播、簡訊

### 資料安全與法規遵循
- 個資保護（健保資料、長者健康紀錄）
- 權限分層（家屬只能看自己長輩資料）
- 備份與異地容災
- 符合衛福部長照 2.0 法規

## 主要功能模組

### 1. 長者基本資料與健康管理
- 個人基本檔案（病史、過敏史、聯絡人）
- 健康數據追蹤（血壓、血糖、心跳、體溫、用藥）
- 醫囑與護理紀錄

### 2. 日常活動與出勤
- 打卡系統（進出日照中心）
- 每日活動紀錄（運動、康樂、手作、復健）
- 飲食紀錄（午餐/點心/特殊飲食需求）
- 照護紀錄

### 3. 家屬互動
- APP/Web 查看每日紀錄
- 即時通知（突發狀況、就醫、體溫異常）
- 家屬留言或回饋

### 4. 機構管理
- 人員排班管理
- 出缺勤統計
- 成本與收費管理
- 政府報表匯出

## 技術棧

### 後端
- Node.js + Express
- MongoDB + Mongoose
- JWT 認證
- Socket.io 即時通訊
- Multer 檔案上傳

### 前端
- React + TypeScript
- Material-UI
- Redux Toolkit
- React Router
- Axios

### 行動端
- React Native
- Expo
- AsyncStorage

## 快速開始

### 環境需求
- Node.js 16+ 
- MongoDB 4.4+
- npm 或 yarn

### 安裝依賴
```bash
# 安裝所有依賴（後端、前端、行動端）
npm run install-all

# 或分別安裝
npm install                    # 根目錄依賴
cd server && npm install      # 後端依賴
cd ../client && npm install   # 前端依賴
cd ../mobile && npm install   # 行動端依賴
```

### 環境設定
1. 複製環境變數範例檔案：
```bash
cp server/env.example server/.env
```

2. 編輯 `server/.env` 檔案，設定以下變數：
```env
# 資料庫設定
MONGODB_URI=mongodb://localhost:27017/daycare_system

# JWT 設定
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# 伺服器設定
PORT=5000
NODE_ENV=development

# 前端 URL
CLIENT_URL=http://localhost:3000
MOBILE_URL=http://localhost:19006

# 郵件設定（可選）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 通知服務（可選）
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
FCM_SERVER_KEY=your_fcm_key
```

### 啟動服務

#### 開發模式（同時啟動後端和前端）
```bash
npm run dev
```

#### 分別啟動
```bash
# 啟動後端 API 伺服器
npm run server

# 啟動前端 Web 應用
npm run client

# 啟動行動端 App（需要 Expo CLI）
npm run mobile
```

#### 建置生產版本
```bash
# 建置前端
npm run build

# 啟動生產環境
npm start
```

### 資料庫初始化
1. 確保 MongoDB 服務正在運行
2. 後端啟動後會自動連接資料庫
3. 首次運行時會自動建立必要的索引

### 預設管理員帳號
系統啟動後，您可以透過 API 建立管理員帳號：
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "系統管理員",
    "email": "admin@daycare.com",
    "password": "admin123",
    "phone": "0912345678",
    "role": "admin"
  }'
```

## 專案結構

```
daycare_system/
├── server/                 # 後端 API
│   ├── controllers/        # 控制器
│   ├── models/            # 資料模型
│   ├── routes/            # 路由
│   ├── middleware/        # 中間件
│   ├── utils/             # 工具函數
│   └── config/            # 配置檔案
├── client/                # Web 前端
│   ├── src/
│   │   ├── components/    # React 組件
│   │   ├── pages/         # 頁面
│   │   ├── hooks/         # 自定義 Hooks
│   │   ├── store/         # Redux store
│   │   └── utils/         # 工具函數
│   └── public/
├── mobile/                # 行動端 App
│   ├── src/
│   │   ├── components/    # React Native 組件
│   │   ├── screens/       # 畫面
│   │   ├── navigation/    # 導航
│   │   └── services/      # API 服務
│   └── assets/
└── docs/                  # 文檔
```

## 使用說明

### 系統角色與權限

#### 系統管理員 (admin)
- 完整系統管理權限
- 用戶管理、角色分配
- 系統設定與維護
- 所有報表查看權限

#### 護理師 (nurse)
- 長者健康資料管理
- 健康記錄建立與審核
- 出勤記錄管理
- 報表查看與匯出

#### 照服員 (caregiver)
- 長者日常照護記錄
- 出勤打卡功能
- 活動參與管理
- 基本健康數據記錄

#### 家屬 (family)
- 查看相關長者資料
- 接收通知訊息
- 查看出勤與健康狀況
- 與照護人員溝通

#### 醫師顧問 (doctor)
- 健康記錄審核
- 醫療建議提供
- 長照評估參與

### 主要功能操作

#### 1. 長者管理
- **新增長者**：填寫基本資料、醫療資訊、照護需求
- **家屬管理**：新增/移除家屬，設定權限
- **長照評估**：定期評估長者照護等級
- **服務狀態**：管理長者服務狀態（等待、進行中、暫停、終止）

#### 2. 健康管理
- **生命徵象記錄**：血壓、心跳、體溫、血糖等
- **用藥管理**：用藥記錄、提醒設定
- **異常監控**：自動檢測異常數據並通知
- **醫療記錄**：症狀記錄、事件記錄、醫師巡診

#### 3. 出勤管理
- **打卡系統**：QR Code、RFID、手動打卡
- **請假管理**：請假申請、審核流程
- **接送記錄**：接送時間、司機資訊
- **出勤統計**：出勤率分析、遲到早退統計

#### 4. 活動管理
- **活動規劃**：建立活動、設定時間地點
- **參與者管理**：報名、取消、狀態更新
- **活動執行**：開始/結束活動、記錄執行狀況
- **效果評估**：參與者回饋、成效分析

#### 5. 家屬互動
- **即時通知**：健康異常、出勤狀況、活動更新
- **資料查看**：長者健康記錄、出勤記錄
- **訊息溝通**：與照護人員留言互動
- **推播設定**：個人化通知偏好設定

#### 6. 報表與統計
- **長照補助報表**：符合政府申報格式
- **出勤統計**：出勤率、請假統計
- **健康統計**：健康數據趨勢分析
- **財務報表**：收入支出、成本分析

### API 使用範例

#### 認證
```bash
# 登入
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@daycare.com", "password": "admin123"}'

# 獲取用戶資料
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 長者管理
```bash
# 獲取長者列表
curl -X GET "http://localhost:5000/api/elderly?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 建立長者
curl -X POST http://localhost:5000/api/elderly \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "張三",
    "idNumber": "A123456789",
    "birthDate": "1950-01-01",
    "gender": "male",
    "phone": "0912345678",
    "address": "台北市信義區"
  }'
```

#### 健康記錄
```bash
# 記錄生命徵象
curl -X POST http://localhost:5000/api/health \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "elderly": "ELDERLY_ID",
    "recordType": "vital_signs",
    "vitalSigns": {
      "bloodPressure": {"systolic": 120, "diastolic": 80},
      "heartRate": {"value": 72},
      "temperature": {"value": 36.5}
    },
    "notifyFamily": true
  }'
```

### 部署指南

#### 開發環境
1. 確保 MongoDB 運行在 localhost:27017
2. 執行 `npm run dev` 啟動開發服務
3. 前端訪問 http://localhost:3000
4. 後端 API 訪問 http://localhost:5000

#### 生產環境
1. 設定環境變數（資料庫、JWT 密鑰等）
2. 建置前端：`npm run build`
3. 啟動後端：`npm start`
4. 使用 PM2 或 Docker 進行進程管理

#### Docker 部署
```dockerfile
# Dockerfile 範例
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### 故障排除

#### 常見問題
1. **資料庫連接失敗**：檢查 MongoDB 服務狀態和連接字串
2. **JWT 錯誤**：確認 JWT_SECRET 設定正確
3. **檔案上傳失敗**：檢查上傳目錄權限
4. **通知發送失敗**：確認通知服務設定

#### 日誌查看
```bash
# 後端日誌
cd server && npm run dev

# 前端日誌
cd client && npm start
```

### 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案