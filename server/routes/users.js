const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateUser, validateMongoId, validatePagination } = require('../middleware/validation');

// 所有路由都需要認證
router.use(authenticateToken);

// 獲取所有用戶列表（管理員）
router.get('/', 
  requireRole('admin'),
  validatePagination,
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { page = 1, limit = 10, search = '', role = '' } = req.query;

      const query = { isActive: true };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) {
        query.role = role;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('獲取用戶列表錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶列表時發生錯誤'
      });
    }
  }
);

// 獲取單一用戶資料
router.get('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.params.id)
        .select('-password')
        .populate('relatedElderly.elderly', 'name idNumber photo');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的用戶'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('獲取用戶資料錯誤:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶資料時發生錯誤'
      });
    }
  }
);

// 建立新用戶（管理員）
router.post('/', 
  requireRole('admin'),
  validateUser,
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { sendWelcomeEmail } = require('../utils/email');
      
      const userData = req.body;
      const user = new User(userData);
      await user.save();

      // 發送歡迎郵件
      try {
        await sendWelcomeEmail(user);
      } catch (emailError) {
        console.error('發送歡迎郵件失敗:', emailError);
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: '用戶建立成功',
        data: { user: userResponse }
      });
    } catch (error) {
      console.error('建立用戶錯誤:', error);
      res.status(500).json({
        success: false,
        message: '建立用戶時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 更新用戶資料
router.put('/:id', 
  validateMongoId('id'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { id } = req.params;
      const updateData = req.body;

      // 不允許更新密碼（使用專門的密碼修改路由）
      delete updateData.password;

      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的用戶'
        });
      }

      res.json({
        success: true,
        message: '用戶資料更新成功',
        data: { user }
      });
    } catch (error) {
      console.error('更新用戶資料錯誤:', error);
      res.status(500).json({
        success: false,
        message: '更新用戶資料時發生錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '請聯繫系統管理員'
      });
    }
  }
);

// 停用/啟用用戶（管理員）
router.put('/:id/toggle-status', 
  requireRole('admin'),
  validateMongoId('id'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的用戶'
        });
      }

      user.isActive = !user.isActive;
      await user.save();

      res.json({
        success: true,
        message: `用戶已${user.isActive ? '啟用' : '停用'}`,
        data: { user }
      });
    } catch (error) {
      console.error('切換用戶狀態錯誤:', error);
      res.status(500).json({
        success: false,
        message: '切換用戶狀態時發生錯誤'
      });
    }
  }
);

// 刪除用戶（軟刪除）
router.delete('/:id', 
  requireRole('admin'),
  validateMongoId('id'),
  async (req, res) => {
    try {
      const User = require('../models/User');
      const { id } = req.params;

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '找不到指定的用戶'
        });
      }

      res.json({
        success: true,
        message: '用戶已刪除'
      });
    } catch (error) {
      console.error('刪除用戶錯誤:', error);
      res.status(500).json({
        success: false,
        message: '刪除用戶時發生錯誤'
      });
    }
  }
);

module.exports = router;

