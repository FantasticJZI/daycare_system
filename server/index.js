const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.MOBILE_URL],
    methods: ['GET', 'POST']
  }
});

// 中間件
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.MOBILE_URL],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 每 15 分鐘最多 100 個請求
  message: '請求過於頻繁，請稍後再試'
});
app.use('/api/', limiter);

// 靜態檔案服務
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/elderly', require('./routes/elderly'));
app.use('/api/health', require('./routes/health'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/care', require('./routes/care'));
app.use('/api/family', require('./routes/family'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));

// Socket.io 連接處理
io.on('connection', (socket) => {
  console.log('用戶連接:', socket.id);
  
  // 加入特定房間（例如：家屬房間、照護人員房間）
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`用戶 ${socket.id} 加入房間: ${room}`);
  });
  
  // 離開房間
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`用戶 ${socket.id} 離開房間: ${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('用戶斷開連接:', socket.id);
  });
});

// 將 io 實例附加到 app 上，供路由使用
app.set('io', io);

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請聯繫系統管理員'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

// 資料庫連接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daycare_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ 資料庫連接成功');
})
.catch((err) => {
  console.error('❌ 資料庫連接失敗:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
  console.log(`📱 Socket.io 服務已啟動`);
});

module.exports = { app, io };

