const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取通知列表
router.get('/', 
  validatePagination,
  async (req, res) => {
    try {
      // 這裡可以建立一個專門的通知模型
      // 目前模擬通知資料
      const notifications = [
        {
          id: '1',
          type: 'health_alert',
          title: '健康異常通知',
          message: '長者張三的血壓出現異常',
          isRead: false,
          createdAt: new Date(),
          data: {
            elderlyId: 'elderly1',
            elderlyName: '張三'
          }
        },
        {
          id: '2',
          type: 'attendance',
          title: '出勤通知',
          message: '長者李四已正常出勤',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000),
          data: {
            elderlyId: 'elderly2',
            elderlyName: '李四'
          }
        }
      ];

      res.json({
        success: true,
        data: { notifications }
      });
    } catch (error) {
      console.error('獲取通知列表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取通知列表時發生錯誤'
      });
    }
  }
);

// 標記通知為已讀
router.put('/:id/read', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      // 模擬標記通知為已讀
      res.json({
        success: true,
        message: '通知已標記為已讀'
      });
    } catch (error) {
      console.error('標記通知已讀錯誤:', error);
      res.status(500).json({
        success: false,
        message: '標記通知已讀時發生錯誤'
      });
    }
  }
);

// 標記所有通知為已讀
router.put('/read-all', 
  async (req, res) => {
    try {
      // 模擬標記所有通知為已讀
      res.json({
        success: true,
        message: '所有通知已標記為已讀'
      });
    } catch (error) {
      console.error('標記所有通知已讀錯誤:', error);
      res.status(500).json({
        success: false,
        message: '標記所有通知已讀時發生錯誤'
      });
    }
  }
);

// 刪除通知
router.delete('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      // 模擬刪除通知
      res.json({
        success: true,
        message: '通知已刪除'
      });
    } catch (error) {
      console.error('刪除通知錯誤:', error);
      res.status(500).json({
        success: false,
        message: '刪除通知時發生錯誤'
      });
    }
  }
);

// 獲取未讀通知數量
router.get('/unread-count', 
  async (req, res) => {
    try {
      // 模擬未讀通知數量
      const unreadCount = 3;

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      console.error('獲取未讀通知數量錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取未讀通知數量時發生錯誤'
      });
    }
  }
);

module.exports = router;

